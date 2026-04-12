<?php

namespace App\Http\Requests;

use App\Http\Requests\Concerns\NormalizesPhoneNumbers;
use App\Rules\ValidPhoneNumber;
use Illuminate\Foundation\Http\FormRequest;

class AcceptInvitationRequest extends FormRequest
{
    use NormalizesPhoneNumbers;

    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->normalizePhoneInputs(['phone']);
    }

    public function rules(): array
    {
        return [
            'password' => ['required', 'confirmed', 'min:8'],
            'job_title' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', new ValidPhoneNumber()],
        ];
    }
}
