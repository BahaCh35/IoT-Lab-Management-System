<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ApprovalRequest;
use App\Models\ActivityLog;
use Illuminate\Http\Request;

class ApprovalController extends Controller
{
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
        $request->validate([
            'type' => 'required|string',
            'requester_id' => 'required|exists:users,id',
            'description' => 'required|string',
        ]);

        $approval = ApprovalRequest::create([
            'id' => 'approval-' . time(),
            'type' => $request->type,
            'status' => 'pending',
            'requester_id' => $request->requester_id,
            'description' => $request->description,
            'details' => $request->details ?? [],
            'requested_date' => $request->requested_date ?? now()->format('Y-m-d'),
            'priority' => $this->computePriority($request->requested_date ?? now()->format('Y-m-d')),
        ]);

        // Log activity
        ActivityLog::create([
            'user_id' => $request->requester_id,
            'action' => 'created',
            'entity_type' => 'approval',
            'entity_id' => $approval->id,
            'details' => ['type' => $request->type],
        ]);

        return response()->json($this->formatApproval($approval->load('requester')), 201);
    }

    public function approve($id, Request $request)
    {
        $approval = ApprovalRequest::findOrFail($id);
        $approval->update([
            'status' => 'approved',
            'reviewed_by_id' => $request->user()->id,
            'reviewed_date' => now()->format('Y-m-d'),
        ]);

        // Log activity
        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'approved',
            'entity_type' => 'approval',
            'entity_id' => $id,
            'details' => ['reason' => $request->notes ?? 'Approved'],
        ]);

        return response()->json($this->formatApproval($approval->load(['requester', 'reviewedBy'])));
    }

    public function reject($id, Request $request)
    {
        $request->validate(['reason' => 'required|string']);

        $approval = ApprovalRequest::findOrFail($id);
        $approval->update([
            'status' => 'rejected',
            'reviewed_by_id' => $request->user()->id,
            'reviewed_date' => now()->format('Y-m-d'),
            'rejection_reason' => $request->reason,
        ]);

        // Log activity
        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'rejected',
            'entity_type' => 'approval',
            'entity_id' => $id,
            'details' => ['reason' => $request->reason],
        ]);

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
}
