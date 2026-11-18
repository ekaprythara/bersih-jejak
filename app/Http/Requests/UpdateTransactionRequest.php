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

    /**
     * Persiapan sebelum data divalidasi.
     */
    protected function prepareForValidation(): void
    {
        $paymentStatusId = $this->input('payment_status_id');

        // Cari data status pembayaran berdasarkan ID atau teks "Lunas"
        $isPaid = PaymentStatus::where('id', $paymentStatusId)
            ->where('name', 'Lunas')
            ->exists();

        // Jika status pembayaran BUKAN "Lunas", paksa payment_method_id menjadi null
        if (!$isPaid) {
            $this->merge([
                'payment_method_id' => null,
            ]);
        }
    }

    public function rules(): array
    {
        // Cek apakah status pembayaran yang dikirim adalah Lunas
        $paymentStatusId = $this->input('payment_status_id');
        $isPaid = PaymentStatus::where('id', $paymentStatusId)
            ->where('name', 'Lunas')
            ->exists();

        return [
            'pickup_date' => ['required', 'date'],

            // Jika Lunas, wajib isi & harus ada di database. Jika belum lunas, boleh null.
            'payment_method_id' => $isPaid
                ? ['required', 'exists:payment_methods,id']
                : ['nullable', 'exists:payment_methods,id'],

            'payment_status_id' => ['required', 'exists:payment_statuses,id'],
            'transaction_status_id' => ['required', 'exists:transaction_statuses,id'],
            'discount' => [
                'nullable',
                'numeric',
                'min:0',
                function ($attribute, $value, $fail) {
                    $invoiceNumber = $this->route('transaction');
                    $transaction = Transaction::with('service')->where('invoice_number', $invoiceNumber)->first();
                    if ($transaction && $transaction->service) {
                        // Perhitungkan juga jika shoe_count ikut dikirim di request
                        $shoeCount = $this->input('shoe_count', $transaction->shoe_count);
                        $maxSubtotal = $transaction->service->price * $shoeCount;
                        if ($value > $maxSubtotal) {
                            $fail('Diskon tidak boleh melebihi harga total layanan (' . number_format($maxSubtotal, 0, ',', '.') . ').');
                        }
                    }
                },
            ],
            'description' => ['nullable', 'string'],
            'branch_id' => ['required', 'exists:branches,id'],
            'image_before' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
            'image_after' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
        ];
    }

    /**
     * Konfigurasi tambahan untuk validasi lintas kolom / relasi database.
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
            'pickup_date.required' => 'Tanggal pengambilan wajib diisi.',
            'pickup_date.date' => 'Format tanggal pengambilan tidak valid.',
            'payment_method_id.required' => 'Metode pembayaran wajib dipilih karena status pembayaran sudah Lunas.',
            'payment_method_id.exists' => 'Metode pembayaran tidak valid.',
            'branch_id.required' => 'Cabang wajib diisi.',
            'branch_id.exists' => 'Cabang tidak ditemukan.',
            'payment_status_id.required' => 'Status pembayaran wajib dipilih.',
            'payment_status_id.exists' => 'Status pembayaran tidak valid.',
            'transaction_status_id.required' => 'Status transaksi wajib dipilih.',
            'transaction_status_id.exists' => 'Status transaksi tidak valid.',
            'discount.numeric' => 'Diskon harus berupa angka.',
            'discount.min' => 'Diskon minimal adalah 0.',
            'description.string' => 'Catatan harus berupa teks.',
            'image_before.image' => 'File foto sebelum pengerjaan harus berupa gambar.',
            'image_before.mimes' => 'Format foto sebelum pengerjaan harus berjenis: jpeg, png, jpg.',
            'image_before.max' => 'Ukuran foto sebelum pengerjaan maksimal 2MB.',
            'image_after.image' => 'File foto sesudah pengerjaan harus berupa gambar.',
            'image_after.mimes' => 'Format foto sesudah pengerjaan harus berjenis: jpeg, png, jpg.',
            'image_after.max' => 'Ukuran foto sesudah pengerjaan maksimal 2MB.',
        ];
    }
}
