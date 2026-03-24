<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index()
    {
        $users = User::all();
        return response()->json($users->map(fn($u) => $this->formatUser($u)));
    }

    public function show($id)
    {
        $user = User::findOrFail($id);
        return response()->json($this->formatUser($user));
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role ?? 'engineer',
            'department' => $request->department,
            'phone' => $request->phone,
            'join_date' => now()->format('Y-m-d'),
            'is_active' => true,
            'permissions' => $request->permissions ?? [],
        ]);

        return response()->json($this->formatUser($user), 201);
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'email' => 'email|unique:users,email,' . $id,
        ]);

        $user->update($request->only([
            'name', 'email', 'role', 'department', 'phone', 'permissions'
        ]));

        if ($request->has('password') && $request->password) {
            $user->update(['password' => Hash::make($request->password)]);
        }

        return response()->json($this->formatUser($user));
    }

    public function activate($id)
    {
        $user = User::findOrFail($id);
        $user->update(['is_active' => true]);
        return response()->json($this->formatUser($user));
    }

    public function deactivate($id)
    {
        $user = User::findOrFail($id);
        $user->update(['is_active' => false]);
        return response()->json($this->formatUser($user));
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $user->delete();
        return response()->json(['message' => 'User deleted successfully']);
    }

    public function activity($id)
    {
        $activity = ActivityLog::where('user_id', $id)
            ->orderBy('created_at', 'desc')
            ->get();
        return response()->json($activity->map(fn($a) => [
            'id' => (string) $a->id,
            'userId' => (string) $a->user_id,
            'action' => $a->action,
            'entityType' => $a->entity_type,
            'entityId' => $a->entity_id,
            'details' => $a->details,
            'timestamp' => $a->created_at?->toISOString(),
        ]));
    }

    public function stats()
    {
        $users = User::all();
        return response()->json([
            'totalUsers' => $users->count(),
            'activeUsers' => $users->where('is_active', true)->count(),
            'inactiveUsers' => $users->where('is_active', false)->count(),
            'engineers' => $users->where('role', 'engineer')->count(),
            'admins' => $users->where('role', 'admin')->count(),
            'technicians' => $users->where('role', 'technician')->count(),
            'byDepartment' => [
                'Engineering' => $users->where('department', 'Engineering')->count(),
                'Research' => $users->where('department', 'Research')->count(),
                'Administration' => $users->where('department', 'Administration')->count(),
                'Maintenance' => $users->where('department', 'Maintenance')->count(),
            ],
        ]);
    }

    private function formatUser($user)
    {
        return [
            'id' => (string) $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'department' => $user->department,
            'phone' => $user->phone,
            'avatar' => $user->avatar,
            'joinDate' => $user->join_date?->format('Y-m-d'),
            'isActive' => $user->is_active,
            'permissions' => $user->permissions ?? [],
            'createdAt' => $user->created_at?->toISOString(),
        ];
    }
}
