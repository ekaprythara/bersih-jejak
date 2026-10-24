<?php

namespace Database\Factories;

use App\Models\Branch;
use App\Models\Expense;
use App\Models\ExpenseCategory;
use App\Models\User;
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
        $descriptions = [
            'Pembelian cairan pembersih khusus suede dan leather',
            'Belanja sikat pembersih sepatu berbagai ukuran',
            'Pembelian plastik packaging dan silica gel',
            'Pengisian token listrik bulanan cabang',
            'Pembelian deterjen dan pewangi cuci sepatu',
            'Biaya perawatan dan perbaikan mesin cuci sepatu',
            'Pembelian alat pelindung tangan (sarung tangan latex)',
            'Biaya langganan air bersih bulanan',
            'Pembelian tisu magic dan kain mikrofiber',
            'Belanja ATK (nota, nota kontan, dan pulpen)',
            'Pembelian cairan unyellowing sol sepatu',
            'Biaya tak terduga operasional harian cabang'
        ];

        $multipliers = [5000, 10000, 25000, 50000, 100000];
        $chosenMultiplier = $this->faker->randomElement($multipliers);
        $randomFactor = $this->faker->numberBetween(1, 15);
        $amount = $chosenMultiplier * $randomFactor;

        if ($amount < 10000) {
            $amount = 50000;
        }

        return [
            'expense_date'        => $this->faker->dateTimeBetween('-1 month', 'now'),
            'description'         => $this->faker->randomElement($descriptions),
            'expense_category_id' => ExpenseCategory::inRandomOrder()->first()?->id ?? 1,
            'amount'              => $amount,
            'branch_id'           => Branch::inRandomOrder()->first()?->id ?? 1,
            'user_id'             => User::inRandomOrder()->first()?->id ?? 1,
        ];
    }
}
