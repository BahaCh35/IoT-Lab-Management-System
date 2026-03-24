<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MeetingRoom extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = ['id', 'name', 'capacity', 'floor', 'location', 'amenities', 'is_active'];

    protected $casts = [
        'amenities' => 'array',
        'is_active' => 'boolean',
    ];

    public function reservations()
    {
        return $this->hasMany(MeetingRoomReservation::class, 'room_id');
    }
}
