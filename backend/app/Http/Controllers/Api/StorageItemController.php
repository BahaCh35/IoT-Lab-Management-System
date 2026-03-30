<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StorageItem;
use App\Models\StorageDrawer;
use App\Models\Equipment;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class StorageItemController extends Controller
{
    /**
     * Display a listing of storage items
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = StorageItem::with(['drawer.cabinet', 'equipment']);

            // Apply filters
            if ($request->has('category')) {
                $query->inCategory($request->category);
            }

            if ($request->has('drawer_id')) {
                $query->inDrawer($request->drawer_id);
            }

            if ($request->has('low_stock') && $request->boolean('low_stock')) {
                $query->lowStock();
            }

            if ($request->has('expired') && $request->boolean('expired')) {
                $query->expired();
            }

            if ($request->has('expiring_soon') && $request->boolean('expiring_soon')) {
                $query->expiringSoon();
            }

            if ($request->has('with_equipment') && $request->boolean('with_equipment')) {
                $query->withEquipment();
            }

            if ($request->has('without_equipment') && $request->boolean('without_equipment')) {
                $query->withoutEquipment();
            }

            $items = $query->get();

            return response()->json($items->map(function ($item) {
                return $this->formatItem($item);
            }));
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve storage items'
            ], 500);
        }
    }

    /**
     * Search storage items
     */
    public function search(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'q' => 'required|string|min:1|max:255',
                'category' => 'nullable|string|in:microcontroller,component,tool,sensor,other',
            ]);

            $query = StorageItem::with(['drawer.cabinet', 'equipment'])
                ->search($request->q);

            if ($request->has('category')) {
                $query->inCategory($request->category);
            }

            $items = $query->get();

            return response()->json([
                'query' => $request->q,
                'results' => $items->map(function ($item) {
                    return $this->formatItem($item);
                }),
                'count' => $items->count(),
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Search failed'
            ], 500);
        }
    }

    /**
     * Get items by category
     */
    public function byCategory(string $category): JsonResponse
    {
        try {
            if (!in_array($category, array_keys(StorageItem::CATEGORIES))) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid category'
                ], 400);
            }

            $items = StorageItem::with(['drawer.cabinet', 'equipment'])
                ->inCategory($category)
                ->get();

            return response()->json([
                'category' => $category,
                'categoryDisplay' => StorageItem::CATEGORIES[$category],
                'items' => $items->map(function ($item) {
                    return $this->formatItem($item);
                }),
                'count' => $items->count(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve items by category'
            ], 500);
        }
    }

    /**
     * Get items by drawer
     */
    public function byDrawer(string $drawerId): JsonResponse
    {
        try {
            $drawer = StorageDrawer::with(['cabinet'])->findOrFail($drawerId);
            $items = $drawer->items()->with(['equipment'])->get();

            return response()->json([
                'drawer' => [
                    'id' => $drawer->id,
                    'name' => $drawer->name,
                    'cabinetId' => $drawer->cabinet_id,
                    'cabinetName' => $drawer->cabinet?->name,
                ],
                'items' => $items->map(function ($item) {
                    return $this->formatItem($item);
                }),
                'count' => $items->count(),
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Drawer not found'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve drawer items'
            ], 500);
        }
    }

    /**
     * Get low stock items
     */
    public function lowStock(): JsonResponse
    {
        try {
            $items = StorageItem::with(['drawer.cabinet', 'equipment'])
                ->lowStock()
                ->get();

            return response()->json([
                'items' => $items->map(function ($item) {
                    return $this->formatItem($item);
                }),
                'count' => $items->count(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve low stock items'
            ], 500);
        }
    }

    /**
     * Display the specified storage item
     */
    public function show(string $id): JsonResponse
    {
        try {
            $item = StorageItem::with(['drawer.cabinet', 'equipment'])->findOrFail($id);

            return response()->json($this->formatItem($item));
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Storage item not found'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve storage item'
            ], 500);
        }
    }

    /**
     * Store a newly created storage item
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validatedData = $request->validate([
                'drawer_id' => 'required|string|exists:storage_drawers,id',
                'equipment_id' => 'nullable|string|exists:equipment,id',
                'name' => 'required|string|max:255',
                'description' => 'nullable|string|max:1000',
                'category' => 'required|string|in:microcontroller,component,tool,sensor,other',
                'quantity' => 'required|integer|min:0',
                'unit_price' => 'nullable|numeric|min:0',
                'supplier' => 'nullable|string|max:255',
                'part_number' => 'nullable|string|max:255',
                'added_date' => 'nullable|date',
                'expiry_date' => 'nullable|date|after:today',
                'minimum_stock' => 'nullable|integer|min:0',
                'is_consumable' => 'nullable|boolean',
                'specifications' => 'nullable|array',
                'image_url' => 'nullable|url',
            ]);

            $item = StorageItem::create([
                'id' => 'item-' . time() . rand(1000, 9999),
                ...$validatedData,
                'added_date' => $validatedData['added_date'] ?? now()->toDateString(),
                'is_consumable' => $validatedData['is_consumable'] ?? false,
                'specifications' => $validatedData['specifications'] ?? [],
            ]);

            return response()->json($this->formatItem($item->fresh(['drawer.cabinet', 'equipment'])), 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create storage item'
            ], 500);
        }
    }

    /**
     * Update the specified storage item
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $item = StorageItem::findOrFail($id);

            $validatedData = $request->validate([
                'drawer_id' => 'sometimes|required|string|exists:storage_drawers,id',
                'equipment_id' => 'nullable|string|exists:equipment,id',
                'name' => 'sometimes|required|string|max:255',
                'description' => 'nullable|string|max:1000',
                'category' => 'sometimes|required|string|in:microcontroller,component,tool,sensor,other',
                'quantity' => 'sometimes|required|integer|min:0',
                'unit_price' => 'nullable|numeric|min:0',
                'supplier' => 'nullable|string|max:255',
                'part_number' => 'nullable|string|max:255',
                'expiry_date' => 'nullable|date',
                'minimum_stock' => 'nullable|integer|min:0',
                'is_consumable' => 'nullable|boolean',
                'specifications' => 'nullable|array',
                'image_url' => 'nullable|url',
            ]);

            $item->update($validatedData);

            return response()->json($this->formatItem($item->fresh(['drawer.cabinet', 'equipment'])));
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Storage item not found'
            ], 404);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update storage item'
            ], 500);
        }
    }

    /**
     * Remove the specified storage item
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $item = StorageItem::findOrFail($id);
            $item->delete();

            return response()->json([
                'success' => true,
                'message' => 'Storage item deleted successfully'
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Storage item not found'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete storage item'
            ], 500);
        }
    }

    /**
     * Batch move items between drawers (critical for drag & drop)
     */
    public function batchMove(Request $request): JsonResponse
    {
        try {
            $validatedData = $request->validate([
                'moves' => 'required|array|min:1',
                'moves.*.item_id' => 'required|string|exists:storage_items,id',
                'moves.*.new_drawer_id' => 'required|string|exists:storage_drawers,id',
                'moves.*.quantity' => 'nullable|integer|min:1',
            ]);

            $movedItems = [];
            $affectedDrawers = [];

            foreach ($validatedData['moves'] as $move) {
                $item = StorageItem::findOrFail($move['item_id']);
                $oldDrawerId = $item->drawer_id;
                $newDrawerId = $move['new_drawer_id'];

                // Skip if moving to same drawer
                if ($oldDrawerId === $newDrawerId) {
                    continue;
                }

                $affectedDrawers[] = $oldDrawerId;
                $affectedDrawers[] = $newDrawerId;

                // Handle partial move (split quantity)
                if (isset($move['quantity']) && $move['quantity'] < $item->quantity) {
                    // Create new item for moved quantity
                    $newItem = $item->replicate();
                    $newItem->id = 'item-' . time() . rand(1000, 9999);
                    $newItem->drawer_id = $newDrawerId;
                    $newItem->quantity = $move['quantity'];
                    $newItem->save();

                    // Update original item quantity
                    $item->update(['quantity' => $item->quantity - $move['quantity']]);

                    $movedItems[] = $this->formatItem($newItem->fresh(['drawer.cabinet', 'equipment']));
                } else {
                    // Move entire item
                    $item->update(['drawer_id' => $newDrawerId]);
                    $movedItems[] = $this->formatItem($item->fresh(['drawer.cabinet', 'equipment']));
                }
            }

            // Update drawer item counts for all affected drawers
            $uniqueDrawers = array_unique($affectedDrawers);
            foreach ($uniqueDrawers as $drawerId) {
                StorageDrawer::find($drawerId)?->updateItemCount();
            }

            return response()->json([
                'success' => true,
                'message' => 'Items moved successfully',
                'moved_items' => $movedItems,
                'count' => count($movedItems),
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to move items'
            ], 500);
        }
    }

    /**
     * Get storage statistics
     */
    public function stats(): JsonResponse
    {
        try {
            $totalItems = StorageItem::count();
            $categoryCounts = StorageItem::selectRaw('category, count(*) as count')
                ->groupBy('category')
                ->pluck('count', 'category');

            $lowStockCount = StorageItem::lowStock()->count();
            $expiredCount = StorageItem::expired()->count();
            $expiringSoonCount = StorageItem::expiringSoon()->count();
            $consumableCount = StorageItem::consumable()->count();
            $linkedToEquipmentCount = StorageItem::withEquipment()->count();

            $totalValue = StorageItem::whereNotNull('unit_price')
                ->selectRaw('SUM(quantity * unit_price) as total')
                ->value('total') ?? 0;

            $totalQuantity = StorageItem::sum('quantity');

            return response()->json([
                'totalItems' => $totalItems,
                'totalQuantity' => $totalQuantity,
                'totalValue' => $totalValue,
                'categoryCounts' => $categoryCounts,
                'lowStockCount' => $lowStockCount,
                'expiredCount' => $expiredCount,
                'expiringSoonCount' => $expiringSoonCount,
                'consumableCount' => $consumableCount,
                'linkedToEquipmentCount' => $linkedToEquipmentCount,
                'categoryBreakdown' => collect(StorageItem::CATEGORIES)->map(function ($display, $key) use ($categoryCounts) {
                    return [
                        'category' => $key,
                        'display' => $display,
                        'count' => $categoryCounts[$key] ?? 0,
                    ];
                })->values(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve storage statistics'
            ], 500);
        }
    }

    /**
     * Link storage item to equipment
     */
    public function linkEquipment(Request $request, string $id): JsonResponse
    {
        try {
            $item = StorageItem::findOrFail($id);

            $validatedData = $request->validate([
                'equipment_id' => 'required|string|exists:equipment,id',
            ]);

            $item->update(['equipment_id' => $validatedData['equipment_id']]);

            return response()->json([
                'success' => true,
                'message' => 'Item linked to equipment successfully',
                'item' => $this->formatItem($item->fresh(['drawer.cabinet', 'equipment'])),
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Storage item not found'
            ], 404);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to link item to equipment'
            ], 500);
        }
    }

    /**
     * Format item data for API response
     */
    private function formatItem(StorageItem $item): array
    {
        return [
            'id' => $item->id,
            'drawerId' => $item->drawer_id,
            'equipmentId' => $item->equipment_id,
            'name' => $item->name,
            'description' => $item->description,
            'category' => $item->category,
            'categoryDisplay' => $item->category_display,
            'quantity' => $item->quantity,
            'unitPrice' => $item->unit_price,
            'supplier' => $item->supplier,
            'partNumber' => $item->part_number,
            'addedDate' => $item->added_date?->toDateString(),
            'expiryDate' => $item->expiry_date?->toDateString(),
            'minimumStock' => $item->minimum_stock,
            'isConsumable' => $item->is_consumable,
            'specifications' => $item->specifications ?? [],
            'imageUrl' => $item->image_url,
            'isLowStock' => $item->is_low_stock,
            'isExpired' => $item->is_expired,
            'isExpiringSoon' => $item->is_expiring_soon,
            'totalValue' => $item->total_value,
            'hasEquipment' => $item->has_equipment,
            'fullLocation' => $item->full_location,
            'drawer' => $item->drawer ? [
                'id' => $item->drawer->id,
                'name' => $item->drawer->name,
                'position' => $item->drawer->position,
                'cabinetId' => $item->drawer->cabinet_id,
                'cabinet' => $item->drawer->cabinet ? [
                    'id' => $item->drawer->cabinet->id,
                    'name' => $item->drawer->cabinet->name,
                    'location' => $item->drawer->cabinet->location,
                ] : null,
            ] : null,
            'equipment' => $item->equipment ? [
                'id' => $item->equipment->id,
                'name' => $item->equipment->name,
                'qrCode' => $item->equipment->qr_code,
            ] : null,
            'createdAt' => $item->created_at?->toISOString(),
            'updatedAt' => $item->updated_at?->toISOString(),
        ];
    }
}