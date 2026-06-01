<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\Request;

class ActivityLogController extends Controller
{
    public function index(Request $request)
    {
        $limit = $request->get('limit', 50);
        $logs = ActivityLog::with('user')
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();

        return response()->json($logs->map(fn($log) => [
            'id' => (string) $log->id,
            'userId' => (string) $log->user_id,
            'userName' => $log->user?->name ?? 'Unknown',
            'action' => $log->action,
            'entityType' => $log->entity_type,
            'entityId' => $log->entity_id,
            'details' => $log->details,
            'timestamp' => $log->created_at?->toISOString(),
        ]));
    }

    public function store(Request $request)
    {
        $request->validate([
            'userId' => 'required|exists:users,id',
            'action' => 'required|string|max:255',
            'entityType' => 'required|string|max:255',
            'entityId' => 'required|string|max:255',
            'details' => 'nullable|array',
        ]);

        $log = ActivityLog::create([
            'user_id' => $request->userId,
            'action' => $request->action,
            'entity_type' => $request->entityType,
            'entity_id' => $request->entityId,
            'details' => $request->details ?? [],
        ]);

        return response()->json([
            'id' => (string) $log->id,
            'userId' => (string) $log->user_id,
            'action' => $log->action,
            'entityType' => $log->entity_type,
            'entityId' => $log->entity_id,
            'details' => $log->details,
            'timestamp' => $log->created_at?->toISOString(),
        ], 201);
    }
}
