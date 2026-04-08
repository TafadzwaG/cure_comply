<?php

namespace App\Http\Requests;

use App\Support\Permissions;
use Illuminate\Foundation\Http\FormRequest;

class TestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) ($this->user()?->hasRole('company_admin') || $this->user()?->can(Permissions::MANAGE_TESTS));
    }

    public function rules(): array
    {
        return [
            'course_id' => ['nullable', 'integer'],
            'compliance_framework_id' => ['nullable', 'integer', 'exists:compliance_frameworks,id'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'pass_mark' => ['required', 'integer', 'min:0', 'max:100'],
            'time_limit_minutes' => ['nullable', 'integer', 'min:1'],
            'max_attempts' => ['required', 'integer', 'min:1'],
            'status' => ['required', 'string', 'max:50'],
        ];
    }
}
