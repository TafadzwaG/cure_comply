<?php

namespace App\Http\Requests\Settings;

use App\Models\Tenant;
use App\Support\TenantBranding;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TenantBrandingUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();

        if (! $user) {
            return false;
        }

        if ($user->isSuperAdmin()) {
            return true;
        }

        return $user->hasRole('company_admin');
    }

    public function rules(): array
    {
        return [
            'tenant_id' => ['nullable', 'integer', Rule::exists('tenants', 'id')],
            'primary_color' => ['nullable', 'string', 'max:7', 'regex:/^#?[0-9A-Fa-f]{6}$/'],
            'logo' => ['nullable', 'image', 'max:4096'],
            'remove_logo' => ['nullable', 'boolean'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'remove_logo' => $this->boolean('remove_logo'),
            'primary_color' => TenantBranding::normalizeHex($this->input('primary_color')),
        ]);
    }

    public function resolvedTenant(): ?Tenant
    {
        $user = $this->user();

        if ($user?->isSuperAdmin()) {
            $tenantId = $this->input('tenant_id')
                ?: $this->query('tenant_id')
                ?: $this->route('tenant');

            return $tenantId ? Tenant::query()->find($tenantId) : null;
        }

        return $user?->tenant ?? ($user?->tenant_id ? Tenant::query()->find($user->tenant_id) : null);
    }
}
