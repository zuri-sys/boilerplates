<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;

class HelpdeskAuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'username' => ['required', 'string', 'max:120'],
            'password' => ['required', 'string', 'max:120'],
        ]);

        if (! hash_equals(config('helpdesk.username'), $credentials['username']) ||
            ! hash_equals(config('helpdesk.password'), $credentials['password'])) {
            return response()->json(['message' => 'Incorrect username or password. Please try again.'], 401);
        }

        $expiresAt = now()->addHours(config('helpdesk.session_hours'))->getTimestamp();
        $token = Crypt::encryptString(json_encode([
            'username' => $credentials['username'],
            'expires_at' => $expiresAt,
        ], JSON_THROW_ON_ERROR));

        return response()->json(['token' => $token, 'expires_at' => $expiresAt * 1000]);
    }
}
