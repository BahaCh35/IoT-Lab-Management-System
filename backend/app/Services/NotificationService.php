<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class NotificationService
{
    public function __construct(private FCMService $fcm) {}

    /**
     * Create an in-app notification and send FCM push to a single user.
     *
     * @param  int|string  $userId
     * @param  string      $type       info|success|warning|error
     * @param  string      $title
     * @param  string      $message
     * @param  array       $opts       entity_id, action_url, icon
     */
    public function notifyUser(int|string $userId, string $type, string $title, string $message, array $opts = []): void
    {
        // 1. Persist in-app notification
        Notification::create([
            'id'         => 'notif-' . uniqid(),
            'user_id'    => $userId,
            'type'       => $type,
            'title'      => $title,
            'message'    => $message,
            'read'       => false,
            'icon'       => $opts['icon'] ?? null,
            'action_url' => $opts['action_url'] ?? null,
            'entity_id'  => $opts['entity_id'] ?? null,
        ]);

        // 2. Send FCM push to all registered browser tokens for this user
        $this->pushToUser($userId, $title, $message, $opts);
    }

    /**
     * Notify all admin users.
     */
    public function notifyAdmins(string $type, string $title, string $message, array $opts = []): void
    {
        $admins = User::where('role', 'admin')->where('is_active', true)->get();

        foreach ($admins as $admin) {
            $this->notifyUser($admin->id, $type, $title, $message, $opts);
        }
    }

    /**
     * Notify all technician users.
     */
    public function notifyTechnicians(string $type, string $title, string $message, array $opts = []): void
    {
        $technicians = User::where('role', 'technician')->where('is_active', true)->get();

        foreach ($technicians as $technician) {
            $this->notifyUser($technician->id, $type, $title, $message, $opts);
        }
    }

    /**
     * Send FCM push (only) to all device tokens of a user — no DB write.
     */
    private function pushToUser(int|string $userId, string $title, string $body, array $data = []): void
    {
        $user = User::with('deviceTokens')->find($userId);

        if (!$user) {
            return;
        }

        foreach ($user->deviceTokens as $deviceToken) {
            try {
                $this->fcm->sendToToken($deviceToken->token, $title, $body, $data);
            } catch (\Throwable $e) {
                Log::error('FCM push error', [
                    'user_id' => $userId,
                    'error'   => $e->getMessage(),
                ]);
            }
        }
    }
}
