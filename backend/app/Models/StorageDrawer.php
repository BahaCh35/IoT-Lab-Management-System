<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class StorageDrawer extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';
    protected $table = 'storage_drawers';

    protected $fillable = [
        'id',
        'cabinet_id',
        'name',
        'description',
        'position',
        'item_count',
        'is_active',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
        'is_active' => 'boolean',
        'position' => 'integer',
        'item_count' => 'integer',
    ];

    /**
     * Get the cabinet that owns this drawer
     */
    public function cabinet(): BelongsTo
    {
        return $this->belongsTo(StorageCabinet::class, 'cabinet_id');
    }

    /**
     * Get all items in this drawer
     */
    public function items(): HasMany
    {
        return $this->hasMany(StorageItem::class, 'drawer_id');
    }

    /**
     * Get the actual item count (computed)
     */
    public function getActualItemCountAttribute(): int
    {
        return $this->items()->count();
    }

    /**
     * Update the item count based on actual items
     */
    public function updateItemCount(): void
    {
        $actualCount = $this->items()->count();
        if ($this->item_count !== $actualCount) {
            $this->update(['item_count' => $actualCount]);
        }
    }

    /**
     * Get the full location path for this drawer
     */
    public function getFullLocationAttribute(): string
    {
        $cabinet = $this->cabinet;
        if (!$cabinet) {
            return $this->name;
        }

        $parts = array_filter([
            $cabinet->building,
            $cabinet->room,
            $cabinet->name,
            $this->name
        ]);

        return implode(' → ', $parts);
    }

    /**
     * Check if this drawer is empty
     */
    public function getIsEmptyAttribute(): bool
    {
        return $this->items()->count() === 0;
    }

    /**
     * Get total quantity of all items in this drawer
     */
    public function getTotalQuantityAttribute(): int
    {
        return $this->items()->sum('quantity');
    }

    /**
     * Scope for active drawers only
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for drawers in a specific cabinet
     */
    public function scopeInCabinet($query, string $cabinetId)
    {
        return $query->where('cabinet_id', $cabinetId);
    }

    /**
     * Scope for empty drawers
     */
    public function scopeEmpty($query)
    {
        return $query->where('item_count', 0);
    }

    /**
     * Scope for drawers with items
     */
    public function scopeWithItems($query)
    {
        return $query->where('item_count', '>', 0);
    }

    /**
     * Boot method to handle model events
     */
    protected static function boot()
    {
        parent::boot();

        // Update cabinet drawer count when drawer is created or deleted
        static::created(function ($drawer) {
            $drawer->cabinet?->updateDrawerCount();
        });

        static::deleted(function ($drawer) {
            $drawer->cabinet?->updateDrawerCount();
        });
    }
}