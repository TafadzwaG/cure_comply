<?php

namespace App\Http\Controllers;

use App\Models\Question;
use App\Models\QuestionOption;
use App\Models\Test;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class QuestionController extends Controller
{
    public function store(Request $request, Test $test): RedirectResponse
    {
        $this->authorize('update', $test);

        if ($request->input('question_type') === 'text') {
            $request->merge(['options' => []]);
        }

        $validated = $request->validate([
            'question_text' => ['required', 'string'],
            'question_type' => ['required', 'string', 'in:single_choice,text'],
            'marks' => ['required', 'integer', 'min:1'],
            'is_active' => ['nullable', 'boolean'],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
            'options' => ['array'],
            'options.*.option_text' => ['required_with:options', 'string'],
            'options.*.is_correct' => ['nullable', 'boolean'],
        ]);

        $imagePath = $request->hasFile('image')
            ? $request->file('image')->store('questions', 'public')
            : null;

        DB::transaction(function () use ($test, $validated, $imagePath) {
            $sortOrder = ($test->questions()->max('sort_order') ?? 0) + 1;

            $question = Question::query()->create([
                'test_id' => $test->id,
                'question_text' => $validated['question_text'],
                'question_type' => $validated['question_type'],
                'marks' => $validated['marks'],
                'sort_order' => $sortOrder,
                'is_active' => $validated['is_active'] ?? true,
                'image_path' => $imagePath,
            ]);

            if (($validated['question_type'] ?? null) === 'single_choice') {
                foreach ($validated['options'] ?? [] as $index => $option) {
                    QuestionOption::query()->create([
                        'question_id' => $question->id,
                        'option_text' => $option['option_text'],
                        'is_correct' => $option['is_correct'] ?? false,
                        'sort_order' => $index + 1,
                    ]);
                }
            }
        });

        return back()->with('success', 'Question added.');
    }

    public function update(Request $request, Test $test, Question $question): RedirectResponse
    {
        $this->authorize('update', $test);

        if ($request->input('question_type') === 'text') {
            $request->merge(['options' => []]);
        }

        $validated = $request->validate([
            'question_text' => ['required', 'string'],
            'question_type' => ['required', 'string', 'in:single_choice,text'],
            'marks' => ['required', 'integer', 'min:1'],
            'is_active' => ['nullable', 'boolean'],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
            'remove_image' => ['nullable', 'boolean'],
            'options' => ['array'],
            'options.*.id' => ['nullable', 'integer'],
            'options.*.option_text' => ['required_with:options', 'string'],
            'options.*.is_correct' => ['nullable', 'boolean'],
        ]);

        $newImagePath = $question->image_path;
        if ($request->hasFile('image')) {
            if ($question->image_path) {
                Storage::disk('public')->delete($question->image_path);
            }
            $newImagePath = $request->file('image')->store('questions', 'public');
        } elseif (! empty($validated['remove_image']) && $question->image_path) {
            Storage::disk('public')->delete($question->image_path);
            $newImagePath = null;
        }

        DB::transaction(function () use ($question, $validated, $newImagePath) {
            $question->update([
                'question_text' => $validated['question_text'],
                'question_type' => $validated['question_type'],
                'marks' => $validated['marks'],
                'is_active' => $validated['is_active'] ?? true,
                'image_path' => $newImagePath,
            ]);

            if (($validated['question_type'] ?? null) !== 'single_choice') {
                $question->options()->delete();

                return;
            }

            $incomingOptionIds = collect($validated['options'] ?? [])
                ->pluck('id')
                ->filter()
                ->all();

            $question->options()
                ->whereNotIn('id', $incomingOptionIds)
                ->delete();

            foreach ($validated['options'] ?? [] as $index => $optionData) {
                if (! empty($optionData['id'])) {
                    QuestionOption::query()
                        ->where('id', $optionData['id'])
                        ->where('question_id', $question->id)
                        ->update([
                            'option_text' => $optionData['option_text'],
                            'is_correct' => $optionData['is_correct'] ?? false,
                            'sort_order' => $index + 1,
                        ]);
                } else {
                    QuestionOption::query()->create([
                        'question_id' => $question->id,
                        'option_text' => $optionData['option_text'],
                        'is_correct' => $optionData['is_correct'] ?? false,
                        'sort_order' => $index + 1,
                    ]);
                }
            }
        });

        return back()->with('success', 'Question updated.');
    }

    public function destroy(Test $test, Question $question): RedirectResponse
    {
        $this->authorize('update', $test);

        if ($question->image_path) {
            Storage::disk('public')->delete($question->image_path);
        }

        $question->delete();

        return back()->with('success', 'Question deleted.');
    }
}
