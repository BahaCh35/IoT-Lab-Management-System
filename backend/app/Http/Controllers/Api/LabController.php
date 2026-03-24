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
        $request->validate([
            'name' => 'required|string',
            'capacity' => 'required|integer',
        ]);

        $lab = Lab::create([
            'id' => 'lab-' . time(),
            'name' => $request->name,
            'capacity' => $request->capacity,
            'equipment' => $request->equipment ?? [],
            'floor' => $request->floor ?? 1,
            'is_active' => $request->is_active ?? true,
        ]);

        return response()->json($this->formatLab($lab), 201);
    }

    public function update(Request $request, $id)
    {
        $lab = Lab::findOrFail($id);
        $lab->update($request->only(['name', 'capacity', 'equipment', 'floor', 'is_active']));
        return response()->json($this->formatLab($lab));
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
