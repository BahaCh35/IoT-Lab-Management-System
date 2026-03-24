<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';
    protected $table = 'notifications';

    protected $fillable = [
        'id', 'user_id', 'type', 'title', 'message',
        'read', 'icon', 'action_url', 'entity_id'
    ];

    protected $casts = ['read' => 'boolean'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
