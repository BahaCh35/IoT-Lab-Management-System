<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $notifications = Notification::where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($notifications->map(fn($n) => $this->formatNotification($n)));
    }

    public function store(Request $request)
    {
        $request->validate([
            'type' => 'required|in:info,success,warning,error',
            'title' => 'required|string',
            'message' => 'required|string',
        ]);

        $notification = Notification::create([
            'id' => 'notif-' . time(),
            'user_id' => $request->user_id ?? $request->user()->id,
            'type' => $request->type,
            'title' => $request->title,
            'message' => $request->message,
            'read' => false,
            'icon' => $request->icon,
            'action_url' => $request->action_url,
            'entity_id' => $request->entity_id,
        ]);

        return response()->json($this->formatNotification($notification), 201);
    }

    public function markRead($id, Request $request)
    {
        $notification = Notification::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $notification->update(['read' => true]);
        return response()->json($this->formatNotification($notification));
    }

    public function markAllRead(Request $request)
    {
        Notification::where('user_id', $request->user()->id)
            ->update(['read' => true]);

        return response()->json(['message' => 'All notifications marked as read']);
    }

    public function destroy($id, Request $request)
    {
        $notification = Notification::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $notification->delete();
        return response()->json(['message' => 'Notification deleted']);
    }

    public function clearAll(Request $request)
    {
        Notification::where('user_id', $request->user()->id)->delete();
        return response()->json(['message' => 'All notifications cleared']);
    }

    public function unreadCount(Request $request)
    {
        $count = Notification::where('user_id', $request->user()->id)
            ->where('read', false)
            ->count();

        return response()->json(['count' => $count]);
    }

    private function formatNotification($notification)
    {
        return [
            'id' => $notification->id,
            'type' => $notification->type,
            'title' => $notification->title,
            'message' => $notification->message,
            'timestamp' => $notification->created_at?->toISOString(),
            'read' => $notification->read,
            'icon' => $notification->icon,
            'actionUrl' => $notification->action_url,
            'entityId' => $notification->entity_id,
        ];
    }
}
