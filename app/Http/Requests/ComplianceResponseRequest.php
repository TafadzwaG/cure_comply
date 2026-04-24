<?php

namespace App\Http\Requests;

use App\Enums\ComplianceAnswerType;
use App\Models\ComplianceQuestion;
use App\Support\Permissions;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class ComplianceResponseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) ($this->user()?->can(Permissions::ANSWER_COMPLIANCE_QUESTIONS) || $this->user()?->can(Permissions::MANAGE_COMPLIANCE_SUBMISSIONS));
    }

    public function rules(): array
    {
        return [
            'responses' => ['required', 'array'],
            'responses.*.compliance_question_id' => ['required', 'integer'],
            'responses.*.answer_value' => ['nullable', 'string', 'max:50'],
            'responses.*.answer_text' => ['nullable', 'string'],
            'responses.*.comment_text' => ['nullable', 'string'],
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator) {
                $responses = collect($this->input('responses', []));
                $questions = ComplianceQuestion::query()
                    ->whereIn('id', $responses->pluck('compliance_question_id')->filter()->all())
                    ->get()
                    ->keyBy('id');

                foreach ($responses as $index => $payload) {
                    $question = $questions->get($payload['compliance_question_id'] ?? null);

                    if (! $question) {
                        continue;
                    }

                    $value = $payload['answer_value'] ?? null;
                    $text = $payload['answer_text'] ?? null;
                    $comment = $payload['comment_text'] ?? null;

                    if (blank($value) && blank($text) && blank($comment)) {
                        continue;
                    }

                    if ($question->answer_type === ComplianceAnswerType::YesNoPartial && filled($value)) {
                        if (! in_array($value, ['yes', 'no', 'partial'], true)) {
                            $validator->errors()->add("responses.{$index}.answer_value", 'Yes / No / Partial questions require a valid choice.');
                        }
                    }

                    if ($question->answer_type === ComplianceAnswerType::Score && filled($value) && (! is_numeric($value))) {
                        $validator->errors()->add("responses.{$index}.answer_value", 'Score questions require a numeric value.');
                    }
                }
            },
        ];
    }
}
