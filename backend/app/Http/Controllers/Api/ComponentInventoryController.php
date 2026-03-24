<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ComponentInventory;
use Illuminate\Http\Request;

class ComponentInventoryController extends Controller
{
    public function index()
    {
        $inventory = ComponentInventory::all();
        $result = [];
        foreach ($inventory as $item) {
            $result[$item->part_name] = $item->quantity;
        }
        return response()->json($result);
    }

    public function update(Request $request, $partName)
    {
        $request->validate(['quantity' => 'required|integer|min:0']);

        $partName = urldecode($partName);
        $inventory = ComponentInventory::firstOrCreate(
            ['part_name' => $partName],
            ['quantity' => 0]
        );
        $inventory->update(['quantity' => $request->quantity]);

        return response()->json(['part_name' => $partName, 'quantity' => $inventory->quantity]);
    }

    public function consume(Request $request)
    {
        $request->validate([
            'part_name' => 'required|string',
            'quantity' => 'required|integer|min:1',
        ]);

        $inventory = ComponentInventory::where('part_name', $request->part_name)->first();

        if (!$inventory || $inventory->quantity < $request->quantity) {
            return response()->json(['success' => false, 'message' => 'Insufficient stock'], 400);
        }

        $inventory->decrement('quantity', $request->quantity);

        return response()->json(['success' => true, 'remaining' => $inventory->quantity]);
    }
}
