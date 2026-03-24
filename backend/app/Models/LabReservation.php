<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LabReservation extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id', 'lab_id', 'user_id', 'purpose', 'date',
        'start_time', 'end_time', 'status', 'approver_id'
    ];

    protected $casts = [
        'date' => 'date',
    ];

    public function lab()
    {
        return $this->belongsTo(Lab::class);
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
