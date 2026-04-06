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

    public function rules(): array
    {
        $isSuperAdmin = $this->user()?->isSuperAdmin();

        return [
            'tenant_id' => [
                $isSuperAdmin ? 'required' : 'nullable',
                'integer',
                Rule::exists('tenants', 'id'),
            ],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'status' => ['required', 'string', 'max:50'],
        ];
    }
}
