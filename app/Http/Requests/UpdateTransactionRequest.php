<?php

namespace App\Http\Requests;

use App\Models\Transaction;
use App\Models\TransactionStatus;
use App\Models\PaymentStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class UpdateTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'pickup_date'             => ['required', 'date'],
            'payment_method_id'       => ['required', 'exists:payment_methods,id'],
            'payment_status_id'       => ['required', 'exists:payment_statuses,id'],
            'transaction_status_id'   => ['required', 'exists:transaction_statuses,id'],
            'discount'                => [
                'nullable',
                'numeric',
                'min:0',
                // Validasi agar diskon tidak melebihi harga total layanan
                function ($attribute, $value, $fail) {
                    $invoiceNumber = $this->route('transaction');
                    $transaction = Transaction::with('service')->where('invoice_number', $invoiceNumber)->first();

                    if ($transaction && $transaction->service) {
                        $maxSubtotal = $transaction->service->price * $transaction->shoe_count;
                        if ($value > $maxSubtotal) {
                            $fail('Diskon tidak boleh melebihi harga total layanan (' . number_format($maxSubtotal, 0, ',', '.') . ').');
                        }
                    }
                },
            ],
            'description'             => ['nullable', 'string'],
            'branch_id'               => ['required', 'exists:branches,id'],

            // Validasi file gambar opsional saat update (karena bisa jadi user tidak mengganti foto)
            'beforeImage'             => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:5120'],
            'afterImage'              => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:5120'],
        ];
    }

    /**
     * Konfigurasi tambahan untuk validasi lintas kolom/relasi database.
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function ($validator) {
            $targetTransactionStatusId = $this->input('transaction_status_id');
            $targetPaymentStatusId = $this->input('payment_status_id');

            // 1. Cek apakah status transaksi yang dipilih adalah "Selesai"
            $isCompleted = TransactionStatus::where('id', $targetTransactionStatusId)
                ->where('name', 'Selesai')
                ->exists();

            // Jika user ingin mengubah status menjadi "Selesai"
            if ($isCompleted) {

                // 2. Cek apakah status pembayaran adalah "Lunas"
                $isPaid = PaymentStatus::where('id', $targetPaymentStatusId)
                    ->where('name', 'Lunas')
                    ->exists();

                // Jika status transaksinya 'Selesai' tapi pembayarannya BUKAN 'Lunas', gagalkan!
                if (!$isPaid) {
                    $validator->errors()->add(
                        'transaction_status_id',
                        'Transaksi tidak dapat diselesaikan karena status pembayaran belum Lunas.'
                    );
                }
            }
        });
    }

    public function messages(): array
    {
        return [
            'pickup_date.required'           => 'Tanggal pengambilan wajib diisi.',
            'pickup_date.date'               => 'Format tanggal pengambilan tidak valid.',

            'payment_method_id.required'     => 'Metode pembayaran wajib dipilih.',
            'payment_method_id.exists'       => 'Metode pembayaran tidak valid.',
            'branch_id.required'             => 'Cabang wajib diisi.',
            'branch_id.exists'               => 'Cabang tidak ditemukan.',

            'payment_status_id.required'     => 'Status pembayaran wajib dipilih.',
            'payment_status_id.exists'       => 'Status pembayaran tidak valid.',

            'transaction_status_id.required' => 'Status transaksi wajib dipilih.',
            'transaction_status_id.exists'   => 'Status transaksi tidak valid.',

            'discount.numeric'               => 'Diskon harus berupa angka.',
            'discount.min'                   => 'Diskon minimal adalah 0.',

            'description.string'             => 'Catatan harus berupa teks.',

            'beforeImage.image'              => 'File foto sebelum harus berupa gambar.',
            'beforeImage.mimes'              => 'Format foto sebelum harus: jpeg, png, jpg, webp.',
            'beforeImage.max'                => 'Ukuran foto sebelum maksimal 5 MB.',

            'afterImage.image'               => 'File foto sesudah harus berupa gambar.',
            'afterImage.mimes'               => 'Format foto sesudah harus: jpeg, png, jpg, webp.',
            'afterImage.max'                 => 'Ukuran foto sesudah maksimal 5 MB.',
        ];
    }
}
