<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MaintenanceRequest extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id', 'equipment_id', 'equipment_name', 'problem_description',
        'reported_by_id', 'reported_date', 'priority', 'status',
        'assigned_to_id', 'claimed_date', 'completed_date', 'notes',
        'parts_used', 'time_spent', 'photos',
        'building', 'room', 'cabinet', 'drawer', 'shelf'
    ];

    protected $casts = [
        'reported_date' => 'datetime',
        'claimed_date' => 'datetime',
        'completed_date' => 'datetime',
        'parts_used' => 'array',
        'photos' => 'array',
        'time_spent' => 'decimal:2',
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

    public function equipment()
    {
        return $this->belongsTo(Equipment::class);
    }

    public function reportedBy()
    {
        return $this->belongsTo(User::class, 'reported_by_id');
    }

    public function assignedTo()
    {
        return $this->belongsTo(User::class, 'assigned_to_id');
    }
}
