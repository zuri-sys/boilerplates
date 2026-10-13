<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\StockMovement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class StockMovementController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(StockMovement::with('product:id,name,sku')->latest('id')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'quantity' => ['required', 'integer', 'not_in:0', 'between:-10000000,10000000'],
            'note' => ['nullable', 'string', 'max:255'],
        ]);
        $result = DB::transaction(function () use ($data): array {
            $product = Product::lockForUpdate()->findOrFail($data['product_id']);
            $nextStock = $product->stock + $data['quantity'];
            if ($nextStock < 0 || $nextStock > 10000000) {
                throw ValidationException::withMessages(['quantity' => 'Stock must stay between 0 and 10,000,000 units.']);
            }
            $product->update(['stock' => $nextStock]);
            $movement = $product->movements()->create(['quantity' => $data['quantity'], 'note' => $data['note'] ?? null]);

            return ['product' => $product, 'movement' => $movement->load('product:id,name,sku')];
        });

        return response()->json($result, 201);
    }
}
