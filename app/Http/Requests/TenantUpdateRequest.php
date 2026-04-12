<?php

namespace App\Http\Requests;

use App\Http\Requests\Concerns\NormalizesPhoneNumbers;
use App\Rules\ValidPhoneNumber;
use App\Support\Permissions;
use Illuminate\Foundation\Http\FormRequest;

class TenantUpdateRequest extends FormRequest
{
    use NormalizesPhoneNumbers;

    public function authorize(): bool
    {
        return (bool) $this->user()?->can(Permissions::MANAGE_TENANTS);
    }

    protected function prepareForValidation(): void
    {
        $this->normalizePhoneInputs(['contact_phone']);
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'registration_number' => ['nullable', 'string', 'max:255'],
            'industry' => ['nullable', 'string', 'max:255'],
            'company_size' => ['nullable', 'string', 'max:255'],
            'contact_name' => ['nullable', 'string', 'max:255'],
            'contact_email' => ['nullable', 'email', 'max:255'],
            'contact_phone' => ['nullable', new ValidPhoneNumber()],
        ];
    }
}
