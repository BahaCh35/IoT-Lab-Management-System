<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ApprovalRequest;
use App\Models\ActivityLog;
use App\Models\MeetingRoomReservation;
use App\Services\NotificationService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ApprovalController extends Controller
{
    public function __construct(private NotificationService $notifications) {}
    public function index(Request $request)
    {
        $query = ApprovalRequest::with(['requester', 'reviewedBy']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }
        if ($request->has('priority')) {
            $query->where('priority', $request->priority);
        }

        $approvals = $query->orderBy('requested_date', 'desc')->get();

        // Compute live priority for pending requests
        $approvals = $approvals->map(function ($approval) {
            if ($approval->status === 'pending') {
                $approval->priority = $this->computePriority($approval->requested_date);
            }
            return $approval;
        });

        return response()->json($approvals->map(fn($a) => $this->formatApproval($a)));
    }

    public function show($id)
    {
        $approval = ApprovalRequest::with(['requester', 'reviewedBy'])->findOrFail($id);
        return response()->json($this->formatApproval($approval));
    }

    public function store(Request $request)
    {
        $rules = [
            'type' => 'required|string',
            'description' => 'required|string',
        ];

        if ($request->type === 'meeting-room-booking') {
            $rules = array_merge($rules, [
                'details.room_id' => 'required|exists:meeting_rooms,id',
                'details.date' => 'required|date',
                'details.startTime' => 'required|string',
                'details.duration' => 'required|string',
                'details.purpose' => 'required|string',
            ]);
        }

        $request->validate($rules);

        $approval = DB::transaction(function () use ($request) {
            $approval = ApprovalRequest::create([
                'id' => 'approval-' . uniqid(),
                'type' => $request->type,
                'status' => 'pending',
                'requester_id' => $request->user()->id,
                'description' => $request->description,
                'details' => $request->details ?? [],
                'requested_date' => $request->requested_date ?? now()->format('Y-m-d'),
                'priority' => $this->computePriority($request->requested_date ?? now()->format('Y-m-d')),
            ]);

            if ($request->type === 'meeting-room-booking') {
                $details = $request->input('details', []);
                $startTime = $this->parseTime((string) $details['startTime']);
                $endTime = $this->calculateEndTime((string) $details['startTime'], (string) $details['duration']);

                MeetingRoomReservation::create([
                    'id' => 'res-' . uniqid(),
                    'room_id' => $details['room_id'],
                    'user_id' => $request->user()->id,
                    'title' => $details['purpose'],
                    'date' => $details['date'],
                    'start_time' => $startTime,
                    'end_time' => $endTime,
                    'status' => 'pending',
                    'approval_request_id' => $approval->id,
                ]);
            }

            // Log activity
            ActivityLog::create([
                'user_id' => $request->user()->id,
                'action' => 'created',
                'entity_type' => 'approval',
                'entity_id' => $approval->id,
                'details' => ['type' => $request->type],
            ]);

            return $approval;
        });

        // Notify all admins about the new request
        $requesterName = $approval->requester->name ?? 'Unknown';
        $this->notifications->notifyAdmins(
            'info',
            'New Approval Request',
            "New {$approval->type} request from {$requesterName}: {$approval->description}",
            ['entity_id' => $approval->id, 'action_url' => '/admin']
        );

        return response()->json($this->formatApproval($approval->load('requester')), 201);
    }

    public function approve($id, Request $request)
    {
        $approval = DB::transaction(function () use ($id, $request) {
            $approval = ApprovalRequest::findOrFail($id);
            $approval->update([
                'status' => 'approved',
                'reviewed_by_id' => $request->user()->id,
                'reviewed_date' => now()->format('Y-m-d'),
            ]);

            if ($approval->type === 'meeting-room-booking') {
                MeetingRoomReservation::where('approval_request_id', $approval->id)->update([
                    'status' => 'approved',
                    'approver_id' => $request->user()->id,
                ]);
            }

            // Log activity
            ActivityLog::create([
                'user_id' => $request->user()->id,
                'action' => 'approved',
                'entity_type' => 'approval',
                'entity_id' => $id,
                'details' => ['reason' => $request->notes ?? 'Approved'],
            ]);

            return $approval;
        });

        // Notify the requester (engineer) that their request was approved
        $this->notifications->notifyUser(
            $approval->requester_id,
            'success',
            'Request Approved',
            "Your {$approval->type} request has been approved.",
            ['entity_id' => $approval->id, 'action_url' => '/reservations']
        );

        return response()->json($this->formatApproval($approval->load(['requester', 'reviewedBy'])));
    }

    public function reject($id, Request $request)
    {
        $request->validate(['reason' => 'required|string']);

        $approval = DB::transaction(function () use ($id, $request) {
            $approval = ApprovalRequest::findOrFail($id);
            $approval->update([
                'status' => 'rejected',
                'reviewed_by_id' => $request->user()->id,
                'reviewed_date' => now()->format('Y-m-d'),
                'rejection_reason' => $request->reason,
            ]);

            if ($approval->type === 'meeting-room-booking') {
                MeetingRoomReservation::where('approval_request_id', $approval->id)->update([
                    'status' => 'rejected',
                    'approver_id' => $request->user()->id,
                ]);
            }

            // Log activity
            ActivityLog::create([
                'user_id' => $request->user()->id,
                'action' => 'rejected',
                'entity_type' => 'approval',
                'entity_id' => $id,
                'details' => ['reason' => $request->reason],
            ]);

            return $approval;
        });

        // Notify the requester (engineer) that their request was rejected
        $this->notifications->notifyUser(
            $approval->requester_id,
            'error',
            'Request Rejected',
            "Your {$approval->type} request was rejected: {$request->reason}",
            ['entity_id' => $approval->id, 'action_url' => '/reservations']
        );

        return response()->json($this->formatApproval($approval->load(['requester', 'reviewedBy'])));
    }

    public function pendingCount()
    {
        return response()->json(['count' => ApprovalRequest::where('status', 'pending')->count()]);
    }

    public function stats()
    {
        $approvals = ApprovalRequest::all();
        return response()->json([
            'total' => $approvals->count(),
            'pending' => $approvals->where('status', 'pending')->count(),
            'approved' => $approvals->where('status', 'approved')->count(),
            'rejected' => $approvals->where('status', 'rejected')->count(),
            'byType' => [
                'equipment-purchase' => $approvals->where('type', 'equipment-purchase')->count(),
                'product-modification' => $approvals->where('type', 'product-modification')->count(),
                'checkout-request' => $approvals->where('type', 'checkout-request')->count(),
                'reservation-request' => $approvals->where('type', 'reservation-request')->count(),
                'meeting-room-booking' => $approvals->where('type', 'meeting-room-booking')->count(),
                'lab-reservation' => $approvals->where('type', 'lab-reservation')->count(),
                'storage-addition' => $approvals->where('type', 'storage-addition')->count(),
                'damage-report' => $approvals->where('type', 'damage-report')->count(),
            ],
        ]);
    }

    private function computePriority($requestedDate): string
    {
        $daysPending = now()->diffInDays($requestedDate, false);
        $daysPending = abs($daysPending);

        if ($daysPending >= 4) return 'high';
        if ($daysPending >= 2) return 'medium';
        return 'low';
    }

    private function formatApproval($approval)
    {
        return [
            'id' => $approval->id,
            'type' => $approval->type,
            'status' => $approval->status,
            'requester' => $approval->requester ? [
                'id' => (string) $approval->requester->id,
                'name' => $approval->requester->name,
                'email' => $approval->requester->email,
                'role' => $approval->requester->role,
                'createdAt' => $approval->requester->created_at?->toISOString(),
            ] : null,
            'description' => $approval->description,
            'details' => $approval->details ?? [],
            'requestedDate' => $approval->requested_date?->format('Y-m-d'),
            'reviewedBy' => $approval->reviewedBy ? [
                'id' => (string) $approval->reviewedBy->id,
                'name' => $approval->reviewedBy->name,
                'email' => $approval->reviewedBy->email,
                'role' => $approval->reviewedBy->role,
                'createdAt' => $approval->reviewedBy->created_at?->toISOString(),
            ] : null,
            'reviewedDate' => $approval->reviewed_date?->format('Y-m-d'),
            'rejectionReason' => $approval->rejection_reason,
            'priority' => $approval->priority,
        ];
    }

    private function parseTime(string $time): string
    {
        return Carbon::createFromFormat('g:i A', strtoupper($time))->format('H:i:s');
    }

    private function calculateEndTime(string $startTime, string $duration): string
    {
        $parsedStart = Carbon::createFromFormat('g:i A', strtoupper($startTime));
        preg_match('/(\d+(?:\.\d+)?)/', $duration, $matches);
        $value = isset($matches[1]) ? (float) $matches[1] : 1.0;
        $durationLower = strtolower($duration);
        $minutesToAdd = str_contains($durationLower, 'min')
            ? (int) round($value)
            : (int) round($value * 60);

        return $parsedStart->addMinutes($minutesToAdd)->format('H:i:s');
    }
}
