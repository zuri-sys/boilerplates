<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $products = [
            ['Arc lounge chair', 'FUR-001', 'Furniture', 48, 10, 249, 'Warehouse A', 'sand', 'chair'],
            ['Studio desk lamp', 'LGT-002', 'Lighting', 8, 15, 89, 'Warehouse A', 'sage', 'lamp'],
            ['Everyday ceramic vase', 'DEC-003', 'Decor', 124, 20, 34, 'Warehouse B', 'clay', 'vase'],
            ['Oak side table', 'FUR-004', 'Furniture', 32, 10, 129, 'Warehouse A', 'sand', 'table'],
            ['Linen cushion cover', 'TXT-005', 'Textiles', 0, 20, 24, 'Warehouse B', 'pink', 'cushion'],
            ['Terra planter', 'DEC-006', 'Decor', 76, 15, 42, 'Warehouse B', 'sage', 'plant'],
            ['Woven storage basket', 'ORG-007', 'Storage', 12, 15, 56, 'Warehouse A', 'sand', 'basket'],
            ['Pendant light · ivory', 'LGT-008', 'Lighting', 64, 10, 118, 'Warehouse B', 'blue', 'lamp'],
        ];
        foreach ($products as $row) {
            $data = array_combine(['name', 'sku', 'category', 'stock', 'reorder_level', 'price', 'location', 'tone', 'icon'], $row);
            Product::firstOrCreate(['sku' => $data['sku']], $data);
        }
    }
}
