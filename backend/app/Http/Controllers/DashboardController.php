<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function __invoke(): JsonResponse
    {
        return response()->json([
            'total_products' => Product::count(),
            'total_units' => (int) Product::sum('stock'),
            'inventory_value' => (float) Product::selectRaw('COALESCE(SUM(stock * price), 0) AS value')->value('value'),
            'low_stock' => Product::whereColumn('stock', '<=', 'reorder_level')->get(),
            'categories' => Product::selectRaw('category, SUM(stock) AS units')->groupBy('category')->get(),
        ]);
    }
}
