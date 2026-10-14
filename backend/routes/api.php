<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\StockMovementController;
use App\Http\Controllers\HelpdeskAuthController;
use App\Http\Controllers\TicketController;
use App\Http\Middleware\HelpdeskSession;
use Illuminate\Support\Facades\Route;

Route::get('/dashboard', DashboardController::class);
Route::apiResource('products', ProductController::class)->except('destroy');
Route::get('/stock-movements', [StockMovementController::class, 'index']);
Route::post('/stock-movements', [StockMovementController::class, 'store']);

Route::post('/auth/login', [HelpdeskAuthController::class, 'login'])->middleware('throttle:10,1');
Route::apiResource('tickets', TicketController::class)->middleware(HelpdeskSession::class);
