<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EquipmentReservation;
use Illuminate\Http\Request;

class EquipmentReservationController extends Controller
{
    public function index(Request $request)
    {
        $query = EquipmentReservation::with(['user', 'approver', 'equipment']);

        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $reservations = $query->orderBy('created_date', 'desc')->get();
        return response()->json($reservations->map(fn($r) => $this->formatReservation($r)));
    }

    public function show($id)
    {
        $reservation = EquipmentReservation::with(['user', 'approver', 'equipment'])->findOrFail($id);
        return response()->json($this->formatReservation($reservation));
    }

    public function store(Request $request)
    {
        $request->validate([
            'equipment_id' => 'required|exists:equipment,id',
            'equipment_name' => 'required|string',
            'user_id' => 'required|exists:users,id',
            'user_name' => 'required|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date',
        ]);

        $reservation = EquipmentReservation::create([
            'id' => 'eq-res-' . time(),
            'equipment_id' => $request->equipment_id,
            'equipment_name' => $request->equipment_name,
            'user_id' => $request->user_id,
            'user_name' => $request->user_name,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'status' => 'pending',
            'notes' => $request->notes,
            'created_date' => now(),
        ]);

        return response()->json($this->formatReservation($reservation), 201);
    }

    public function update(Request $request, $id)
    {
        $reservation = EquipmentReservation::findOrFail($id);
        $reservation->update($request->only(['start_date', 'end_date', 'notes']));
        return response()->json($this->formatReservation($reservation->load(['user', 'approver', 'equipment'])));
    }

    public function approve($id, Request $request)
    {
        $reservation = EquipmentReservation::findOrFail($id);
        $reservation->update([
            'status' => 'approved',
            'approver_id' => $request->user()->id,
        ]);
        return response()->json($this->formatReservation($reservation->load(['user', 'approver', 'equipment'])));
    }

    public function reject($id, Request $request)
    {
        $reservation = EquipmentReservation::findOrFail($id);
        $reservation->update([
            'status' => 'rejected',
            'approver_id' => $request->user()->id,
            'rejection_reason' => $request->reason,
        ]);
        return response()->json($this->formatReservation($reservation->load(['user', 'approver', 'equipment'])));
    }

    public function cancel($id)
    {
        $reservation = EquipmentReservation::findOrFail($id);
        $reservation->update(['status' => 'cancelled']);
        return response()->json($this->formatReservation($reservation->load(['user', 'approver', 'equipment'])));
    }

    public function stats()
    {
        $reservations = EquipmentReservation::all();
        return response()->json([
            'total' => $reservations->count(),
            'pending' => $reservations->where('status', 'pending')->count(),
            'approved' => $reservations->where('status', 'approved')->count(),
            'rejected' => $reservations->where('status', 'rejected')->count(),
            'cancelled' => $reservations->where('status', 'cancelled')->count(),
        ]);
    }

    private function formatReservation($reservation)
    {
        return [
            'id' => $reservation->id,
            'equipmentId' => $reservation->equipment_id,
            'equipment' => $reservation->equipment_name,
            'userId' => (string) $reservation->user_id,
            'userName' => $reservation->user_name,
            'startDate' => $reservation->start_date?->format('Y-m-d'),
            'endDate' => $reservation->end_date?->format('Y-m-d'),
            'status' => $reservation->status,
            'approver' => $reservation->approver ? [
                'id' => (string) $reservation->approver->id,
                'name' => $reservation->approver->name,
                'email' => $reservation->approver->email,
                'role' => $reservation->approver->role,
                'createdAt' => $reservation->approver->created_at?->toISOString(),
            ] : null,
            'rejectionReason' => $reservation->rejection_reason,
            'notes' => $reservation->notes,
            'createdDate' => $reservation->created_date?->toISOString(),
        ];
    }
}
