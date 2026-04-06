<?php

namespace App\Http\Requests;

use App\Enums\ComplianceAnswerType;
use App\Support\Permissions;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ComplianceQuestionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->can(Permissions::MANAGE_COMPLIANCE_FRAMEWORKS);
    }

    public function rules(): array
    {
        return [
            'code' => ['nullable', 'string', 'max:100'],
            'question_text' => ['required', 'string'],
            'answer_type' => ['required', Rule::in(array_column(ComplianceAnswerType::cases(), 'value'))],
            'weight' => ['required', 'numeric', 'min:0.01'],
            'requires_evidence' => ['nullable', 'boolean'],
            'guidance_text' => ['nullable', 'string'],
            'sort_order' => ['required', 'integer', 'min:1'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
