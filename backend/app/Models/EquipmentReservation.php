<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EquipmentReservation extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id', 'equipment_id', 'equipment_name', 'user_id', 'user_name',
        'start_date', 'end_date', 'status', 'approver_id', 'rejection_reason',
        'notes', 'created_date'
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'created_date' => 'datetime',
    ];

    public function equipment()
    {
        return $this->belongsTo(Equipment::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approver_id');
    }
}
