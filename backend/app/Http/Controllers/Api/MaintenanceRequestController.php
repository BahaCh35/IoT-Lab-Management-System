<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MaintenanceRequest;
use Illuminate\Http\Request;

class MaintenanceRequestController extends Controller
{
    public function index(Request $request)
    {
        $query = MaintenanceRequest::with(['reportedBy', 'assignedTo']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        if ($request->has('priority')) {
            $query->where('priority', $request->priority);
        }
        if ($request->has('technician_id')) {
            $query->where('assigned_to_id', $request->technician_id);
        }

        $requests = $query->orderBy('reported_date', 'desc')->get();
        return response()->json($requests->map(fn($r) => $this->formatRequest($r)));
    }

    public function show($id)
    {
        $request = MaintenanceRequest::with(['reportedBy', 'assignedTo'])->findOrFail($id);
        return response()->json($this->formatRequest($request));
    }

    public function store(Request $request)
    {
        $request->validate([
            'equipment_id' => 'required|exists:equipment,id',
            'equipment_name' => 'required|string',
            'problem_description' => 'required|string',
            'reported_by_id' => 'required|exists:users,id',
        ]);

        $maintenanceRequest = MaintenanceRequest::create([
            'id' => 'maint-' . time(),
            'equipment_id' => $request->equipment_id,
            'equipment_name' => $request->equipment_name,
            'problem_description' => $request->problem_description,
            'reported_by_id' => $request->reported_by_id,
            'reported_date' => now(),
            'priority' => $request->priority ?? 'medium',
            'status' => 'pending',
            'notes' => '',
            'parts_used' => [],
            'time_spent' => 0,
            'photos' => [],
            'building' => $request->building,
            'room' => $request->room,
            'cabinet' => $request->cabinet,
            'drawer' => $request->drawer,
            'shelf' => $request->shelf,
        ]);

        return response()->json($this->formatRequest($maintenanceRequest->load(['reportedBy'])), 201);
    }

    public function claim($id, Request $request)
    {
        $maintenanceRequest = MaintenanceRequest::findOrFail($id);

        if ($maintenanceRequest->status !== 'pending') {
            return response()->json(['message' => 'Task is not available for claiming'], 400);
        }

        $maintenanceRequest->update([
            'assigned_to_id' => $request->user()->id,
            'claimed_date' => now(),
            'status' => 'in-progress',
        ]);

        return response()->json($this->formatRequest($maintenanceRequest->load(['reportedBy', 'assignedTo'])));
    }

    public function updateStatus($id, Request $request)
    {
        $request->validate(['status' => 'required|string']);

        $maintenanceRequest = MaintenanceRequest::findOrFail($id);
        $maintenanceRequest->update([
            'status' => $request->status,
            'notes' => $request->notes ?? $maintenanceRequest->notes,
        ]);

        if (in_array($request->status, ['completed', 'cannot-repair'])) {
            $maintenanceRequest->update(['completed_date' => now()]);
        }

        return response()->json($this->formatRequest($maintenanceRequest->load(['reportedBy', 'assignedTo'])));
    }

    public function updateNotes($id, Request $request)
    {
        $maintenanceRequest = MaintenanceRequest::findOrFail($id);
        $maintenanceRequest->update(['notes' => $request->notes]);
        return response()->json($this->formatRequest($maintenanceRequest->load(['reportedBy', 'assignedTo'])));
    }

    public function complete($id, Request $request)
    {
        $maintenanceRequest = MaintenanceRequest::findOrFail($id);
        $maintenanceRequest->update([
            'status' => 'completed',
            'completed_date' => now(),
            'notes' => $request->notes ?? $maintenanceRequest->notes,
            'time_spent' => $request->time_spent ?? $maintenanceRequest->time_spent,
            'parts_used' => $request->parts_used ?? $maintenanceRequest->parts_used,
        ]);

        return response()->json($this->formatRequest($maintenanceRequest->load(['reportedBy', 'assignedTo'])));
    }

    public function history(Request $request)
    {
        $query = MaintenanceRequest::whereIn('status', ['completed', 'cannot-repair'])
            ->with(['reportedBy', 'assignedTo']);

        if ($request->has('technician_id')) {
            $query->where('assigned_to_id', $request->technician_id);
        }

        $requests = $query->orderBy('completed_date', 'desc')->get();
        return response()->json($requests->map(fn($r) => $this->formatRequest($r)));
    }

    public function stats()
    {
        $requests = MaintenanceRequest::all();
        return response()->json([
            'total' => $requests->count(),
            'pending' => $requests->where('status', 'pending')->count(),
            'inProgress' => $requests->where('status', 'in-progress')->count(),
            'waitingParts' => $requests->where('status', 'waiting-parts')->count(),
            'completed' => $requests->where('status', 'completed')->count(),
            'cannotRepair' => $requests->where('status', 'cannot-repair')->count(),
        ]);
    }

    private function formatRequest($request)
    {
        return [
            'id' => $request->id,
            'equipmentId' => $request->equipment_id,
            'equipmentName' => $request->equipment_name,
            'problemDescription' => $request->problem_description,
            'reportedBy' => $request->reportedBy ? [
                'id' => (string) $request->reportedBy->id,
                'name' => $request->reportedBy->name,
                'email' => $request->reportedBy->email,
                'role' => $request->reportedBy->role,
                'createdAt' => $request->reportedBy->created_at?->toISOString(),
            ] : null,
            'reportedDate' => $request->reported_date?->toISOString(),
            'priority' => $request->priority,
            'status' => $request->status,
            'assignedTo' => $request->assignedTo ? [
                'id' => (string) $request->assignedTo->id,
                'name' => $request->assignedTo->name,
                'email' => $request->assignedTo->email,
                'role' => $request->assignedTo->role,
                'createdAt' => $request->assignedTo->created_at?->toISOString(),
            ] : null,
            'claimedDate' => $request->claimed_date?->toISOString(),
            'completedDate' => $request->completed_date?->toISOString(),
            'notes' => $request->notes,
            'partsUsed' => $request->parts_used ?? [],
            'timeSpent' => (float) $request->time_spent,
            'photos' => $request->photos ?? [],
            'location' => [
                'building' => $request->building,
                'room' => $request->room,
                'cabinet' => $request->cabinet,
                'drawer' => $request->drawer,
                'shelf' => $request->shelf,
            ],
        ];
    }
}
