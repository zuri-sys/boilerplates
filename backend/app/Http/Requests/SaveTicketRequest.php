<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SaveTicketRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'requester_name' => ['required', 'string', 'max:120'],
            'requester_email' => ['required', 'email', 'max:254'],
            'issue_category' => ['required', Rule::in(['Hardware', 'Software', 'Network', 'Account & access', 'Other'])],
            'priority' => ['required', Rule::in(['Low', 'Medium', 'High', 'Critical'])],
            'subject' => ['required', 'string', 'max:200'],
            'description' => ['required', 'string', 'max:10000'],
            'status' => [$this->isMethod('POST') ? 'sometimes' : 'required', Rule::in(['Open', 'In progress', 'Resolved', 'Closed'])],
        ];
    }
}
