<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ChatbotService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ChatbotController extends Controller
{
    public function __construct(private readonly ChatbotService $chatbotService)
    {
    }

    /**
     * Send a message to Nova and receive a role-scoped AI response.
     *
     * POST /api/chatbot/message
     * Body: { message: string, history: Array<{ role: 'user'|'nova', text: string }> }
     * Response: { response: string }
     */
    public function sendMessage(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'message'         => 'required|string|max:2000',
            'history'         => 'array|max:40',
            'history.*.role'  => 'required|in:user,nova',
            'history.*.text'  => 'required|string|max:4000',
        ]);

        /** @var \App\Models\User $user */
        $user = Auth::user();

        $responseText = $this->chatbotService->sendMessage(
            $user,
            $validated['message'],
            $validated['history'] ?? []
        );

        return response()->json(['response' => $responseText]);
    }
}
