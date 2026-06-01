<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ComponentInventory;
use App\Services\NotificationService;
use Illuminate\Http\Request;

class ComponentInventoryController extends Controller
{
    const LOW_STOCK_THRESHOLD = 10;

    public function __construct(private NotificationService $notifications) {}

    public function index()
    {
        $inventory = ComponentInventory::all();
        return response()->json($inventory->map(fn($item) => [
            'partName' => $item->part_name,
            'quantity' => $item->quantity,
        ])->values());
    }

    public function update(Request $request, $partName)
    {
        $request->validate(['quantity' => 'required|integer|min:0']);

        $partName = urldecode($partName);
        $inventory = ComponentInventory::firstOrCreate(
            ['part_name' => $partName],
            ['quantity' => 0]
        );
        $wasAbove = $inventory->quantity >= self::LOW_STOCK_THRESHOLD;
        $inventory->update(['quantity' => $request->quantity]);

        if ($wasAbove && $inventory->quantity < self::LOW_STOCK_THRESHOLD) {
            $this->sendLowStockNotification($partName, $inventory->quantity);
        }

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

        $wasAbove = $inventory->quantity >= self::LOW_STOCK_THRESHOLD;
        $inventory->decrement('quantity', $request->quantity);
        $inventory->refresh();

        if ($wasAbove && $inventory->quantity < self::LOW_STOCK_THRESHOLD) {
            $this->sendLowStockNotification($request->part_name, $inventory->quantity);
        }

        return response()->json(['success' => true, 'remaining' => $inventory->quantity]);
    }

    private function sendLowStockNotification(string $partName, int $remaining): void
    {
        $title   = 'Low Stock Alert';
        $message = "{$partName} is running low — only {$remaining} left in inventory.";
        $opts    = ['action_url' => '/technician/parts'];

        $this->notifications->notifyAdmins('warning', $title, $message, $opts);
        $this->notifications->notifyTechnicians('warning', $title, $message, $opts);
    }
}
