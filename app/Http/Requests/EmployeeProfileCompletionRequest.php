<?php

namespace App\Http\Requests;

use App\Http\Requests\Concerns\NormalizesPhoneNumbers;
use App\Rules\ValidPhoneNumber;
use Illuminate\Foundation\Http\FormRequest;

class EmployeeProfileCompletionRequest extends FormRequest
{
    use NormalizesPhoneNumbers;

    public function authorize(): bool
    {
        return (bool) $this->user();
    }

    protected function prepareForValidation(): void
    {
        $this->normalizePhoneInputs(['phone', 'alternate_phone']);
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'job_title' => ['required', 'string', 'max:255'],
            'branch' => ['required', 'string', 'max:255'],
            'phone' => ['required', new ValidPhoneNumber(required: true)],
            'alternate_phone' => ['nullable', new ValidPhoneNumber()],
            'employment_type' => ['nullable', 'string', 'max:100'],
        ];
    }
}
