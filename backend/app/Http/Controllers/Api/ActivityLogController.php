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
            'action' => $log->action,
            'entityType' => $log->entity_type,
            'entityId' => $log->entity_id,
            'details' => $log->details,
            'timestamp' => $log->created_at?->toISOString(),
        ]));
    }
}
