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
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'capacity' => 'required|integer|min:1|max:1000',
            'floor' => 'sometimes|integer|min:1|max:50',
            'location' => 'sometimes|string|max:255',
            'amenities' => 'sometimes|array',
            'amenities.*' => 'string',
            'isActive' => 'sometimes|boolean', // Accept isActive from frontend
        ]);

        $room = MeetingRoom::create([
            'id' => 'room-' . time(),
            'name' => $validatedData['name'],
            'capacity' => $validatedData['capacity'],
            'floor' => $validatedData['floor'] ?? 1,
            'location' => $validatedData['location'] ?? 'TBD',
            'amenities' => $validatedData['amenities'] ?? [],
            'is_active' => $validatedData['isActive'] ?? true, // Map isActive to is_active
        ]);

        return response()->json($this->formatRoom($room), 201);
    }

    public function update(Request $request, $id)
    {
        try {
            // Find the room
            $room = MeetingRoom::findOrFail($id);

            // Validate the request
            $validatedData = $request->validate([
                'name' => 'sometimes|string|max:255',
                'capacity' => 'sometimes|integer|min:1|max:1000',
                'floor' => 'sometimes|integer|min:1|max:50',
                'location' => 'sometimes|string|max:255',
                'amenities' => 'sometimes|array',
                'amenities.*' => 'string',
                'isActive' => 'sometimes|boolean', // Accept isActive from frontend
            ]);

            // Map frontend field names to database field names
            $updateData = [];
            foreach ($validatedData as $key => $value) {
                if ($key === 'isActive') {
                    // Convert isActive (frontend) to is_active (database)
                    $updateData['is_active'] = $value;
                } else {
                    $updateData[$key] = $value;
                }
            }

            // Update the room
            $room->update($updateData);

            return response()->json([
                'success' => true,
                'data' => $this->formatRoom($room->fresh()),
                'message' => 'Meeting room updated successfully'
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Meeting room not found',
                'error' => 'ROOM_NOT_FOUND'
            ], 404);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while updating the room',
                'error' => 'INTERNAL_ERROR'
            ], 500);
        }
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
