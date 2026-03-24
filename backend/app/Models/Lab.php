<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Lab extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = ['id', 'name', 'capacity', 'equipment', 'floor', 'is_active'];

    protected $casts = [
        'equipment' => 'array',
        'is_active' => 'boolean',
    ];

    public function reservations()
    {
        return $this->hasMany(LabReservation::class);
    }
}
