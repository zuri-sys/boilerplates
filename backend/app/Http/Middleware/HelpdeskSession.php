<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use JsonException;
use Symfony\Component\HttpFoundation\Response;

class HelpdeskSession
{
    /** @param Closure(Request): Response $next */
    public function handle(Request $request, Closure $next): Response
    {
        try {
            $session = json_decode(Crypt::decryptString($request->bearerToken() ?? ''), true, 512, JSON_THROW_ON_ERROR);
        } catch (DecryptException|JsonException $exception) {
            return response()->json(['message' => 'Please sign in to access helpdesk tickets.'], 401);
        }

        if (! is_array($session) || ($session['username'] ?? null) !== config('helpdesk.username') ||
            ($session['expires_at'] ?? 0) <= now()->getTimestamp()) {
            return response()->json(['message' => 'Your session expired. Please sign in again.'], 401);
        }

        return $next($request);
    }
}
