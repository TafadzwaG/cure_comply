<?php

namespace App\Http\Requests;

use App\Support\Permissions;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class DepartmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->can(Permissions::MANAGE_DEPARTMENTS);
    }

    protected function prepareForValidation(): void
    {
        $user = $this->user();

        if (! $user) {
            return;
        }

        if ($user->isSuperAdmin()) {
            $tenantId = $this->input('tenant_id');

            $this->merge([
                'tenant_id' => filled($tenantId) ? (int) $tenantId : null,
            ]);

            return;
        }

        $this->merge([
            'tenant_id' => $user->tenant_id,
        ]);
    }

    public function rules(): array
    {
        return [
            'tenant_id' => [
                'required',
                'integer',
                Rule::exists('tenants', 'id'),
            ],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'status' => ['required', 'string', 'max:50'],
        ];
    }
}
