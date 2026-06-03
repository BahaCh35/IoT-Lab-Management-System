<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ChatbotService
{
    private string $apiKey;
    private string $model;
    private string $apiUrl;

    public function __construct()
    {
        $this->apiKey = config('services.gemini.key');
        $this->model  = config('services.gemini.model', 'gemini-2.0-flash');
        $this->apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/{$this->model}:generateContent";
    }

    /**
     * Process a user message and return Nova's response.
     *
     * @param  User   $user     The authenticated user
     * @param  string $message  The user's new message
     * @param  array  $history  Prior messages [['role'=>'user'|'nova','text'=>'...']]
     * @return string
     */
    public function sendMessage(User $user, string $message, array $history = []): string
    {
        $systemPrompt = $this->buildSystemPrompt($user);
        $context      = $this->fetchContextForUser($user);
        $contents     = $this->buildContents($history, $message, $context);

        return $this->callGemini($systemPrompt, $contents);
    }

    // -------------------------------------------------------------------------
    // System Prompts
    // -------------------------------------------------------------------------

    private function buildSystemPrompt(User $user): string
    {
        $name       = $user->name;
        $department = $user->department ?? 'General';
        $role       = $user->role;

        $base = "You are Nova, the intelligent AI assistant for SmartLab — an IoT Laboratory Management System. "
              . "Always be concise, helpful, and professional. "
              . "Format lists and data clearly. "
              . "You are currently speaking with {$name}.";

        return match ($role) {
            'admin', 'lab-manager' => $base . " "
                . "You have full administrative access to all lab data. "
                . "You can help with equipment management, user oversight, analytics, reservations, "
                . "maintenance, storage, approval workflows, and any operational queries. "
                . "When contextual data is provided below, use it to give accurate, data-driven answers.",

            'engineer' => $base . " "
                . "You are assisting {$name}, an engineer in the {$department} department. "
                . "You may discuss their personal equipment checkouts and reservations, public lab and meeting room "
                . "information, lab schedules, equipment availability, and equipment locations. "
                . "Never reveal other users' private data, who specifically checked out equipment, admin-only analytics, "
                . "or privileged operational actions. If asked for private or admin-only data, politely decline and explain "
                . "you can only share the user's own activity plus public facility and equipment information.",

            'technician' => $base . " "
                . "You are assisting {$name}, a technician. "
                . "You may discuss assigned maintenance tasks, submitted parts requests, equipment maintenance history, "
                . "equipment status and location, and public lab and meeting room information needed to perform maintenance work. "
                . "Never reveal other users' private data, personal reservations, analytics dashboards, or administrative actions. "
                . "If asked for private or admin-only data, politely decline and explain you can only help with maintenance-related "
                . "work plus public facility and equipment information.",

            default => $base . " "
                . "You have guest-level access. You can answer general questions about how SmartLab works, "
                . "how to make reservations, how to request equipment, and public information about labs and meeting rooms. "
                . "You cannot access user-specific or administrative data.",
        };
    }

    // -------------------------------------------------------------------------
    // Context Fetching (Role-Scoped DB Queries)
    // -------------------------------------------------------------------------

    private function fetchContextForUser(User $user): string
    {
        try {
            return match ($user->role) {
                'admin', 'lab-manager' => $this->fetchAdminContext(),
                'engineer'             => $this->fetchEngineerContext($user),
                'technician'           => $this->fetchTechnicianContext($user),
                default                => $this->fetchGuestContext(),
            };
        } catch (\Throwable $e) {
            Log::warning('ChatbotService: failed to fetch context', ['error' => $e->getMessage()]);
            return '';
        }
    }

    private function fetchFacilityDirectory(): string
    {
        $labs = \App\Models\Lab::select('name', 'floor', 'capacity', 'is_active')
            ->orderBy('name')
            ->get();

        $meetingRooms = \App\Models\MeetingRoom::select('name', 'floor', 'location', 'capacity', 'is_active')
            ->orderBy('name')
            ->get();

        $lines = ["[Facility Directory]"];

        $lines[] = "  Labs:";
        if ($labs->isEmpty()) {
            $lines[] = "    - No labs found.";
        } else {
            foreach ($labs as $lab) {
                $status = $lab->is_active ? 'active' : 'inactive';
                $lines[] = "    - {$lab->name} | floor: {$lab->floor} | capacity: {$lab->capacity} | {$status}";
            }
        }

        $lines[] = "  Meeting Rooms:";
        if ($meetingRooms->isEmpty()) {
            $lines[] = "    - No meeting rooms found.";
        } else {
            foreach ($meetingRooms as $room) {
                $status = $room->is_active ? 'active' : 'inactive';
                $location = $room->location ? " | location: {$room->location}" : '';
                $lines[] = "    - {$room->name} | floor: {$room->floor}{$location} | capacity: {$room->capacity} | {$status}";
            }
        }

        return implode("\n", $lines);
    }

    private function fetchGuestContext(): string
    {
        $availableEquipmentCount = \App\Models\Equipment::where('status', 'available')->count();

        return implode("\n\n", [
            "=== SmartLab Live Context (Guest View) ===",
            $this->fetchFacilityDirectory(),
            "[Public Equipment Summary]\n  - Equipment items currently available: {$availableEquipmentCount}",
        ]);
    }

    private function fetchAdminContext(): string
    {
        // Users
        $allUsers = \App\Models\User::select('name', 'email', 'role', 'department', 'is_active')
            ->orderBy('name')->get();

        // Equipment with full location
        $equipmentList = \App\Models\Equipment::select(
            'name', 'category', 'status', 'quantity',
            'building', 'room', 'cabinet', 'drawer', 'shelf'
        )->orderBy('name')->get();
        $equipmentStats = $equipmentList->groupBy('status')->map->count()->toArray();

        // All active checkouts across all users
        $activeCheckouts = \App\Models\Checkout::where('status', 'active')
            ->with(['equipment:id,name', 'user:id,name'])
            ->orderBy('expected_return_date')
            ->get(['id', 'equipment_id', 'user_id', 'quantity', 'checkout_date', 'expected_return_date']);
        $overdueCheckouts = $activeCheckouts->filter(
            fn($c) => $c->expected_return_date && $c->expected_return_date->isPast()
        );

        // Equipment reservations (pending + approved)
        $equipmentReservations = \App\Models\EquipmentReservation::whereIn('status', ['pending', 'approved'])
            ->with(['equipment:id,name', 'user:id,name'])
            ->orderBy('start_date')->take(30)
            ->get(['id', 'equipment_id', 'user_id', 'status', 'start_date', 'end_date']);

        // Lab reservations (pending + approved)
        $labReservations = \App\Models\LabReservation::whereIn('status', ['pending', 'approved'])
            ->with(['lab:id,name', 'user:id,name'])
            ->orderBy('date')->take(20)
            ->get(['id', 'lab_id', 'user_id', 'status', 'date', 'start_time', 'end_time', 'purpose']);

        // Meeting room reservations (pending + approved)
        $meetingRoomReservations = \App\Models\MeetingRoomReservation::whereIn('status', ['pending', 'approved'])
            ->with(['room:id,name', 'user:id,name'])
            ->orderBy('date')->take(20)
            ->get(['id', 'room_id', 'user_id', 'status', 'date', 'start_time', 'end_time', 'title']);

        // Maintenance requests (open)
        $maintenanceRequests = \App\Models\MaintenanceRequest::whereIn('status', ['pending', 'in-progress', 'claimed'])
            ->with(['equipment:id,name', 'assignedTo:id,name'])
            ->orderByRaw("FIELD(priority, 'critical', 'high', 'medium', 'low')")
            ->get(['id', 'equipment_id', 'assigned_to_id', 'priority', 'status', 'problem_description', 'created_at']);

        // Parts requests (pending + approved)
        $partsRequests = \App\Models\PartsRequest::whereIn('status', ['pending', 'approved'])
            ->with('technician:id,name')
            ->orderBy('created_at', 'desc')->take(20)
            ->get(['id', 'technician_id', 'part_name', 'quantity', 'reason', 'status', 'created_at']);

        // Pending approval requests
        $pendingApprovals = \App\Models\ApprovalRequest::where('status', 'pending')
            ->with('requester:id,name')
            ->orderBy('created_at', 'desc')
            ->get(['id', 'type', 'requester_id', 'description', 'priority', 'requested_date']);

        // Storage
        $storageCabinets = \App\Models\StorageCabinet::select('name', 'location', 'building', 'room', 'is_active')
            ->orderBy('name')->get();
        $storageItems = \App\Models\StorageItem::select('name', 'category', 'quantity', 'minimum_stock', 'unit_price', 'is_consumable')
            ->orderBy('name')->get();
        $lowStockItems = $storageItems->filter(fn($i) => $i->quantity <= ($i->minimum_stock ?? 0));

        // Labs & Meeting Rooms
        $labs         = \App\Models\Lab::select('name', 'floor', 'capacity', 'is_active')->orderBy('name')->get();
        $meetingRooms = \App\Models\MeetingRoom::select('name', 'floor', 'location', 'capacity', 'is_active')->orderBy('name')->get();

        // Recent Activity
        $recentActivity = \App\Models\ActivityLog::with('user:id,name')
            ->latest()->take(10)
            ->get(['user_id', 'action', 'entity_type', 'details', 'created_at']);

        $lines = ["=== SmartLab Live Context (Full Admin View) ==="];

        // -- Users --
        $lines[] = "\n[Registered Users — Total: {$allUsers->count()} | Active: {$allUsers->where('is_active', true)->count()}]";
        foreach ($allUsers as $u) {
            $dept    = $u->department ? ", {$u->department}" : '';
            $status  = $u->is_active ? 'active' : 'inactive';
            $lines[] = "  - {$u->name} | {$u->role}{$dept} | {$u->email} | {$status}";
        }

        // -- Equipment --
        $lines[] = "\n[Equipment — Total: {$equipmentList->count()}]";
        foreach ($equipmentList as $eq) {
            $locationParts = array_filter([
                $eq->building ? "bldg: {$eq->building}" : null,
                $eq->room     ? "room: {$eq->room}"     : null,
                $eq->cabinet  ? "cab: {$eq->cabinet}"   : null,
                $eq->drawer   ? "drw: {$eq->drawer}"    : null,
                $eq->shelf    ? "shelf: {$eq->shelf}"   : null,
            ]);
            $location = $locationParts ? implode(', ', $locationParts) : 'location not recorded';
            $qty      = ($eq->quantity ?? 1) > 1 ? " x{$eq->quantity}" : '';
            $lines[]  = "  - {$eq->name}{$qty} | {$eq->category} | {$eq->status} | {$location}";
        }

        $lines[] = "\n[Equipment Status Summary]";
        foreach ($equipmentStats as $st => $count) {
            $lines[] = "  - {$st}: {$count}";
        }

        // -- Active Checkouts --
        $lines[] = "\n[Active Checkouts — Total: {$activeCheckouts->count()} | Overdue: {$overdueCheckouts->count()}]";
        if ($activeCheckouts->isEmpty()) {
            $lines[] = "  - No active checkouts.";
        } else {
            foreach ($activeCheckouts as $co) {
                $userName = $co->user->name ?? 'Unknown';
                $eqName   = $co->equipment->name ?? 'Unknown equipment';
                $due      = $co->expected_return_date ? $co->expected_return_date->format('M d, Y') : 'N/A';
                $overdue  = ($co->expected_return_date && $co->expected_return_date->isPast()) ? ' [OVERDUE]' : '';
                $qty      = ($co->quantity ?? 1) > 1 ? " x{$co->quantity}" : '';
                $lines[]  = "  - {$userName} checked out {$eqName}{$qty} | due: {$due}{$overdue}";
            }
        }

        // -- Equipment Reservations --
        $lines[] = "\n[Equipment Reservations — Upcoming/Pending: {$equipmentReservations->count()}]";
        if ($equipmentReservations->isEmpty()) {
            $lines[] = "  - No upcoming equipment reservations.";
        } else {
            foreach ($equipmentReservations as $res) {
                $userName = $res->user->name ?? 'Unknown';
                $eqName   = $res->equipment->name ?? 'Unknown';
                $start    = $res->start_date->format('M d, Y');
                $end      = $res->end_date->format('M d, Y');
                $lines[]  = "  - [{$res->status}] {$userName} reserved {$eqName}: {$start} to {$end}";
            }
        }

        // -- Lab Reservations --
        $lines[] = "\n[Lab Reservations — Upcoming/Pending: {$labReservations->count()}]";
        if ($labReservations->isEmpty()) {
            $lines[] = "  - No upcoming lab reservations.";
        } else {
            foreach ($labReservations as $res) {
                $userName = $res->user->name ?? 'Unknown';
                $labName  = $res->lab->name ?? 'Unknown Lab';
                $date     = $res->date->format('M d, Y');
                $start    = \Carbon\Carbon::parse($res->start_time)->format('g:i A');
                $end      = \Carbon\Carbon::parse($res->end_time)->format('g:i A');
                $lines[]  = "  - [{$res->status}] {$userName} | {$labName} | {$date} {$start}–{$end} | '{$res->purpose}'";
            }
        }

        // -- Meeting Room Reservations --
        $lines[] = "\n[Meeting Room Reservations — Upcoming/Pending: {$meetingRoomReservations->count()}]";
        if ($meetingRoomReservations->isEmpty()) {
            $lines[] = "  - No upcoming meeting room reservations.";
        } else {
            foreach ($meetingRoomReservations as $res) {
                $userName = $res->user->name ?? 'Unknown';
                $roomName = $res->room->name ?? 'Unknown Room';
                $date     = $res->date->format('M d, Y');
                $start    = \Carbon\Carbon::parse($res->start_time)->format('g:i A');
                $end      = \Carbon\Carbon::parse($res->end_time)->format('g:i A');
                $lines[]  = "  - [{$res->status}] {$userName} | {$roomName} | {$date} {$start}–{$end} | '{$res->title}'";
            }
        }

        // -- Maintenance Requests --
        $lines[] = "\n[Open Maintenance Requests — Total: {$maintenanceRequests->count()}]";
        if ($maintenanceRequests->isEmpty()) {
            $lines[] = "  - No open maintenance requests.";
        } else {
            foreach ($maintenanceRequests as $task) {
                $eqName   = $task->equipment->name ?? 'Unknown equipment';
                $assignee = $task->assignedTo->name ?? 'Unassigned';
                $lines[]  = "  - [{$task->priority}] [{$task->status}] {$eqName} | assigned to: {$assignee} | {$task->problem_description}";
            }
        }

        // -- Parts Requests --
        $lines[] = "\n[Parts Requests — Pending/Approved: {$partsRequests->count()}]";
        if ($partsRequests->isEmpty()) {
            $lines[] = "  - No active parts requests.";
        } else {
            foreach ($partsRequests as $req) {
                $techName = $req->technician->name ?? 'Unknown';
                $lines[]  = "  - [{$req->status}] {$techName} requested {$req->part_name} x{$req->quantity} | reason: {$req->reason}";
            }
        }

        // -- Pending Approvals --
        $lines[] = "\n[Pending Approvals — Total: {$pendingApprovals->count()}]";
        if ($pendingApprovals->isEmpty()) {
            $lines[] = "  - No pending approvals.";
        } else {
            foreach ($pendingApprovals as $apr) {
                $requester = $apr->requester->name ?? 'Unknown';
                $priority  = $apr->priority ?? 'normal';
                $lines[]   = "  - [{$priority}] [{$apr->type}] {$requester}: {$apr->description}";
            }
        }

        // -- Storage --
        $lines[] = "\n[Storage Cabinets — Total: {$storageCabinets->count()}]";
        foreach ($storageCabinets as $cab) {
            $loc     = $cab->location ?: ($cab->building ? "{$cab->building}, {$cab->room}" : 'location not recorded');
            $status  = $cab->is_active ? 'active' : 'inactive';
            $lines[] = "  - {$cab->name} | {$loc} | {$status}";
        }

        $lines[] = "\n[Storage Items — Total: {$storageItems->count()} | Low Stock: {$lowStockItems->count()}]";
        foreach ($storageItems as $item) {
            $minStock   = $item->minimum_stock ?? 0;
            $flag       = $item->quantity <= $minStock ? ' [LOW STOCK]' : '';
            $consumable = $item->is_consumable ? ' [consumable]' : '';
            $lines[]    = "  - {$item->name}{$consumable} | {$item->category} | qty: {$item->quantity} (min: {$minStock}){$flag}";
        }

        // -- Labs & Meeting Rooms --
        $lines[] = "\n[Labs — Total: {$labs->count()}]";
        foreach ($labs as $lab) {
            $status  = $lab->is_active ? 'active' : 'inactive';
            $lines[] = "  - {$lab->name} | floor: {$lab->floor} | capacity: {$lab->capacity} | {$status}";
        }

        $lines[] = "\n[Meeting Rooms — Total: {$meetingRooms->count()}]";
        foreach ($meetingRooms as $room) {
            $status   = $room->is_active ? 'active' : 'inactive';
            $location = $room->location ? " | location: {$room->location}" : '';
            $lines[]  = "  - {$room->name} | floor: {$room->floor}{$location} | capacity: {$room->capacity} | {$status}";
        }

        // -- Operational Alerts --
        $lines[] = "\n[Operational Alerts]";
        $lines[] = "  - Overdue checkouts: {$overdueCheckouts->count()}";
        $lines[] = "  - Pending approvals: {$pendingApprovals->count()}";
        $lines[] = "  - Low stock items: {$lowStockItems->count()}";
        $lines[] = "  - Open maintenance requests: {$maintenanceRequests->count()}";
        $lines[] = "  - Active users: {$allUsers->where('is_active', true)->count()}";

        // -- Recent Activity --
        $lines[] = "\n[Recent Activity (last 10)]";
        if ($recentActivity->isEmpty()) {
            $lines[] = "  - No recent activity logged.";
        } else {
            foreach ($recentActivity as $log) {
                $actor   = $log->user->name ?? 'System';
                $details = is_array($log->details) ? json_encode($log->details) : ($log->details ?? '');
                $lines[] = "  - [{$log->created_at->diffForHumans()}] {$actor} | {$log->action} ({$log->entity_type}): {$details}";
            }
        }

        return implode("\n", $lines);
    }

    private function fetchEngineerContext(User $user): string
    {
        $activeCheckouts = \App\Models\Checkout::where('user_id', $user->id)
            ->where('status', 'active')
            ->with('equipment:id,name')
            ->get(['id', 'equipment_id', 'expected_return_date']);

        $upcomingReservations = \App\Models\EquipmentReservation::where('user_id', $user->id)
            ->where('status', 'approved')
            ->where('start_date', '>=', now())
            ->with('equipment:id,name')
            ->take(5)
            ->get(['id', 'equipment_id', 'start_date', 'end_date']);

        $upcomingLabReservations = \App\Models\LabReservation::where('user_id', $user->id)
            ->where('status', 'approved')
            ->where('date', '>=', now())
            ->with('lab:id,name')
            ->take(5)
            ->get(['id', 'lab_id', 'date', 'start_time', 'end_time', 'purpose']);

        $upcomingMeetingRoomReservations = \App\Models\MeetingRoomReservation::where('user_id', $user->id)
            ->where('status', 'approved')
            ->where('date', '>=', now())
            ->with('room:id,name')
            ->take(5)
            ->get(['id', 'room_id', 'date', 'start_time', 'end_time', 'title']);

        $availableEquipmentCount = \App\Models\Equipment::where('status', 'available')->count();

        $lines = ["=== SmartLab Live Context ({$user->name}'s View) ==="];

        $lines[] = "\n[Your Active Checkouts]";
        if ($activeCheckouts->isEmpty()) {
            $lines[] = "  - No active checkouts.";
        } else {
            foreach ($activeCheckouts as $co) {
                $name    = $co->equipment->name ?? 'Unknown';
                $due     = $co->expected_return_date ? $co->expected_return_date->format('M d, Y') : 'N/A';
                $lines[] = "  - {$name} (due: {$due})";
            }
        }

        $lines[] = "\n[Your Upcoming Equipment Reservations]";
        if ($upcomingReservations->isEmpty()) {
            $lines[] = "  - No upcoming equipment reservations.";
        } else {
            foreach ($upcomingReservations as $res) {
                $name    = $res->equipment->name ?? 'Unknown';
                $start   = $res->start_date->format('M d, Y');
                $end     = $res->end_date->format('M d, Y');
                $lines[] = "  - {$name}: {$start} to {$end}";
            }
        }

        $lines[] = "\n[Your Upcoming Lab Reservations]";
        if ($upcomingLabReservations->isEmpty()) {
            $lines[] = "  - No upcoming lab reservations.";
        } else {
            foreach ($upcomingLabReservations as $res) {
                $name    = $res->lab->name ?? 'Unknown Lab';
                $date    = $res->date->format('M d, Y');
                $start   = \Carbon\Carbon::parse($res->start_time)->format('g:i A');
                $end     = \Carbon\Carbon::parse($res->end_time)->format('g:i A');
                $lines[] = "  - {$name} on {$date} from {$start} to {$end} for '{$res->purpose}'";
            }
        }

        $lines[] = "\n[Your Upcoming Meeting Room Reservations]";
        if ($upcomingMeetingRoomReservations->isEmpty()) {
            $lines[] = "  - No upcoming meeting room reservations.";
        } else {
            foreach ($upcomingMeetingRoomReservations as $res) {
                $name    = $res->room->name ?? 'Unknown Room';
                $date    = $res->date->format('M d, Y');
                $start   = \Carbon\Carbon::parse($res->start_time)->format('g:i A');
                $end     = \Carbon\Carbon::parse($res->end_time)->format('g:i A');
                $lines[] = "  - {$name} on {$date} from {$start} to {$end} for '{$res->title}'";
            }
        }

        $availableEquipment = \App\Models\Equipment::where('status', 'available')
            ->select('name', 'category', 'building', 'room', 'cabinet', 'drawer', 'shelf')
            ->orderBy('name')
            ->get();

        $lines[] = "\n[Available Equipment Locations]";
        if ($availableEquipment->isEmpty()) {
            $lines[] = "  - No equipment is currently marked as available.";
        } else {
            foreach ($availableEquipment as $equipment) {
                $locationParts = array_filter([
                    $equipment->building ? "building: {$equipment->building}" : null,
                    $equipment->room ? "room: {$equipment->room}" : null,
                    $equipment->cabinet ? "cabinet: {$equipment->cabinet}" : null,
                    $equipment->drawer ? "drawer: {$equipment->drawer}" : null,
                    $equipment->shelf ? "shelf: {$equipment->shelf}" : null,
                ]);
                $location = empty($locationParts) ? 'location not recorded' : implode(', ', $locationParts);
                $lines[]  = "  - {$equipment->name} | category: {$equipment->category} | {$location}";
            }
        }

        $lines[] = "\n" . $this->fetchFacilityDirectory();

        $lines[] = "\n[Lab Equipment Availability]";
        $lines[] = "  - Equipment items currently available: {$availableEquipmentCount}";

        return implode("\n", $lines);
    }

    private function fetchTechnicianContext(User $user): string
    {
        $assignedTasks = \App\Models\MaintenanceRequest::where('assigned_to_id', $user->id)
            ->whereIn('status', ['pending', 'in-progress'])
            ->with('equipment:id,name')
            ->take(10)
            ->get(['id', 'equipment_id', 'priority', 'status', 'problem_description', 'created_at']);

        $myPartsRequests = \App\Models\PartsRequest::where('technician_id', $user->id)
            ->whereIn('status', ['pending', 'approved'])
            ->take(5)
            ->get(['id', 'part_name', 'quantity', 'status', 'created_at']);

        $equipmentDirectory = \App\Models\Equipment::select('name', 'category', 'status', 'building', 'room', 'cabinet', 'drawer', 'shelf')
            ->orderBy('name')
            ->get();

        $recentCompletedMaintenance = \App\Models\MaintenanceRequest::where('status', 'completed')
            ->with('equipment:id,name')
            ->latest('completed_date')
            ->take(5)
            ->get(['id', 'equipment_id', 'problem_description', 'completed_date']);

        $lines = ["=== SmartLab Live Context ({$user->name}'s View) ==="];

        $lines[] = "\n[Your Assigned Maintenance Tasks]";
        if ($assignedTasks->isEmpty()) {
            $lines[] = "  - No active tasks assigned to you.";
        } else {
            foreach ($assignedTasks as $task) {
                $equip   = $task->equipment->name ?? 'Unknown equipment';
                $lines[] = "  - [{$task->priority}] {$equip}: {$task->problem_description} (status: {$task->status})";
            }
        }

        $lines[] = "\n[Your Parts Requests]";
        if ($myPartsRequests->isEmpty()) {
            $lines[] = "  - No pending parts requests.";
        } else {
            foreach ($myPartsRequests as $req) {
                $lines[] = "  - {$req->part_name} x{$req->quantity} — {$req->status}";
            }
        }

        $lines[] = "\n[Equipment Directory]";
        if ($equipmentDirectory->isEmpty()) {
            $lines[] = "  - No equipment found.";
        } else {
            foreach ($equipmentDirectory as $equipment) {
                $locationParts = array_filter([
                    $equipment->building ? "building: {$equipment->building}" : null,
                    $equipment->room ? "room: {$equipment->room}" : null,
                    $equipment->cabinet ? "cabinet: {$equipment->cabinet}" : null,
                    $equipment->drawer ? "drawer: {$equipment->drawer}" : null,
                    $equipment->shelf ? "shelf: {$equipment->shelf}" : null,
                ]);
                $location = empty($locationParts) ? 'location not recorded' : implode(', ', $locationParts);
                $lines[]  = "  - {$equipment->name} | category: {$equipment->category} | status: {$equipment->status} | {$location}";
            }
        }

        $lines[] = "\n[Recent Completed Maintenance]";
        if ($recentCompletedMaintenance->isEmpty()) {
            $lines[] = "  - No recently completed maintenance tasks found.";
        } else {
            foreach ($recentCompletedMaintenance as $task) {
                $equipmentName = $task->equipment->name ?? 'Unknown equipment';
                $completedDate = $task->completed_date ? $task->completed_date->format('M d, Y') : 'unknown date';
                $lines[]       = "  - {$equipmentName} | completed: {$completedDate} | issue: {$task->problem_description}";
            }
        }

        $lines[] = "\n" . $this->fetchFacilityDirectory();

        return implode("\n", $lines);
    }

    // -------------------------------------------------------------------------
    // Gemini API
    // -------------------------------------------------------------------------

    /**
     * Convert frontend history + new message into Gemini `contents` array.
     * Frontend sends: [{ role: 'user'|'nova', text: '...' }]
     * Gemini expects: [{ role: 'user'|'model', parts: [{ text: '...' }] }]
     */
    private function buildContents(array $history, string $newMessage, string $context): array
    {
        $contents = [];

        // Inject context as first user turn so Gemini sees it as factual input
        if (!empty($context)) {
            $contents[] = [
                'role'  => 'user',
                'parts' => [['text' => "Here is current lab data for context:\n\n{$context}\n\n---"]],
            ];
            $contents[] = [
                'role'  => 'model',
                'parts' => [['text' => "Understood. I have reviewed the current lab data and will use it to answer accurately."]],
            ];
        }

        // Prior conversation history (cap at last 20 turns to stay within token limits)
        $history = array_slice($history, -20);
        foreach ($history as $msg) {
            $geminiRole = ($msg['role'] ?? 'user') === 'nova' ? 'model' : 'user';
            $contents[] = [
                'role'  => $geminiRole,
                'parts' => [['text' => $msg['text'] ?? '']],
            ];
        }

        // The new user message
        $contents[] = [
            'role'  => 'user',
            'parts' => [['text' => $newMessage]],
        ];

        return $contents;
    }

    private function callGemini(string $systemPrompt, array $contents): string
    {
        $payload = [
            'system_instruction' => [
                'parts' => [['text' => $systemPrompt]],
            ],
            'contents'           => $contents,
            'generationConfig'   => [
                'temperature'     => 0.7,
                'maxOutputTokens' => 1024,
            ],
        ];

        $response = Http::withHeaders(['Content-Type' => 'application/json'])
            ->timeout(30)
            ->post("{$this->apiUrl}?key={$this->apiKey}", $payload);

        if ($response->failed()) {
            Log::error('Gemini API error', [
                'status' => $response->status(),
                'body'   => $response->body(),
            ]);
            return "I'm having trouble connecting right now. Please try again in a moment.";
        }

        $data = $response->json();

        return $data['candidates'][0]['content']['parts'][0]['text']
            ?? "I couldn't generate a response. Please try again.";
    }
}
