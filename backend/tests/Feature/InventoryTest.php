<?php

namespace Tests\Feature;

use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InventoryTest extends TestCase
{
    use RefreshDatabase;

    private function productData(): array
    {
        return ['name' => 'Test chair', 'sku' => 'CHAIR-001', 'category' => 'Furniture', 'stock' => 10, 'reorder_level' => 5, 'price' => 100, 'location' => 'Warehouse A'];
    }

    public function test_creating_product_records_opening_stock_and_rejects_duplicate_sku(): void
    {
        $this->postJson('/api/products', $this->productData())->assertCreated()->assertJsonPath('stock', 10);
        $this->assertDatabaseHas('stock_movements', ['quantity' => 10, 'note' => 'Opening stock']);
        $this->postJson('/api/products', $this->productData())->assertUnprocessable()->assertJsonValidationErrors('sku');
    }

    public function test_adjustment_is_persisted_and_cannot_make_stock_negative(): void
    {
        $product = Product::create($this->productData());
        $this->postJson('/api/stock-movements', ['product_id' => $product->id, 'quantity' => -3, 'note' => 'Dispatched'])->assertCreated()->assertJsonPath('product.stock', 7);
        $this->postJson('/api/stock-movements', ['product_id' => $product->id, 'quantity' => -8])->assertUnprocessable();
        $this->assertDatabaseHas('products', ['id' => $product->id, 'stock' => 7]);
        $this->assertDatabaseCount('stock_movements', 1);
    }

    public function test_product_edits_record_stock_delta(): void
    {
        $product = Product::create($this->productData());
        $this->putJson('/api/products/'.$product->id, [...$this->productData(), 'stock' => 12])->assertOk();
        $this->assertDatabaseHas('stock_movements', ['product_id' => $product->id, 'quantity' => 2]);
    }

    public function test_invalid_stock_and_zero_adjustments_are_rejected(): void
    {
        $this->postJson('/api/products', [...$this->productData(), 'stock' => -1])->assertUnprocessable();
        $product = Product::create($this->productData());
        $this->postJson('/api/stock-movements', ['product_id' => $product->id, 'quantity' => 0])->assertUnprocessable();
    }

    public function test_dashboard_uses_current_inventory(): void
    {
        Product::create($this->productData());
        $this->getJson('/api/dashboard')->assertOk()->assertJsonPath('total_products', 1)->assertJsonPath('total_units', 10)->assertJsonPath('inventory_value', 1000);
    }
}
