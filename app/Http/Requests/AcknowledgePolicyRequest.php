<?php

namespace App\Http\Requests;

use App\Support\Permissions;
use Illuminate\Foundation\Http\FormRequest;

class AcknowledgePolicyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->can(Permissions::ACKNOWLEDGE_POLICIES);
    }

    public function rules(): array
    {
        return [
            'confirmed' => ['required', 'accepted'],
        ];
    }
}
