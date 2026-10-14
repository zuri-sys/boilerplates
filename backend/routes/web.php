<?php

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Route;

Route::get('/', fn (): JsonResponse => response()->json([
    'service' => 'Supportdesk API',
    'status' => 'ready',
    'health' => '/up',
]));
