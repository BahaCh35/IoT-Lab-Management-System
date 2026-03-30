<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Lab;
use Illuminate\Http\Request;

class LabController extends Controller
{
    public function index()
    {
        $labs = Lab::all();
        return response()->json($labs->map(fn($l) => $this->formatLab($l)));
    }

    public function show($id)
    {
        $lab = Lab::findOrFail($id);
        return response()->json($this->formatLab($lab));
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'capacity' => 'required|integer|min:1|max:1000',
            'equipment' => 'sometimes|array',
            'equipment.*' => 'string',
            'floor' => 'sometimes|integer|min:1|max:50',
            'isActive' => 'sometimes|boolean', // Accept isActive from frontend
        ]);

        $lab = Lab::create([
            'id' => 'lab-' . time(),
            'name' => $validatedData['name'],
            'capacity' => $validatedData['capacity'],
            'equipment' => $validatedData['equipment'] ?? [],
            'floor' => $validatedData['floor'] ?? 1,
            'is_active' => $validatedData['isActive'] ?? true, // Map isActive to is_active
        ]);

        return response()->json($this->formatLab($lab), 201);
    }

    public function update(Request $request, $id)
    {
        try {
            // Find the lab
            $lab = Lab::findOrFail($id);

            // Validate the request
            $validatedData = $request->validate([
                'name' => 'sometimes|string|max:255',
                'capacity' => 'sometimes|integer|min:1|max:1000',
                'equipment' => 'sometimes|array',
                'equipment.*' => 'string',
                'floor' => 'sometimes|integer|min:1|max:50',
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

            // Update the lab
            $lab->update($updateData);

            return response()->json([
                'success' => true,
                'data' => $this->formatLab($lab->fresh()),
                'message' => 'Lab updated successfully'
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lab not found',
                'error' => 'LAB_NOT_FOUND'
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
                'message' => 'An error occurred while updating the lab',
                'error' => 'INTERNAL_ERROR'
            ], 500);
        }
    }

    public function destroy($id)
    {
        $lab = Lab::findOrFail($id);
        $lab->delete();
        return response()->json(['message' => 'Lab deleted successfully']);
    }

    public function stats()
    {
        $labs = Lab::all();
        $reservations = \App\Models\LabReservation::all();
        return response()->json([
            'totalLabs' => $labs->count(),
            'activeLabs' => $labs->where('is_active', true)->count(),
            'totalCapacity' => $labs->sum('capacity'),
            'totalReservations' => $reservations->count(),
            'pendingReservations' => $reservations->where('status', 'pending')->count(),
        ]);
    }

    private function formatLab($lab)
    {
        return [
            'id' => $lab->id,
            'name' => $lab->name,
            'capacity' => $lab->capacity,
            'equipment' => $lab->equipment ?? [],
            'floor' => $lab->floor,
            'isActive' => $lab->is_active,
        ];
    }
}
