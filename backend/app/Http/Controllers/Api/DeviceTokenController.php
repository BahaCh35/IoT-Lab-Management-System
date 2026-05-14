<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DeviceToken;
use Illuminate\Http\Request;

class DeviceTokenController extends Controller
{
    /**
     * Register (upsert) an FCM device token for the authenticated user.
     *
     * POST /api/device-tokens
     * Body: { "token": "..." }
     */
    public function register(Request $request)
    {
        $request->validate(['token' => 'required|string']);

        DeviceToken::updateOrCreate(
            ['token'   => $request->token],
            ['user_id' => $request->user()->id]
        );

        return response()->json(['message' => 'Device token registered'], 200);
    }

    /**
     * Unregister an FCM device token for the authenticated user.
     *
     * DELETE /api/device-tokens
     * Body: { "token": "..." }
     */
    public function unregister(Request $request)
    {
        $request->validate(['token' => 'required|string']);

        DeviceToken::where('token', $request->token)
            ->where('user_id', $request->user()->id)
            ->delete();

        return response()->json(['message' => 'Device token removed'], 200);
    }
}
