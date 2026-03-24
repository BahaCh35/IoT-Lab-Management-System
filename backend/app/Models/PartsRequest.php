<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PartsRequest extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id', 'technician_id', 'technician_name', 'part_name',
        'quantity', 'reason', 'requested_date', 'status', 'approved_by_id'
    ];

    protected $casts = ['requested_date' => 'datetime'];

    public function technician()
    {
        return $this->belongsTo(User::class, 'technician_id');
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by_id');
    }
}
