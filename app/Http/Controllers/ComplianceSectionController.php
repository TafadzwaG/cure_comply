<?php

namespace App\Http\Controllers;

use App\Http\Requests\ComplianceSectionRequest;
use App\Models\ComplianceFramework;
use App\Models\ComplianceSection;
use Illuminate\Http\RedirectResponse;

class ComplianceSectionController extends Controller
{
    public function store(ComplianceSectionRequest $request, ComplianceFramework $framework): RedirectResponse
    {
        $this->authorize('update', $framework);

        $framework->sections()->create($request->validated());

        return back()->with('success', 'Section created.');
    }

    public function update(ComplianceSectionRequest $request, ComplianceFramework $framework, ComplianceSection $section): RedirectResponse
    {
        $this->authorize('update', $framework);

        abort_unless($section->compliance_framework_id === $framework->id, 404);

        $section->update($request->validated());

        return back()->with('success', 'Section updated.');
    }

    public function destroy(ComplianceFramework $framework, ComplianceSection $section): RedirectResponse
    {
        $this->authorize('update', $framework);

        abort_unless($section->compliance_framework_id === $framework->id, 404);

        $section->delete();

        return back()->with('success', 'Section deleted.');
    }
}
