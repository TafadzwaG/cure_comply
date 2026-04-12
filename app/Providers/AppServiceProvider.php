<?php

namespace App\Providers;

use App\Models\User;
use App\Models\Lesson;
use App\Models\CourseModule;
use App\Models\ExportRequest;
use App\Models\LibraryFile;
use App\Models\TestAssignment;
use App\Policies\LessonPolicy;
use App\Policies\CourseModulePolicy;
use App\Policies\ExportRequestPolicy;
use App\Policies\LibraryFilePolicy;
use App\Policies\TestAssignmentPolicy;
use App\Policies\UserPolicy;
use App\Services\CurrentTenantResolver;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(CurrentTenantResolver::class, fn () => new CurrentTenantResolver());

        // Raise PHP execution & memory limits app-wide for long-running web requests,
        // imports, and exports. CLI (artisan, queue) is left untouched.
        if (PHP_SAPI !== 'cli') {
            @set_time_limit(300);
            @ini_set('max_execution_time', '300');
            @ini_set('max_input_time', '300');
            @ini_set('memory_limit', '512M');
        }
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Gate::policy(User::class, UserPolicy::class);
        Gate::policy(ExportRequest::class, ExportRequestPolicy::class);
        Gate::policy(CourseModule::class, CourseModulePolicy::class);
        Gate::policy(Lesson::class, LessonPolicy::class);
        Gate::policy(TestAssignment::class, TestAssignmentPolicy::class);
        Gate::policy(LibraryFile::class, LibraryFilePolicy::class);

        RateLimiter::for('login', function (Request $request) {
            $key = strtolower($request->string('email')).'|'.$request->ip();

            return Limit::perMinute(5)->by($key);
        });

        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });

        RateLimiter::for('uploads', function (Request $request) {
            return Limit::perMinute(10)->by($request->user()?->id ?: $request->ip());
        });
    }
}
