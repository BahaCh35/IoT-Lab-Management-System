<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'department',
        'phone',
        'avatar',
        'join_date',
        'is_active',
        'permissions',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'permissions' => 'array',
            'is_active' => 'boolean',
            'join_date' => 'date',
        ];
    }

    public function checkouts()
    {
        return $this->hasMany(Checkout::class);
    }

    public function equipmentReservations()
    {
        return $this->hasMany(EquipmentReservation::class);
    }

    public function labReservations()
    {
        return $this->hasMany(LabReservation::class);
    }

    public function meetingRoomReservations()
    {
        return $this->hasMany(MeetingRoomReservation::class);
    }

    public function maintenanceRequests()
    {
        return $this->hasMany(MaintenanceRequest::class, 'reported_by_id');
    }

    public function assignedMaintenanceTasks()
    {
        return $this->hasMany(MaintenanceRequest::class, 'assigned_to_id');
    }

    public function partsRequests()
    {
        return $this->hasMany(PartsRequest::class, 'technician_id');
    }

    public function approvalRequests()
    {
        return $this->hasMany(ApprovalRequest::class, 'requester_id');
    }

    public function activityLogs()
    {
        return $this->hasMany(ActivityLog::class);
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }
}
