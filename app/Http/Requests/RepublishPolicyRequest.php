<?php

namespace App\Http\Requests;

use App\Support\Permissions;
use Illuminate\Foundation\Http\FormRequest;

class RepublishPolicyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->can(Permissions::MANAGE_POLICIES);
    }

    public function rules(): array
    {
        return [
            'due_date' => ['required', 'date', 'after_or_equal:today'],
        ];
    }
}
