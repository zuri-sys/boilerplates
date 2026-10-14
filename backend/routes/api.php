<?php

use App\Http\Controllers\HelpdeskAuthController;
use App\Http\Controllers\TicketController;
use App\Http\Middleware\HelpdeskSession;
use Illuminate\Support\Facades\Route;

Route::post('/auth/login', [HelpdeskAuthController::class, 'login'])->middleware('throttle:10,1');
Route::apiResource('tickets', TicketController::class)->middleware(HelpdeskSession::class);
