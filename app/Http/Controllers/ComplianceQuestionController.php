<?php

namespace App\Http\Controllers;

use App\Http\Requests\ComplianceQuestionRequest;
use App\Models\ComplianceQuestion;
use App\Models\ComplianceSection;
use Illuminate\Http\RedirectResponse;

class ComplianceQuestionController extends Controller
{
    public function store(ComplianceQuestionRequest $request, ComplianceSection $section): RedirectResponse
    {
        $this->authorize('update', $section->framework);

        $section->questions()->create([
            ...$request->validated(),
            'requires_evidence' => $request->boolean('requires_evidence'),
            'is_active' => $request->boolean('is_active', true),
        ]);

        return back()->with('success', 'Question created.');
    }

    public function update(ComplianceQuestionRequest $request, ComplianceSection $section, ComplianceQuestion $question): RedirectResponse
    {
        $this->authorize('update', $section->framework);

        abort_unless($question->compliance_section_id === $section->id, 404);

        $question->update([
            ...$request->validated(),
            'requires_evidence' => $request->boolean('requires_evidence'),
            'is_active' => $request->boolean('is_active', true),
        ]);

        return back()->with('success', 'Question updated.');
    }

    public function destroy(ComplianceSection $section, ComplianceQuestion $question): RedirectResponse
    {
        $this->authorize('update', $section->framework);

        abort_unless($question->compliance_section_id === $section->id, 404);

        $question->delete();

        return back()->with('success', 'Question deleted.');
    }
}
