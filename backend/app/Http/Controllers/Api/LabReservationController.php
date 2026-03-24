<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LabReservation;
use Illuminate\Http\Request;

class LabReservationController extends Controller
{
    public function index(Request $request)
    {
        $query = LabReservation::with(['user', 'approver', 'lab']);

        if ($request->has('lab_id')) {
            $query->where('lab_id', $request->lab_id);
        }

        $reservations = $query->orderBy('date', 'desc')->get();
        return response()->json($reservations->map(fn($r) => $this->formatReservation($r)));
    }

    public function store(Request $request)
    {
        $request->validate([
            'lab_id' => 'required|exists:labs,id',
            'user_id' => 'required|exists:users,id',
            'purpose' => 'required|string',
            'date' => 'required|date',
            'start_time' => 'required',
            'end_time' => 'required',
        ]);

        $reservation = LabReservation::create([
            'id' => 'lab-res-' . time(),
            'lab_id' => $request->lab_id,
            'user_id' => $request->user_id,
            'purpose' => $request->purpose,
            'date' => $request->date,
            'start_time' => $request->start_time,
            'end_time' => $request->end_time,
            'status' => 'pending',
        ]);

        return response()->json($this->formatReservation($reservation->load(['user', 'lab'])), 201);
    }

    public function approve($id, Request $request)
    {
        $reservation = LabReservation::findOrFail($id);
        $reservation->update([
            'status' => 'approved',
            'approver_id' => $request->user()->id,
        ]);
        return response()->json($this->formatReservation($reservation->load(['user', 'approver', 'lab'])));
    }

    public function reject($id, Request $request)
    {
        $reservation = LabReservation::findOrFail($id);
        $reservation->update([
            'status' => 'rejected',
            'approver_id' => $request->user()->id,
        ]);
        return response()->json($this->formatReservation($reservation->load(['user', 'approver', 'lab'])));
    }

    private function formatReservation($reservation)
    {
        return [
            'id' => $reservation->id,
            'labId' => $reservation->lab_id,
            'user' => $reservation->user ? [
                'id' => (string) $reservation->user->id,
                'name' => $reservation->user->name,
                'email' => $reservation->user->email,
                'role' => $reservation->user->role,
                'createdAt' => $reservation->user->created_at?->toISOString(),
            ] : null,
            'purpose' => $reservation->purpose,
            'date' => $reservation->date?->format('Y-m-d'),
            'startTime' => $reservation->start_time,
            'endTime' => $reservation->end_time,
            'status' => $reservation->status,
            'approver' => $reservation->approver ? [
                'id' => (string) $reservation->approver->id,
                'name' => $reservation->approver->name,
                'email' => $reservation->approver->email,
                'role' => $reservation->approver->role,
                'createdAt' => $reservation->approver->created_at?->toISOString(),
            ] : null,
        ];
    }
}
