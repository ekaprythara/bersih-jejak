<?php

namespace Database\Factories;

use App\Models\ExpenseCategory;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ExpenseCategory>
 */
class ExpenseCategoryFactory extends Factory
{
    protected $model = ExpenseCategory::class;

    public function definition(): array
    {
        return [
            // Menggunakan unique word agar tidak pernah duplikat
            'name' => ucfirst($this->faker->unique()->words(2, true)),
        ];
    }
}
