<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    protected $fillable = ['name', 'sku', 'category', 'stock', 'reorder_level', 'price', 'location', 'tone', 'icon'];

    protected function casts(): array
    {
        return ['stock' => 'integer', 'reorder_level' => 'integer', 'price' => 'float'];
    }

    public function movements(): HasMany
    {
        return $this->hasMany(StockMovement::class);
    }
}
