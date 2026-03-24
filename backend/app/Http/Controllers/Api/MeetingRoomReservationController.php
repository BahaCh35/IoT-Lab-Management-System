<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MeetingRoomReservation;
use Illuminate\Http\Request;

class MeetingRoomReservationController extends Controller
{
    public function index(Request $request)
    {
        $query = MeetingRoomReservation::with(['user', 'approver', 'room']);

        if ($request->has('room_id')) {
            $query->where('room_id', $request->room_id);
        }

        $reservations = $query->orderBy('date', 'desc')->get();
        return response()->json($reservations->map(fn($r) => $this->formatReservation($r)));
    }

    public function store(Request $request)
    {
        $request->validate([
            'room_id' => 'required|exists:meeting_rooms,id',
            'user_id' => 'required|exists:users,id',
            'title' => 'required|string',
            'date' => 'required|date',
            'start_time' => 'required',
            'end_time' => 'required',
        ]);

        $reservation = MeetingRoomReservation::create([
            'id' => 'res-' . time(),
            'room_id' => $request->room_id,
            'user_id' => $request->user_id,
            'title' => $request->title,
            'date' => $request->date,
            'start_time' => $request->start_time,
            'end_time' => $request->end_time,
            'status' => 'pending',
        ]);

        return response()->json($this->formatReservation($reservation->load(['user', 'room'])), 201);
    }

    public function approve($id, Request $request)
    {
        $reservation = MeetingRoomReservation::findOrFail($id);
        $reservation->update([
            'status' => 'approved',
            'approver_id' => $request->user()->id,
        ]);
        return response()->json($this->formatReservation($reservation->load(['user', 'approver', 'room'])));
    }

    public function reject($id, Request $request)
    {
        $reservation = MeetingRoomReservation::findOrFail($id);
        $reservation->update([
            'status' => 'rejected',
            'approver_id' => $request->user()->id,
        ]);
        return response()->json($this->formatReservation($reservation->load(['user', 'approver', 'room'])));
    }

    private function formatReservation($reservation)
    {
        return [
            'id' => $reservation->id,
            'roomId' => $reservation->room_id,
            'user' => $reservation->user ? [
                'id' => (string) $reservation->user->id,
                'name' => $reservation->user->name,
                'email' => $reservation->user->email,
                'role' => $reservation->user->role,
                'createdAt' => $reservation->user->created_at?->toISOString(),
            ] : null,
            'title' => $reservation->title,
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
