<?php

namespace App\Http\Requests;

use App\Models\LibraryFile;
use App\Models\Tenant;
use App\Support\Permissions;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class LibraryFileStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->can(Permissions::MANAGE_FILE_LIBRARY);
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:4000'],
            'category' => ['required', 'string', Rule::in(LibraryFile::categoryOptions())],
            'scope' => ['nullable', 'string', Rule::in(['shared', 'tenant'])],
            'tenant_id' => ['nullable', 'integer', Rule::exists('tenants', 'id')],
            'file' => [
                'required',
                'file',
                'max:20480',
                'mimes:pdf,doc,docx,xls,xlsx,csv,png,jpg,jpeg',
                'mimetypes:application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv,image/png,image/jpeg',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'file.mimetypes' => 'The file content does not match an allowed type. Only PDF, Word, Excel, CSV, and image files are accepted.',
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
                'scope' => 'tenant',
                'tenant_id' => $user->tenant_id,
            ]);

            return;
        }

        $this->merge([
            'tenant_id' => $this->filled('tenant_id') ? (int) $this->input('tenant_id') : null,
            'scope' => $this->input('scope', 'shared'),
        ]);
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator): void {
            if ($this->scope() === 'tenant' && ! $this->tenantId()) {
                $validator->errors()->add('tenant_id', 'Select the tenant that should own this file.');
            }
        });
    }

    public function scope(): string
    {
        return $this->input('scope', 'shared');
    }

    public function tenantId(): ?int
    {
        return $this->filled('tenant_id') ? (int) $this->input('tenant_id') : null;
    }

    public function resolvedTenant(): ?Tenant
    {
        $tenantId = $this->scope() === 'tenant' ? $this->tenantId() : null;

        return $tenantId ? Tenant::query()->find($tenantId) : null;
    }
}
