<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ApprovalRequest extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id', 'type', 'status', 'requester_id', 'description',
        'details', 'requested_date', 'reviewed_by_id', 'reviewed_date',
        'rejection_reason', 'priority'
    ];

    protected $casts = [
        'details' => 'array',
        'requested_date' => 'date',
        'reviewed_date' => 'date',
    ];

    public function requester()
    {
        return $this->belongsTo(User::class, 'requester_id');
    }

    public function reviewedBy()
    {
        return $this->belongsTo(User::class, 'reviewed_by_id');
    }
}
