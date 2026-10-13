<?php

namespace App\Http\Controllers;

use App\Http\Requests\SaveProductRequest;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class ProductController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Product::orderBy('id')->get());
    }

    public function store(SaveProductRequest $request): JsonResponse
    {
        $product = DB::transaction(function () use ($request): Product {
            $product = Product::create($request->validated());
            if ($product->stock > 0) {
                $product->movements()->create(['quantity' => $product->stock, 'note' => 'Opening stock']);
            }

            return $product;
        });

        return response()->json($product, 201);
    }

    public function show(Product $product): JsonResponse
    {
        return response()->json($product);
    }

    public function update(SaveProductRequest $request, Product $product): JsonResponse
    {
        $updated = DB::transaction(function () use ($request, $product): Product {
            $locked = Product::lockForUpdate()->findOrFail($product->id);
            $data = $request->validated();
            $change = $data['stock'] - $locked->stock;
            $locked->update($data);
            if ($change !== 0) {
                $locked->movements()->create(['quantity' => $change, 'note' => 'Stock updated in product editor']);
            }

            return $locked;
        });

        return response()->json($updated);
    }
}
