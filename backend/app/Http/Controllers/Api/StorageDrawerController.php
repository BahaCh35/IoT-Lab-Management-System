<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StorageDrawer;
use App\Models\StorageCabinet;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class StorageDrawerController extends Controller
{
    /**
     * Display a listing of storage drawers
     */
    public function index(): JsonResponse
    {
        try {
            $drawers = StorageDrawer::with(['cabinet', 'items'])->orderBy('position')->get();

            return response()->json($drawers->map(function ($drawer) {
                return $this->formatDrawer($drawer);
            }));
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve storage drawers'
            ], 500);
        }
    }

    /**
     * Get drawers for a specific cabinet
     */
    public function byCabinet(string $cabinetId): JsonResponse
    {
        try {
            $cabinet = StorageCabinet::findOrFail($cabinetId);
            $drawers = $cabinet->drawers()->with(['items'])->get();

            return response()->json($drawers->map(function ($drawer) {
                return $this->formatDrawer($drawer);
            }));
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Cabinet not found'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve cabinet drawers'
            ], 500);
        }
    }

    /**
     * Display the specified storage drawer
     */
    public function show(string $id): JsonResponse
    {
        try {
            $drawer = StorageDrawer::with(['cabinet', 'items'])->findOrFail($id);

            return response()->json($this->formatDrawer($drawer));
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Storage drawer not found'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve storage drawer'
            ], 500);
        }
    }

    /**
     * Store a newly created storage drawer
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validatedData = $request->validate([
                'cabinet_id' => 'required|string|exists:storage_cabinets,id',
                'name' => 'required|string|max:255',
                'description' => 'nullable|string|max:1000',
                'position' => 'required|integer|min:1',
                'is_active' => 'nullable|boolean',
                'metadata' => 'nullable|array',
            ]);

            // Check if position is already taken in this cabinet
            $existingDrawer = StorageDrawer::where('cabinet_id', $validatedData['cabinet_id'])
                ->where('position', $validatedData['position'])
                ->first();

            if ($existingDrawer) {
                return response()->json([
                    'success' => false,
                    'message' => 'Position already occupied in this cabinet'
                ], 400);
            }

            $drawer = StorageDrawer::create([
                'id' => 'drawer-' . time() . rand(1000, 9999),
                'cabinet_id' => $validatedData['cabinet_id'],
                'name' => $validatedData['name'],
                'description' => $validatedData['description'] ?? null,
                'position' => $validatedData['position'],
                'item_count' => 0,
                'is_active' => $validatedData['is_active'] ?? true,
                'metadata' => $validatedData['metadata'] ?? [],
            ]);

            return response()->json($this->formatDrawer($drawer->fresh(['cabinet'])), 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create storage drawer'
            ], 500);
        }
    }

    /**
     * Update the specified storage drawer
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $drawer = StorageDrawer::findOrFail($id);

            $validatedData = $request->validate([
                'name' => 'sometimes|required|string|max:255',
                'description' => 'nullable|string|max:1000',
                'position' => 'sometimes|required|integer|min:1',
                'is_active' => 'nullable|boolean',
                'metadata' => 'nullable|array',
            ]);

            // Check for position conflicts if position is being updated
            if (isset($validatedData['position']) && $validatedData['position'] !== $drawer->position) {
                $existingDrawer = StorageDrawer::where('cabinet_id', $drawer->cabinet_id)
                    ->where('position', $validatedData['position'])
                    ->where('id', '!=', $id)
                    ->first();

                if ($existingDrawer) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Position already occupied in this cabinet'
                    ], 400);
                }
            }

            $drawer->update($validatedData);

            return response()->json($this->formatDrawer($drawer->fresh(['cabinet'])));
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Storage drawer not found'
            ], 404);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update storage drawer'
            ], 500);
        }
    }

    /**
     * Remove the specified storage drawer
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $drawer = StorageDrawer::findOrFail($id);

            // Check if drawer has items
            $itemCount = $drawer->items()->count();
            if ($itemCount > 0) {
                return response()->json([
                    'success' => false,
                    'message' => "Cannot delete drawer. It contains {$itemCount} items. Please move or remove all items first."
                ], 400);
            }

            $drawer->delete();

            return response()->json([
                'success' => true,
                'message' => 'Storage drawer deleted successfully'
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Storage drawer not found'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete storage drawer'
            ], 500);
        }
    }

    /**
     * Batch reorder drawers within a cabinet
     */
    public function batchReorder(Request $request): JsonResponse
    {
        try {
            $validatedData = $request->validate([
                'cabinet_id' => 'required|string|exists:storage_cabinets,id',
                'drawer_positions' => 'required|array',
                'drawer_positions.*.drawer_id' => 'required|string|exists:storage_drawers,id',
                'drawer_positions.*.position' => 'required|integer|min:1',
            ]);

            $cabinetId = $validatedData['cabinet_id'];
            $drawerPositions = $validatedData['drawer_positions'];

            // Verify all drawers belong to the specified cabinet
            $drawerIds = collect($drawerPositions)->pluck('drawer_id');
            $invalidDrawers = StorageDrawer::whereIn('id', $drawerIds)
                ->where('cabinet_id', '!=', $cabinetId)
                ->exists();

            if ($invalidDrawers) {
                return response()->json([
                    'success' => false,
                    'message' => 'One or more drawers do not belong to the specified cabinet'
                ], 400);
            }

            // Check for duplicate positions
            $positions = collect($drawerPositions)->pluck('position');
            if ($positions->count() !== $positions->unique()->count()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Duplicate positions are not allowed'
                ], 400);
            }

            // Update positions
            $updatedDrawers = [];
            foreach ($drawerPositions as $drawerPosition) {
                $drawer = StorageDrawer::findOrFail($drawerPosition['drawer_id']);
                $drawer->update(['position' => $drawerPosition['position']]);
                $updatedDrawers[] = $this->formatDrawer($drawer->fresh(['cabinet', 'items']));
            }

            return response()->json([
                'success' => true,
                'message' => 'Drawer positions updated successfully',
                'drawers' => $updatedDrawers,
                'count' => count($updatedDrawers),
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to reorder drawers'
            ], 500);
        }
    }

    /**
     * Format drawer data for API response
     */
    private function formatDrawer(StorageDrawer $drawer): array
    {
        return [
            'id' => $drawer->id,
            'cabinetId' => $drawer->cabinet_id,
            'name' => $drawer->name,
            'description' => $drawer->description,
            'position' => $drawer->position,
            'itemCount' => $drawer->item_count,
            'isActive' => $drawer->is_active,
            'metadata' => $drawer->metadata ?? [],
            'isEmpty' => $drawer->is_empty,
            'totalQuantity' => $drawer->total_quantity,
            'fullLocation' => $drawer->full_location,
            'cabinet' => $drawer->cabinet ? [
                'id' => $drawer->cabinet->id,
                'name' => $drawer->cabinet->name,
                'location' => $drawer->cabinet->location,
            ] : null,
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
            'createdAt' => $drawer->created_at?->toISOString(),
            'updatedAt' => $drawer->updated_at?->toISOString(),
        ];
    }
}