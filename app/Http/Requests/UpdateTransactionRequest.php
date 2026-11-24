<?php

namespace App\Http\Requests;

use App\Models\Transaction;
use App\Models\TransactionStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class UpdateTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Tentukan payment_status_id otomatis berdasarkan payment_method_id:
     * - Ada payment_method_id -> 2 (Lunas)
     * - Kosong/null -> 1 (Belum Lunas)
     */
    protected function prepareForValidation(): void
    {
        $hasPaymentMethod = $this->filled('payment_method_id');

        $this->merge([
            'payment_method_id' => $hasPaymentMethod ? $this->input('payment_method_id') : null,
            'payment_status_id' => $hasPaymentMethod ? 2 : 1,
        ]);
    }

    public function rules(): array
    {
        return [
            'pickup_date' => ['required', 'date'],
            'payment_method_id' => ['nullable', 'exists:payment_methods,id'],
            'payment_status_id' => ['nullable', 'exists:payment_statuses,id'],
            'transaction_status_id' => ['required', 'exists:transaction_statuses,id'],
            'discount' => [
                'nullable',
                'numeric',
                'min:0',
                function ($attribute, $value, $fail) {
                    $invoiceNumber = $this->route('transaction');
                    $transaction = Transaction::with('service')->where('invoice_number', $invoiceNumber)->first();
                    if ($transaction && $transaction->service) {
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

    public function withValidator(Validator $validator): void
    {
        $validator->after(function ($validator) {
            $targetTransactionStatusId = $this->input('transaction_status_id');
            $paymentStatusId = $this->input('payment_status_id', 1);

            $isCompleted = TransactionStatus::where('id', $targetTransactionStatusId)
                ->where('name', 'Selesai')
                ->exists();

            if ($isCompleted && (int) $paymentStatusId !== 2) {
                $validator->errors()->add(
                    'transaction_status_id',
                    'Transaksi tidak dapat diselesaikan karena belum memiliki metode pembayaran (status masih Belum Lunas).'
                );
            }
        });
    }

    public function messages(): array
    {
        return [
            'pickup_date.required' => 'Tanggal pengambilan wajib diisi.',
            'pickup_date.date' => 'Format tanggal pengambilan tidak valid.',
            'payment_method_id.exists' => 'Metode pembayaran tidak valid.',
            'branch_id.required' => 'Cabang wajib diisi.',
            'branch_id.exists' => 'Cabang tidak ditemukan.',
            'payment_status_id.exists' => 'Status pembayaran tidak valid.',
            'transaction_status_id.required' => 'Status transaksi wajib dipilih.',
            'transaction_status_id.exists' => 'Status transaksi tidak valid.',
            'discount.numeric' => 'Diskon harus berupa angka.',
            'discount.min' => 'Diskon minimal adalah 0.',
            'description.string' => 'Catatan harus berupa teks.',
            'image_before.image' => 'File foto sebelum pengerjaan harus berupa gambar.',
            'image_before.mimes' => 'Format foto sebelum pengerjaan harus berjenis: jpeg, png, jpg, webp.',
            'image_before.max' => 'Ukuran foto sebelum pengerjaan maksimal 2MB.',
            'image_after.image' => 'File foto sesudah pengerjaan harus berupa gambar.',
            'image_after.mimes' => 'Format foto sesudah pengerjaan harus berjenis: jpeg, png, jpg, webp.',
            'image_after.max' => 'Ukuran foto sesudah pengerjaan maksimal 2MB.',
        ];
    }
}
