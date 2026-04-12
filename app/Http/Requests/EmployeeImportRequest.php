<?php

namespace App\Http\Requests;

use App\Models\Tenant;
use App\Support\Permissions;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class EmployeeImportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->can(Permissions::MANAGE_USERS);
    }

    public function rules(): array
    {
        return [
            'tenant_id' => ['nullable', 'integer', Rule::exists(Tenant::class, 'id')],
            'file' => [
                'required',
                'file',
                'max:20480',
                'mimes:xlsx,csv',
                'mimetypes:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv,text/plain',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'file.mimetypes' => 'Upload an Excel (.xlsx) or CSV file.',
            'file.mimes' => 'Upload an Excel (.xlsx) or CSV file.',
        ];
    }

    protected function prepareForValidation(): void
    {
        $user = $this->user();

        if (! $user) {
            return;
        }

        if (! $user->isSuperAdmin()) {
            $this->merge([
                'tenant_id' => $user->tenant_id,
            ]);

            return;
        }

        $this->merge([
            'tenant_id' => $this->filled('tenant_id') ? (int) $this->input('tenant_id') : null,
        ]);
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            if ($this->user()?->isSuperAdmin() && ! $this->tenantId()) {
                $validator->errors()->add('tenant_id', 'Select the company that should own the imported employees.');
            }
        });
    }

    public function tenantId(): ?int
    {
        return $this->filled('tenant_id') ? (int) $this->input('tenant_id') : null;
    }
}
