<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MeetingRoomReservation extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id', 'room_id', 'user_id', 'title', 'date',
        'start_time', 'end_time', 'status', 'approver_id'
    ];

    protected $casts = ['date' => 'date'];

    public function room()
    {
        return $this->belongsTo(MeetingRoom::class, 'room_id');
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
