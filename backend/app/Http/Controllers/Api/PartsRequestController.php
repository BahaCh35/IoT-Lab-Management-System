<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PartsRequest;
use App\Models\ComponentInventory;
use App\Services\NotificationService;
use Illuminate\Http\Request;

class PartsRequestController extends Controller
{
    public function __construct(private NotificationService $notifications) {}
    public function index(Request $request)
    {
        $query = PartsRequest::with(['technician', 'approvedBy']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        if ($request->has('technician_id')) {
            $query->where('technician_id', $request->technician_id);
        }

        $requests = $query->orderBy('requested_date', 'desc')->get();
        return response()->json($requests->map(fn($r) => $this->formatRequest($r)));
    }

    public function show($id)
    {
        $request = PartsRequest::with(['technician', 'approvedBy'])->findOrFail($id);
        return response()->json($this->formatRequest($request));
    }

    public function store(Request $request)
    {
        $request->validate([
            'technician_id' => 'required|exists:users,id',
            'technician_name' => 'required|string',
            'part_name' => 'required|string',
            'quantity' => 'required|integer|min:1',
            'reason' => 'required|string',
        ]);

        $partsRequest = PartsRequest::create([
            'id' => 'parts-req-' . time(),
            'technician_id' => $request->technician_id,
            'technician_name' => $request->technician_name,
            'part_name' => $request->part_name,
            'quantity' => $request->quantity,
            'reason' => $request->reason,
            'requested_date' => now(),
            'status' => 'pending',
        ]);

        $this->notifications->notifyAdmins(
            'info',
            'New Parts Request',
            "Technician {$partsRequest->technician_name} requested {$partsRequest->quantity}\xc3\x97 {$partsRequest->part_name}: {$partsRequest->reason}",
            ['entity_id' => $partsRequest->id, 'action_url' => '/admin']
        );

        return response()->json($this->formatRequest($partsRequest), 201);
    }

    public function approve($id, Request $request)
    {
        $partsRequest = PartsRequest::findOrFail($id);
        $partsRequest->update([
            'status' => 'approved',
            'approved_by_id' => $request->user()->id,
        ]);

        $this->notifications->notifyUser(
            $partsRequest->technician_id,
            'success',
            'Parts Request Approved',
            "Your request for {$partsRequest->quantity}x {$partsRequest->part_name} has been approved.",
            ['entity_id' => $partsRequest->id, 'action_url' => '/technician/parts']
        );

        return response()->json($this->formatRequest($partsRequest->load(['technician', 'approvedBy'])));
    }

    public function reject($id)
    {
        $partsRequest = PartsRequest::findOrFail($id);
        if ($partsRequest->status !== 'pending') {
            return response()->json(['message' => 'Can only reject pending requests'], 400);
        }
        $partsRequest->update(['status' => 'rejected']);

        $this->notifications->notifyUser(
            $partsRequest->technician_id,
            'error',
            'Parts Request Rejected',
            "Your request for {$partsRequest->quantity}x {$partsRequest->part_name} was rejected.",
            ['entity_id' => $partsRequest->id, 'action_url' => '/technician/parts']
        );

        return response()->json($this->formatRequest($partsRequest->load(['technician', 'approvedBy'])));
    }

    public function cancel($id)
    {
        $partsRequest = PartsRequest::findOrFail($id);
        if ($partsRequest->status !== 'approved') {
            return response()->json(['message' => 'Can only cancel approved requests'], 400);
        }
        $partsRequest->update(['status' => 'cancelled']);
        return response()->json($this->formatRequest($partsRequest->load(['technician', 'approvedBy'])));
    }

    public function markArrived($id)
    {
        $partsRequest = PartsRequest::findOrFail($id);
        if ($partsRequest->status !== 'approved') {
            return response()->json(['message' => 'Can only mark approved requests as arrived'], 400);
        }

        $partsRequest->update(['status' => 'arrived']);

        // Update component inventory
        $inventory = ComponentInventory::firstOrCreate(
            ['part_name' => $partsRequest->part_name],
            ['quantity' => 0]
        );
        $inventory->increment('quantity', $partsRequest->quantity);
        $inventory->refresh();

        $this->notifications->notifyUser(
            $partsRequest->technician_id,
            'success',
            'Parts Arrived',
            "Your parts ({$partsRequest->quantity}x {$partsRequest->part_name}) have arrived and been added to inventory.",
            ['entity_id' => $partsRequest->id, 'action_url' => '/technician/parts']
        );

        // Warn if still low after restocking
        if ($inventory->quantity < 10) {
            $this->notifications->notifyAdmins(
                'warning',
                'Low Stock Alert',
                "{$partsRequest->part_name} is still low — only {$inventory->quantity} in stock after restocking.",
                ['action_url' => '/technician/parts']
            );
            $this->notifications->notifyTechnicians(
                'warning',
                'Low Stock Alert',
                "{$partsRequest->part_name} is still low — only {$inventory->quantity} in stock after restocking.",
                ['action_url' => '/technician/parts']
            );
        }

        return response()->json($this->formatRequest($partsRequest->load(['technician', 'approvedBy'])));
    }

    public function stats()
    {
        $requests = PartsRequest::all();
        $inventory = ComponentInventory::all();
        $lowStock = $inventory->filter(fn($i) => $i->quantity < 10)->count();

        return response()->json([
            'totalRequests' => $requests->count(),
            'pendingRequests' => $requests->where('status', 'pending')->count(),
            'approvedRequests' => $requests->where('status', 'approved')->count(),
            'arrivedRequests' => $requests->where('status', 'arrived')->count(),
            'totalInventoryItems' => $inventory->count(),
            'lowStockItems' => $lowStock,
        ]);
    }

    public function lowStock()
    {
        $lowStockParts = ComponentInventory::where('quantity', '<', 10)->pluck('part_name');
        return response()->json($lowStockParts);
    }

    private function formatRequest($request)
    {
        return [
            'id' => $request->id,
            'technicianId' => (string) $request->technician_id,
            'technicianName' => $request->technician_name,
            'partName' => $request->part_name,
            'quantity' => $request->quantity,
            'reason' => $request->reason,
            'requestedDate' => $request->requested_date?->toISOString(),
            'status' => $request->status,
            'approvedBy' => $request->approvedBy ? [
                'id' => (string) $request->approvedBy->id,
                'name' => $request->approvedBy->name,
                'email' => $request->approvedBy->email,
                'role' => $request->approvedBy->role,
                'createdAt' => $request->approvedBy->created_at?->toISOString(),
            ] : null,
        ];
    }
}
