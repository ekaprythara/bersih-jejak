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
        // Daftar catatan/deskripsi transaksi sepatu dalam Bahasa Indonesia
        $descriptions = [
            'Sepatu putih agak kotor, minta extra cleaning di bagian midsole',
            'Suede berdebu, pengerjaan harus hati-hati pakai treatment khusus',
            'Treatment deep cleaning kilat untuk pemakaian mendesak',
            'Kondisi sol agak menguning, perlu treatment unyellowing',
            'Pencucian standar sepatu kanvas regular',
            'Sepatu kena noda luntur, butuh penanganan khusus',
            'Pembersihan tali dan bagian dalam sepatu secara menyeluruh',
            'Cuci pasang sepatu olahraga/running, treatment wangi ekstra'
        ];

        $transactionDate = $this->faker->dateTimeBetween('-1 month', 'now');
        $pickupDate = (clone $transactionDate);
        $pickupDate->modify('+' . rand(1, 4) . ' days');

        // Jumlah sepatu wajar antara 1 sampai 5
        $shoeCount = $this->faker->numberBetween(1, 5);

        // Harga satuan per sepatu dengan nominal bersih/bulat (misal 25rb, 35rb, 50rb)
        $pricePerShoe = $this->faker->randomElement([25000, 35000, 50000, 75000, 100000]);

        // 1. Pilih cabang terlebih dahulu secara acak
        $branch = Branch::inRandomOrder()->first();
        $branchId = $branch?->id ?? 1;

        // 2. Pilih user (kasir/staff) yang bertugas di cabang yang sama
        $user = User::where('branch_id', $branchId)->inRandomOrder()->first();

        // Fallback jika tidak ada user khusus di cabang tersebut, ambil user random apa saja
        $userId = $user?->id ?? (User::inRandomOrder()->first()?->id ?? 1);

        return [
            'customer_id' => Customer::inRandomOrder()->first()?->id ?? 1,
            'transaction_date' => $transactionDate,
            'pickup_date' => $pickupDate,
            'service_id' => Service::inRandomOrder()->first()?->id ?? 1,
            'shoe_count' => $shoeCount,
            'total_amount' => $shoeCount * $pricePerShoe,
            'branch_id' => $branchId,
            'transaction_status_id' => TransactionStatus::inRandomOrder()->first()?->id ?? 1,
            'payment_status_id' => PaymentStatus::inRandomOrder()->first()?->id ?? 1,
            'payment_method_id' => PaymentMethod::inRandomOrder()->first()?->id ?? 3,
            'description' => $this->faker->randomElement($descriptions),
            'user_id' => $userId, // Sesuai dengan cabang tempat transaksi dibuat
            'before_image_url' => null,
            'before_image_public_id' => null,
            'after_image_url' => null,
            'after_image_public_id' => null,
        ];
    }
}
