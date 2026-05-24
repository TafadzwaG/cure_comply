<?php

namespace App\Http\Requests;

use App\Enums\TenantStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PublicTrainingAcknowledgementRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'tenant_id' => [
                'required',
                'integer',
                Rule::exists('tenants', 'id')->where('status', TenantStatus::Active->value)->whereNull('deleted_at'),
            ],
            'full_name' => ['required', 'string', 'max:255'],
            'acknowledgement' => ['accepted'],
        ];
    }
}
