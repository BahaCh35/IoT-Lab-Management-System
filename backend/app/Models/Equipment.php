<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Equipment extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';
    protected $table = 'equipment';

    protected $fillable = [
        'id', 'name', 'description', 'category', 'status', 'qr_code',
        'specifications', 'acquisition_date', 'usage_count', 'last_used_by',
        'last_used_date', 'image_url', 'building', 'room', 'cabinet', 'drawer', 'shelf'
    ];

    protected $casts = [
        'specifications' => 'array',
        'acquisition_date' => 'date',
        'last_used_date' => 'datetime',
    ];

    public function getLocationAttribute()
    {
        return [
            'building' => $this->building,
            'room' => $this->room,
            'cabinet' => $this->cabinet,
            'drawer' => $this->drawer,
            'shelf' => $this->shelf,
        ];
    }

    public function checkouts()
    {
        return $this->hasMany(Checkout::class);
    }

    public function reservations()
    {
        return $this->hasMany(EquipmentReservation::class);
    }

    public function maintenanceRequests()
    {
        return $this->hasMany(MaintenanceRequest::class);
    }
}
