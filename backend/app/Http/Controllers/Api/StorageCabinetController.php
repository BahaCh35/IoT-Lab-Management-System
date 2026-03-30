<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StorageCabinet;
use App\Models\StorageDrawer;
use App\Models\StorageItem;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class StorageCabinetController extends Controller
{
    /**
     * Display a listing of storage cabinets
     */
    public function index(): JsonResponse
    {
        try {
            $cabinets = StorageCabinet::with(['drawers.items'])->get();

            return response()->json($cabinets->map(function ($cabinet) {
                return $this->formatCabinet($cabinet);
            }));
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve storage cabinets'
            ], 500);
        }
    }

    /**
     * Display the specified storage cabinet
     */
    public function show(string $id): JsonResponse
    {
        try {
            $cabinet = StorageCabinet::with(['drawers.items'])->findOrFail($id);

            return response()->json($this->formatCabinet($cabinet));
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Storage cabinet not found'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve storage cabinet'
            ], 500);
        }
    }

    /**
     * Store a newly created storage cabinet
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validatedData = $request->validate([
                'name' => 'required|string|max:255',
                'description' => 'nullable|string|max:1000',
                'location' => 'required|string|max:255',
                'building' => 'nullable|string|max:100',
                'room' => 'nullable|string|max:100',
                'drawer_count' => 'nullable|integer|min:0|max:50',
                'is_active' => 'nullable|boolean',
                'metadata' => 'nullable|array',
            ]);

            $cabinet = StorageCabinet::create([
                'id' => 'cabinet-' . time() . rand(1000, 9999),
                'name' => $validatedData['name'],
                'description' => $validatedData['description'] ?? null,
                'location' => $validatedData['location'],
                'building' => $validatedData['building'] ?? null,
                'room' => $validatedData['room'] ?? null,
                'drawer_count' => $validatedData['drawer_count'] ?? 0,
                'is_active' => $validatedData['is_active'] ?? true,
                'metadata' => $validatedData['metadata'] ?? [],
            ]);

            return response()->json($this->formatCabinet($cabinet->fresh()), 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create storage cabinet'
            ], 500);
        }
    }

    /**
     * Update the specified storage cabinet
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $cabinet = StorageCabinet::findOrFail($id);

            $validatedData = $request->validate([
                'name' => 'sometimes|required|string|max:255',
                'description' => 'nullable|string|max:1000',
                'location' => 'sometimes|required|string|max:255',
                'building' => 'nullable|string|max:100',
                'room' => 'nullable|string|max:100',
                'drawer_count' => 'nullable|integer|min:0|max:50',
                'is_active' => 'nullable|boolean',
                'metadata' => 'nullable|array',
            ]);

            $cabinet->update($validatedData);

            return response()->json($this->formatCabinet($cabinet->fresh()));
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Storage cabinet not found'
            ], 404);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update storage cabinet'
            ], 500);
        }
    }

    /**
     * Remove the specified storage cabinet
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $cabinet = StorageCabinet::findOrFail($id);

            // Check if cabinet has items
            $itemCount = $cabinet->items()->count();
            if ($itemCount > 0) {
                return response()->json([
                    'success' => false,
                    'message' => "Cannot delete cabinet. It contains {$itemCount} items. Please move or remove all items first."
                ], 400);
            }

            $cabinet->delete();

            return response()->json([
                'success' => true,
                'message' => 'Storage cabinet deleted successfully'
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Storage cabinet not found'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete storage cabinet'
            ], 500);
        }
    }

    /**
     * Get storage statistics for dashboard
     */
    public function stats(): JsonResponse
    {
        try {
            $totalCabinets = StorageCabinet::count();
            $activeCabinets = StorageCabinet::active()->count();
            $totalDrawers = StorageDrawer::count();
            $totalItems = StorageItem::count();

            $categoryCounts = StorageItem::selectRaw('category, count(*) as count')
                ->groupBy('category')
                ->pluck('count', 'category');

            $lowStockItems = StorageItem::lowStock()->count();
            $expiredItems = StorageItem::expired()->count();
            $expiringSoonItems = StorageItem::expiringSoon()->count();

            return response()->json([
                'totalCabinets' => $totalCabinets,
                'activeCabinets' => $activeCabinets,
                'totalDrawers' => $totalDrawers,
                'totalItems' => $totalItems,
                'categoryCounts' => $categoryCounts,
                'lowStockItems' => $lowStockItems,
                'expiredItems' => $expiredItems,
                'expiringSoonItems' => $expiringSoonItems,
                'totalValue' => StorageItem::whereNotNull('unit_price')
                    ->selectRaw('SUM(quantity * unit_price) as total')
                    ->value('total') ?? 0,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve storage statistics'
            ], 500);
        }
    }

    /**
     * Format cabinet data for API response
     */
    private function formatCabinet(StorageCabinet $cabinet): array
    {
        return [
            'id' => $cabinet->id,
            'name' => $cabinet->name,
            'description' => $cabinet->description,
            'location' => $cabinet->location,
            'building' => $cabinet->building,
            'room' => $cabinet->room,
            'drawerCount' => $cabinet->drawer_count,
            'isActive' => $cabinet->is_active,
            'metadata' => $cabinet->metadata ?? [],
            'locationFull' => $cabinet->location_full,
            'actualDrawerCount' => $cabinet->actual_drawer_count,
            'actualItemCount' => $cabinet->actual_item_count,
            'drawers' => $cabinet->drawers ? $cabinet->drawers->map(function ($drawer) {
                return [
                    'id' => $drawer->id,
                    'name' => $drawer->name,
                    'description' => $drawer->description,
                    'position' => $drawer->position,
                    'itemCount' => $drawer->item_count,
                    'isActive' => $drawer->is_active,
                    'isEmpty' => $drawer->is_empty,
                    'items' => $drawer->items ? $drawer->items->map(function ($item) {
                        return [
                            'id' => $item->id,
                            'equipmentId' => $item->equipment_id,
                            'name' => $item->name,
                            'category' => $item->category,
                            'quantity' => $item->quantity,
                            'addedDate' => $item->added_date?->toDateString(),
                            'isLowStock' => $item->is_low_stock,
                            'isExpired' => $item->is_expired,
                            'hasEquipment' => $item->has_equipment,
                        ];
                    }) : [],
                ];
            }) : [],
            'createdAt' => $cabinet->created_at?->toISOString(),
            'updatedAt' => $cabinet->updated_at?->toISOString(),
        ];
    }
}