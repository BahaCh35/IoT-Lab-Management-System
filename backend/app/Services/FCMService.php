<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FCMService
{
    private ?string $projectId = null;
    private ?array $serviceAccount = null;
    private bool $enabled = false;

    public function __construct()
    {
        $projectId = config('services.firebase.project_id');
        $credentialsPath = config('services.firebase.credentials');

        // Push notifications are optional. If Firebase isn't configured (e.g.
        // local dev without FIREBASE_PROJECT_ID), skip silently instead of
        // throwing — that would break every endpoint that DI-injects this
        // service via NotificationService.
        if (!$projectId || !$credentialsPath || !file_exists($credentialsPath)) {
            Log::info('FCMService disabled: Firebase config missing', [
                'has_project_id'   => (bool) $projectId,
                'credentials_path' => $credentialsPath,
                'file_exists'      => $credentialsPath ? file_exists($credentialsPath) : false,
            ]);
            return;
        }

        $serviceAccount = json_decode((string) file_get_contents($credentialsPath), true);
        if (!is_array($serviceAccount) || empty($serviceAccount['client_email']) || empty($serviceAccount['private_key'])) {
            Log::warning('FCMService disabled: invalid service account JSON', [
                'credentials_path' => $credentialsPath,
            ]);
            return;
        }

        $this->projectId = $projectId;
        $this->serviceAccount = $serviceAccount;
        $this->enabled = true;
    }

    /**
     * Send a push notification to a single FCM device token.
     */
    public function sendToToken(string $token, string $title, string $body, array $data = []): void
    {
        if (!$this->enabled) {
            // Silently skip when Firebase isn't configured.
            return;
        }

        $accessToken = $this->getAccessToken();

        $response = Http::withToken($accessToken)
            ->post("https://fcm.googleapis.com/v1/projects/{$this->projectId}/messages:send", [
                'message' => [
                    'token' => $token,
                    'notification' => [
                        'title' => $title,
                        'body'  => $body,
                    ],
                    'data' => array_map('strval', $data),
                    'webpush' => [
                        'notification' => [
                            'title' => $title,
                            'body'  => $body,
                            'icon'  => '/logo192.png',
                            'badge' => '/logo192.png',
                        ],
                        'fcm_options' => [
                            'link' => $data['action_url'] ?? '/',
                        ],
                    ],
                ],
            ]);

        if ($response->failed()) {
            Log::warning('FCM send failed', [
                'token'    => substr($token, 0, 20) . '...',
                'status'   => $response->status(),
                'response' => $response->json(),
            ]);
        }
    }

    /**
     * Obtain an OAuth2 access token using the service account JWT flow.
     * Cached for 55 minutes (token is valid for 60).
     */
    private function getAccessToken(): string
    {
        return Cache::remember('fcm_access_token', 55 * 60, function () {
            $now = time();

            $payload = [
                'iss'   => $this->serviceAccount['client_email'],
                'scope' => 'https://www.googleapis.com/auth/firebase.messaging',
                'aud'   => 'https://oauth2.googleapis.com/token',
                'iat'   => $now,
                'exp'   => $now + 3600,
            ];

            $jwt = $this->buildJWT($payload, $this->serviceAccount['private_key']);

            $response = Http::asForm()->post('https://oauth2.googleapis.com/token', [
                'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                'assertion'  => $jwt,
            ]);

            if ($response->failed()) {
                throw new \RuntimeException('Failed to obtain FCM access token: ' . $response->body());
            }

            return $response->json('access_token');
        });
    }

    /**
     * Build a signed RS256 JWT from payload using the service account private key.
     */
    private function buildJWT(array $payload, string $privateKey): string
    {
        $encode = fn(array|string $data): string => rtrim(
            strtr(base64_encode(is_array($data) ? json_encode($data) : $data), '+/', '-_'),
            '='
        );

        $header  = $encode(['alg' => 'RS256', 'typ' => 'JWT']);
        $body    = $encode($payload);
        $signing = "{$header}.{$body}";

        openssl_sign($signing, $signature, $privateKey, OPENSSL_ALGO_SHA256);

        return "{$signing}.{$encode($signature)}";
    }
}
