<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MeetingRoom;
use Illuminate\Http\Request;

class MeetingRoomController extends Controller
{
    public function index()
    {
        $rooms = MeetingRoom::all();
        return response()->json($rooms->map(fn($r) => $this->formatRoom($r)));
    }

    public function show($id)
    {
        $room = MeetingRoom::findOrFail($id);
        return response()->json($this->formatRoom($room));
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'capacity' => 'required|integer',
        ]);

        $room = MeetingRoom::create([
            'id' => 'room-' . time(),
            'name' => $request->name,
            'capacity' => $request->capacity,
            'floor' => $request->floor ?? 1,
            'location' => $request->location ?? 'TBD',
            'amenities' => $request->amenities ?? [],
            'is_active' => $request->is_active ?? true,
        ]);

        return response()->json($this->formatRoom($room), 201);
    }

    public function update(Request $request, $id)
    {
        $room = MeetingRoom::findOrFail($id);
        $room->update($request->only(['name', 'capacity', 'floor', 'location', 'amenities', 'is_active']));
        return response()->json($this->formatRoom($room));
    }

    public function destroy($id)
    {
        $room = MeetingRoom::findOrFail($id);
        $room->delete();
        return response()->json(['message' => 'Meeting room deleted successfully']);
    }

    public function stats()
    {
        $rooms = MeetingRoom::all();
        $reservations = \App\Models\MeetingRoomReservation::all();
        return response()->json([
            'totalRooms' => $rooms->count(),
            'activeRooms' => $rooms->where('is_active', true)->count(),
            'totalCapacity' => $rooms->sum('capacity'),
            'totalReservations' => $reservations->count(),
            'pendingReservations' => $reservations->where('status', 'pending')->count(),
        ]);
    }

    private function formatRoom($room)
    {
        return [
            'id' => $room->id,
            'name' => $room->name,
            'capacity' => $room->capacity,
            'floor' => $room->floor,
            'location' => $room->location,
            'amenities' => $room->amenities ?? [],
            'isActive' => $room->is_active,
        ];
    }
}
