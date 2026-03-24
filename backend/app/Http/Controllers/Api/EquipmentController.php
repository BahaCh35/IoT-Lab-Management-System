<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Equipment;
use Illuminate\Http\Request;

class EquipmentController extends Controller
{
    public function index()
    {
        $equipment = Equipment::all();
        return response()->json($equipment->map(fn($e) => $this->formatEquipment($e)));
    }

    public function show($id)
    {
        $equipment = Equipment::findOrFail($id);
        return response()->json($this->formatEquipment($equipment));
    }

    public function byCategory($category)
    {
        $equipment = Equipment::where('category', $category)->get();
        return response()->json($equipment->map(fn($e) => $this->formatEquipment($e)));
    }

    public function available()
    {
        $equipment = Equipment::where('status', 'available')->get();
        return response()->json($equipment->map(fn($e) => $this->formatEquipment($e)));
    }

    public function search(Request $request)
    {
        $query = $request->get('q', '');
        $equipment = Equipment::where('name', 'like', "%{$query}%")
            ->orWhere('description', 'like', "%{$query}%")
            ->orWhere('qr_code', 'like', "%{$query}%")
            ->orWhere('id', 'like', "%{$query}%")
            ->get();
        return response()->json($equipment->map(fn($e) => $this->formatEquipment($e)));
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'category' => 'required|in:computer,microcontroller,sensor,tool,component,other',
        ]);

        $equipment = Equipment::create([
            'id' => 'eq-' . time(),
            'name' => $request->name,
            'description' => $request->description,
            'category' => $request->category,
            'status' => 'available',
            'qr_code' => 'QR-EQ-' . time() . '-' . strtoupper(str_replace(' ', '-', $request->name)),
            'specifications' => $request->specifications ?? [],
            'acquisition_date' => $request->acquisition_date ?? now()->format('Y-m-d'),
            'usage_count' => 0,
            'building' => $request->building,
            'room' => $request->room,
            'cabinet' => $request->cabinet,
            'drawer' => $request->drawer,
            'shelf' => $request->shelf,
            'image_url' => $request->image_url,
        ]);

        return response()->json($this->formatEquipment($equipment), 201);
    }

    public function update(Request $request, $id)
    {
        $equipment = Equipment::findOrFail($id);
        $equipment->update($request->only([
            'name', 'description', 'category', 'status', 'specifications',
            'building', 'room', 'cabinet', 'drawer', 'shelf', 'image_url'
        ]));

        return response()->json($this->formatEquipment($equipment));
    }

    public function destroy($id)
    {
        $equipment = Equipment::findOrFail($id);
        $equipment->delete();

        return response()->json(['message' => 'Equipment deleted successfully']);
    }

    private function formatEquipment($equipment)
    {
        return [
            'id' => $equipment->id,
            'name' => $equipment->name,
            'description' => $equipment->description,
            'category' => $equipment->category,
            'status' => $equipment->status,
            'location' => [
                'building' => $equipment->building,
                'room' => $equipment->room,
                'cabinet' => $equipment->cabinet,
                'drawer' => $equipment->drawer,
                'shelf' => $equipment->shelf,
            ],
            'qrCode' => $equipment->qr_code,
            'specifications' => $equipment->specifications ?? [],
            'acquisitionDate' => $equipment->acquisition_date?->format('Y-m-d'),
            'usageCount' => $equipment->usage_count,
            'lastUsedBy' => $equipment->last_used_by,
            'lastUsedDate' => $equipment->last_used_date?->format('Y-m-d'),
            'imageUrl' => $equipment->image_url,
        ];
    }
}
