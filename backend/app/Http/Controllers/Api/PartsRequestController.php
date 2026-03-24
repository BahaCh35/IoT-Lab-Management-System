<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PartsRequest;
use App\Models\ComponentInventory;
use Illuminate\Http\Request;

class PartsRequestController extends Controller
{
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

        return response()->json($this->formatRequest($partsRequest), 201);
    }

    public function approve($id, Request $request)
    {
        $partsRequest = PartsRequest::findOrFail($id);
        $partsRequest->update([
            'status' => 'approved',
            'approved_by_id' => $request->user()->id,
        ]);
        return response()->json($this->formatRequest($partsRequest->load(['technician', 'approvedBy'])));
    }

    public function reject($id)
    {
        $partsRequest = PartsRequest::findOrFail($id);
        if ($partsRequest->status !== 'pending') {
            return response()->json(['message' => 'Can only reject pending requests'], 400);
        }
        $partsRequest->update(['status' => 'rejected']);
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
            'totalPartTypes' => $inventory->count(),
            'lowStockParts' => $lowStock,
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
