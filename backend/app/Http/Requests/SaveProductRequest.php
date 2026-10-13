<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SaveProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'sku' => ['required', 'string', 'max:50', Rule::unique('products', 'sku')->ignore($this->route('product'))],
            'category' => ['required', Rule::in(['Furniture', 'Lighting', 'Decor', 'Textiles', 'Storage'])],
            'stock' => ['required', 'integer', 'min:0', 'max:10000000'],
            'reorder_level' => ['required', 'integer', 'min:0', 'max:10000000'],
            'price' => ['required', 'numeric', 'min:0', 'max:9999999999.99'],
            'location' => ['required', Rule::in(['Warehouse A', 'Warehouse B'])],
            'tone' => ['sometimes', Rule::in(['sage', 'sand', 'clay', 'pink', 'blue'])],
            'icon' => ['sometimes', Rule::in(['chair', 'lamp', 'vase', 'table', 'cushion', 'plant', 'basket'])],
        ];
    }
}
