<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StorageItem extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';
    protected $table = 'storage_items';

    protected $fillable = [
        'id',
        'drawer_id',
        'equipment_id',
        'name',
        'description',
        'category',
        'quantity',
        'unit_price',
        'supplier',
        'part_number',
        'added_date',
        'expiry_date',
        'minimum_stock',
        'is_consumable',
        'specifications',
        'image_url',
    ];

    protected $casts = [
        'specifications' => 'array',
        'added_date' => 'date',
        'expiry_date' => 'date',
        'is_consumable' => 'boolean',
        'unit_price' => 'decimal:2',
        'quantity' => 'integer',
        'minimum_stock' => 'integer',
    ];

    /**
     * Available categories for storage items
     */
    const CATEGORIES = [
        'microcontroller' => 'Microcontroller',
        'component' => 'Component',
        'tool' => 'Tool',
        'sensor' => 'Sensor',
        'other' => 'Other',
    ];

    /**
     * Get the drawer that contains this item
     */
    public function drawer(): BelongsTo
    {
        return $this->belongsTo(StorageDrawer::class, 'drawer_id');
    }

    /**
     * Get the equipment record linked to this item (if any)
     */
    public function equipment(): BelongsTo
    {
        return $this->belongsTo(Equipment::class, 'equipment_id');
    }

    /**
     * Get the cabinet through the drawer relationship
     */
    public function cabinet()
    {
        return $this->drawer?->cabinet;
    }

    /**
     * Check if this item is low stock
     */
    public function getIsLowStockAttribute(): bool
    {
        return $this->minimum_stock && $this->quantity <= $this->minimum_stock;
    }

    /**
     * Check if this item is expired
     */
    public function getIsExpiredAttribute(): bool
    {
        return $this->expiry_date && $this->expiry_date->isPast();
    }

    /**
     * Check if this item is expiring soon (within 30 days)
     */
    public function getIsExpiringSoonAttribute(): bool
    {
        return $this->expiry_date &&
               $this->expiry_date->isFuture() &&
               $this->expiry_date->isBeforeOrSameDay(now()->addDays(30));
    }

    /**
     * Get the full location path for this item
     */
    public function getFullLocationAttribute(): string
    {
        $drawer = $this->drawer;
        if (!$drawer) {
            return 'Unknown Location';
        }

        return $drawer->full_location . ' → ' . $this->name;
    }

    /**
     * Get the total value of this item (quantity * unit_price)
     */
    public function getTotalValueAttribute(): float
    {
        return $this->quantity * ($this->unit_price ?? 0);
    }

    /**
     * Get the category display name
     */
    public function getCategoryDisplayAttribute(): string
    {
        return self::CATEGORIES[$this->category] ?? ucfirst($this->category);
    }

    /**
     * Check if this item has linked equipment
     */
    public function getHasEquipmentAttribute(): bool
    {
        return !is_null($this->equipment_id);
    }

    /**
     * Scope for items in a specific category
     */
    public function scopeInCategory($query, string $category)
    {
        return $query->where('category', $category);
    }

    /**
     * Scope for low stock items
     */
    public function scopeLowStock($query)
    {
        return $query->whereColumn('quantity', '<=', 'minimum_stock')
                    ->whereNotNull('minimum_stock');
    }

    /**
     * Scope for expired items
     */
    public function scopeExpired($query)
    {
        return $query->where('expiry_date', '<', now())
                    ->whereNotNull('expiry_date');
    }

    /**
     * Scope for items expiring soon (within 30 days)
     */
    public function scopeExpiringSoon($query)
    {
        return $query->whereBetween('expiry_date', [
            now(),
            now()->addDays(30)
        ])->whereNotNull('expiry_date');
    }

    /**
     * Scope for consumable items
     */
    public function scopeConsumable($query)
    {
        return $query->where('is_consumable', true);
    }

    /**
     * Scope for items in a specific drawer
     */
    public function scopeInDrawer($query, string $drawerId)
    {
        return $query->where('drawer_id', $drawerId);
    }

    /**
     * Scope for items with linked equipment
     */
    public function scopeWithEquipment($query)
    {
        return $query->whereNotNull('equipment_id');
    }

    /**
     * Scope for items without linked equipment
     */
    public function scopeWithoutEquipment($query)
    {
        return $query->whereNull('equipment_id');
    }

    /**
     * Search items by name, description, or part number
     */
    public function scopeSearch($query, string $searchTerm)
    {
        return $query->where(function ($q) use ($searchTerm) {
            $q->where('name', 'LIKE', "%{$searchTerm}%")
              ->orWhere('description', 'LIKE', "%{$searchTerm}%")
              ->orWhere('part_number', 'LIKE', "%{$searchTerm}%")
              ->orWhere('supplier', 'LIKE', "%{$searchTerm}%");
        });
    }

    /**
     * Boot method to handle model events
     */
    protected static function boot()
    {
        parent::boot();

        // Update drawer item count when item is created, updated, or deleted
        static::created(function ($item) {
            $item->drawer?->updateItemCount();
        });

        static::updated(function ($item) {
            // If drawer changed, update both old and new drawer counts
            if ($item->isDirty('drawer_id')) {
                $oldDrawerId = $item->getOriginal('drawer_id');
                if ($oldDrawerId) {
                    StorageDrawer::find($oldDrawerId)?->updateItemCount();
                }
            }
            $item->drawer?->updateItemCount();
        });

        static::deleted(function ($item) {
            $item->drawer?->updateItemCount();
        });
    }
}