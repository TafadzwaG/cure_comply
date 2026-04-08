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

        $section = $framework->sections()->create($request->validated());
        app(\App\Services\AuditLogService::class)->logModelCreated('framework_section_created', $section);

        return back()->with('success', 'Section created.');
    }

    public function update(ComplianceSectionRequest $request, ComplianceFramework $framework, ComplianceSection $section): RedirectResponse
    {
        $this->authorize('update', $framework);

        abort_unless($section->compliance_framework_id === $framework->id, 404);

        $oldValues = $section->toArray();
        $section->update($request->validated());
        app(\App\Services\AuditLogService::class)->logModelUpdated('framework_section_updated', $section, $oldValues);

        return back()->with('success', 'Section updated.');
    }

    public function destroy(ComplianceFramework $framework, ComplianceSection $section): RedirectResponse
    {
        $this->authorize('update', $framework);

        abort_unless($section->compliance_framework_id === $framework->id, 404);

        $oldValues = $section->toArray();
        $section->delete();
        app(\App\Services\AuditLogService::class)->logModelDeleted('framework_section_deleted', $section, $oldValues);

        return back()->with('success', 'Section deleted.');
    }
}
