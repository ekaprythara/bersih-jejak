<?php

namespace Database\Factories;

use App\Models\Branch;
use App\Models\Expense;
use App\Models\ExpenseCategory;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Expense>
 */
class ExpenseFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Expense::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'expense_date'        => $this->faker->date(),
            'description'         => $this->faker->sentence(6),
            'expense_category_id' => ExpenseCategory::factory(),
            'amount'              => $this->faker->numberBetween(10000, 500000),
            'branch_id'           => Branch::factory(),
        ];
    }
}
