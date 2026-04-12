<?php

namespace Database\Factories;

use App\Models\LibraryFile;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class LibraryFileFactory extends Factory
{
    protected $model = LibraryFile::class;

    public function definition(): array
    {
        return [
            'tenant_id' => null,
            'title' => fake()->sentence(4),
            'description' => fake()->optional()->paragraph(),
            'category' => fake()->randomElement(LibraryFile::categoryOptions()),
            'original_name' => Str::slug(fake()->words(3, true)).'.pdf',
            'file_path' => 'library-files/shared/'.Str::uuid().'.pdf',
            'mime_type' => 'application/pdf',
            'file_size' => fake()->numberBetween(20_000, 2_000_000),
            'uploaded_by' => User::factory(),
        ];
    }

    public function forTenant(?Tenant $tenant = null): static
    {
        return $this->state(fn () => [
            'tenant_id' => $tenant?->id ?? Tenant::factory(),
        ]);
    }
}
