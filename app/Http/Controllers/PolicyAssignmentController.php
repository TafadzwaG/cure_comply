<?php

namespace App\Http\Controllers;

use App\Http\Requests\AcknowledgePolicyRequest;
use App\Http\Requests\StorePolicyAssignmentRequest;
use App\Models\LibraryFile;
use App\Models\PolicyAssignment;
use App\Services\LibraryFileStorageService;
use App\Services\PolicyWorkflowService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class PolicyAssignmentController extends Controller
{
    public function __construct(
        protected PolicyWorkflowService $policyWorkflowService,
        protected LibraryFileStorageService $libraryFileStorageService,
    ) {
    }

    public function store(StorePolicyAssignmentRequest $request): RedirectResponse
    {
        $this->authorize('create', PolicyAssignment::class);

        $libraryFile = LibraryFile::query()
            ->withoutGlobalScopes()
            ->with('currentPolicyVersion')
            ->findOrFail($request->integer('library_file_id'));

        if (! $request->user()->isSuperAdmin()) {
            abort_unless($libraryFile->tenant_id === null || (int) $libraryFile->tenant_id === (int) $request->user()->tenant_id, 403);
        }

        $result = $this->policyWorkflowService->assign(
            $libraryFile,
            $request->user(),
            $request->input('assigned_to_user_ids', []),
            $request->input('department_ids', []),
            $request->string('due_date')->toString(),
        );

        $message = $result['updated'] > 0
            ? sprintf('Policy assignments saved. %d created and %d refreshed.', $result['created'], $result['updated'])
            : sprintf('Policy assigned to %d user%s.', $result['created'], $result['created'] === 1 ? '' : 's');

        return back()->with('success', $message);
    }

    public function open(Request $request, PolicyAssignment $policyAssignment)
    {
        abort_unless((int) $policyAssignment->assigned_to_user_id === (int) $request->user()?->id, 403);

        $assignment = $this->policyWorkflowService->openAssignment($policyAssignment->loadMissing('version'));

        return $this->libraryFileStorageService->downloadVersion($assignment->version);
    }

    public function acknowledge(AcknowledgePolicyRequest $request, PolicyAssignment $policyAssignment): RedirectResponse
    {
        $this->authorize('acknowledge', $policyAssignment);

        $this->policyWorkflowService->acknowledgeAssignment($policyAssignment);

        return back()->with('success', 'Policy acknowledged successfully.');
    }
}
