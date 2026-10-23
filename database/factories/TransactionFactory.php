<?php

namespace Database\Factories;

use App\Models\Branch;
use App\Models\Customer;
use App\Models\PaymentMethod;
use App\Models\PaymentStatus;
use App\Models\Service;
use App\Models\Transaction;
use App\Models\TransactionStatus;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Transaction>
 */
class TransactionFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Transaction::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $transactionDate = $this->faker->dateTimeBetween('-1 month', 'now');
        $pickupDate = (clone $transactionDate);
        $pickupDate->modify('+' . rand(1, 4) . ' days');

        $shoeCount = $this->faker->numberBetween(1, 3);
        $pricePerShoe = $this->faker->randomElement([25000, 35000, 50000, 75000]);

        return [
            'customer_id'            => Customer::inRandomOrder()->first()?->id ?? 1,
            'transaction_date'       => $transactionDate,
            'pickup_date'            => $pickupDate,
            'service_id'             => Service::inRandomOrder()->first()?->id ?? 1,
            'shoe_count'             => $shoeCount,
            'total_amount'           => $shoeCount * $pricePerShoe,
            'branch_id'              => Branch::inRandomOrder()->first()?->id ?? 1,
            'transaction_status_id'  => TransactionStatus::inRandomOrder()->first()?->id ?? 1,
            'payment_status_id'      => PaymentStatus::inRandomOrder()->first()?->id ?? 1,
            'payment_method_id'      => PaymentMethod::inRandomOrder()->first()?->id ?? 3,
            'description'            => $this->faker->sentence(), // Diubah agar tidak pernah bernilai null            'user_id'                => User::inRandomOrder()->first()?->id ?? 1,
            'before_image_url'       => null,
            'before_image_public_id' => null,
            'after_image_url'        => null,
            'after_image_public_id'  => null,
            "user_id"               => 1,
        ];
    }
}
