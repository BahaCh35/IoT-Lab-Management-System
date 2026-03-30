<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class StorageCabinet extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';
    protected $table = 'storage_cabinets';

    protected $fillable = [
        'id',
        'name',
        'description',
        'location',
        'building',
        'room',
        'drawer_count',
        'is_active',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
        'is_active' => 'boolean',
        'drawer_count' => 'integer',
    ];

    /**
     * Get all drawers belonging to this cabinet
     */
    public function drawers(): HasMany
    {
        return $this->hasMany(StorageDrawer::class, 'cabinet_id')
                    ->orderBy('position');
    }

    /**
     * Get all items in this cabinet through its drawers
     */
    public function items(): HasManyThrough
    {
        return $this->hasManyThrough(
            StorageItem::class,
            StorageDrawer::class,
            'cabinet_id', // Foreign key on storage_drawers table
            'drawer_id',  // Foreign key on storage_items table
            'id',         // Local key on storage_cabinets table
            'id'          // Local key on storage_drawers table
        );
    }

    /**
     * Get the full location string for display
     */
    public function getLocationFullAttribute(): string
    {
        $parts = array_filter([
            $this->building,
            $this->room,
            $this->location
        ]);

        return implode(' - ', $parts);
    }

    /**
     * Get the actual item count (computed)
     */
    public function getActualItemCountAttribute(): int
    {
        return $this->items()->count();
    }

    /**
     * Get the actual drawer count (computed)
     */
    public function getActualDrawerCountAttribute(): int
    {
        return $this->drawers()->count();
    }

    /**
     * Update the drawer count based on actual drawers
     */
    public function updateDrawerCount(): void
    {
        $this->update(['drawer_count' => $this->drawers()->count()]);
    }

    /**
     * Scope for active cabinets only
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for cabinets in a specific building
     */
    public function scopeInBuilding($query, string $building)
    {
        return $query->where('building', $building);
    }

    /**
     * Scope for cabinets in a specific room
     */
    public function scopeInRoom($query, string $building, string $room)
    {
        return $query->where('building', $building)
                    ->where('room', $room);
    }
}