<?php

use App\Http\Controllers\AppNotificationController;
use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\ComplianceFrameworkController;
use App\Http\Controllers\ComplianceQuestionController;
use App\Http\Controllers\ComplianceSectionController;
use App\Http\Controllers\ComplianceSubmissionController;
use App\Http\Controllers\CourseAssignmentController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\EmployeeProfileController;
use App\Http\Controllers\EmployeeProfileCompletionController;
use App\Http\Controllers\EvidenceFileController;
use App\Http\Controllers\EvidenceReviewController;
use App\Http\Controllers\ImpersonationController;
use App\Http\Controllers\InvitationController;
use App\Http\Controllers\LessonProgressController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\TenantController;
use App\Http\Controllers\TestAttemptController;
use App\Http\Controllers\TestController;
use App\Http\Controllers\TenantActivationStatusController;
use App\Http\Controllers\UserManagementController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', fn () => Inertia::render('welcome'))->name('home');

Route::get('invitations/accept/{token}', [InvitationController::class, 'acceptShow'])->name('invitations.accept.show');
Route::post('invitations/accept/{token}', [InvitationController::class, 'accept'])->name('invitations.accept.store');

Route::middleware(['auth', 'throttle:api', 'tenant', 'impersonation.audit'])->group(function () {
    Route::get('tenant/activation-pending', TenantActivationStatusController::class)->name('tenant.activation.pending');

    Route::middleware('tenant.active')->group(function () {
    Route::get('employee-profile/complete', [EmployeeProfileCompletionController::class, 'edit'])->name('employee-profile.complete.edit');
    Route::patch('employee-profile/complete', [EmployeeProfileCompletionController::class, 'update'])->name('employee-profile.complete.update');

    Route::middleware('employee.profile.complete')->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');

    Route::resource('tenants', TenantController::class)->only(['index', 'show', 'edit', 'update', 'destroy']);
    Route::get('users', [UserManagementController::class, 'index'])->name('users.index');
    Route::get('users/{user}', [UserManagementController::class, 'show'])->name('users.show');
    Route::patch('users/{user}', [UserManagementController::class, 'update'])->name('users.update');
    Route::patch('users/{user}/password', [UserManagementController::class, 'updatePassword'])->name('users.password.update');
    Route::patch('users/{user}/access', [UserManagementController::class, 'updateAccess'])->name('users.access.update');
    Route::resource('departments', DepartmentController::class)->only(['index', 'create', 'store', 'update', 'destroy']);
    Route::resource('employees', EmployeeProfileController::class)->only(['index', 'show', 'update', 'destroy']);
    Route::resource('invitations', InvitationController::class)->only(['index', 'create', 'store', 'destroy']);
    Route::resource('courses', CourseController::class)->only(['index', 'create', 'store', 'show', 'update', 'destroy']);
    Route::resource('assignments', CourseAssignmentController::class)->only(['index', 'create', 'store', 'show', 'update', 'destroy']);
    Route::post('assignments/{assignment}/progress', [LessonProgressController::class, 'store'])->name('assignments.progress.store');
    Route::delete('assignments/{assignment}/progress', [LessonProgressController::class, 'destroy'])->name('assignments.progress.destroy');
    Route::resource('tests', TestController::class)->only(['index', 'create', 'store', 'show', 'update', 'destroy']);
    Route::get('tests/{test}/take', [TestAttemptController::class, 'create'])->name('tests.attempts.create');
    Route::post('tests/{test}/attempts', [TestAttemptController::class, 'store'])->name('tests.attempts.store');
    Route::get('tests/{test}/attempts/{testAttempt}', [TestAttemptController::class, 'show'])->name('tests.attempts.show');

    Route::resource('frameworks', ComplianceFrameworkController::class)->only(['index', 'create', 'store', 'show', 'edit', 'update', 'destroy']);
    Route::post('frameworks/{framework}/sections', [ComplianceSectionController::class, 'store'])->name('frameworks.sections.store');
    Route::patch('frameworks/{framework}/sections/{section}', [ComplianceSectionController::class, 'update'])->name('frameworks.sections.update');
    Route::delete('frameworks/{framework}/sections/{section}', [ComplianceSectionController::class, 'destroy'])->name('frameworks.sections.destroy');
    Route::post('sections/{section}/questions', [ComplianceQuestionController::class, 'store'])->name('sections.questions.store');
    Route::patch('sections/{section}/questions/{question}', [ComplianceQuestionController::class, 'update'])->name('sections.questions.update');
    Route::delete('sections/{section}/questions/{question}', [ComplianceQuestionController::class, 'destroy'])->name('sections.questions.destroy');
    Route::resource('submissions', ComplianceSubmissionController::class)
        ->parameters(['submissions' => 'complianceSubmission'])
        ->only(['index', 'create', 'store', 'show', 'update']);
    Route::post('submissions/{complianceSubmission}/responses', [ComplianceSubmissionController::class, 'saveResponses'])->name('submissions.responses.store');
    Route::post('submissions/{complianceSubmission}/submit', [ComplianceSubmissionController::class, 'submit'])->name('submissions.submit');
    Route::post('submissions/{complianceSubmission}/recalculate', [ComplianceSubmissionController::class, 'recalculate'])->name('submissions.recalculate');

    Route::get('evidence', [EvidenceFileController::class, 'index'])->name('evidence.index');
    Route::post('responses/{complianceResponse}/evidence', [EvidenceFileController::class, 'store'])->middleware('throttle:uploads')->name('evidence.store');
    Route::post('submissions/{complianceSubmission}/questions/{complianceQuestion}/evidence', [EvidenceFileController::class, 'storeForQuestion'])->middleware('throttle:uploads')->name('submissions.questions.evidence.store');
    Route::get('evidence/{evidenceFile}/download', [EvidenceFileController::class, 'download'])->name('evidence.download');
    Route::post('evidence/{evidenceFile}/reviews', [EvidenceReviewController::class, 'store'])->name('evidence.reviews.store');

    Route::get('reports', [ReportController::class, 'index'])->name('reports.index');
    Route::get('reports/employee-training', [ReportController::class, 'employeeTraining'])->name('reports.employee-training');
    Route::get('reports/test-performance', [ReportController::class, 'testPerformance'])->name('reports.test-performance');
    Route::get('reports/compliance-summary', [ReportController::class, 'complianceSummary'])->name('reports.compliance-summary');
    Route::get('reports/evidence-status', [ReportController::class, 'evidenceStatus'])->name('reports.evidence-status');

    Route::get('audit-logs', [AuditLogController::class, 'index'])->name('audit-logs.index');
    Route::get('notifications', [AppNotificationController::class, 'index'])->name('notifications.index');
    Route::patch('notifications/{appNotification}', [AppNotificationController::class, 'update'])->name('notifications.update');

    Route::post('impersonation/{user}', [ImpersonationController::class, 'start'])->name('impersonation.start');
    Route::delete('impersonation', [ImpersonationController::class, 'stop'])->name('impersonation.stop');
    });
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
