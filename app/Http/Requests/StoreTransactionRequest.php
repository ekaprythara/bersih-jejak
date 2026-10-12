<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreTransactionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'customer_id'         => ['required', 'exists:customers,id'],
            'transaction_date'    => ['required', 'date'],
            'pickup_date'         => ['required', 'date', 'after_or_equal:transaction_date'],
            'service_id'          => ['required', 'exists:services,id'],
            'shoe_count'          => ['required', 'integer', 'min:1'],
            'payment_method_id'   => ['required', 'exists:payment_methods,id'],
            'payment_status_id'   => ['required', 'exists:payment_statuses,id'],
            'description'         => ['nullable', 'string'],

            // Validasi gambar (opsional, max 2MB dengan format gambar umum)
            'before_image'        => ['nullable', 'image', 'mimes:jpeg,png,jpg', 'max:2048'],
            'after_image'         => ['nullable', 'image', 'mimes:jpeg,png,jpg', 'max:2048'],
        ];
    }

    public function messages(): array
    {
        return [
            'customer_id.required'         => 'Pelanggan wajib dipilih.',
            'customer_id.exists'           => 'Pelanggan yang dipilih tidak valid.',

            'transaction_date.required'    => 'Tanggal transaksi wajib diisi.',
            'transaction_date.date'        => 'Format tanggal transaksi tidak valid.',

            'pickup_date.required'         => 'Tanggal pengambilan wajib diisi.',
            'pickup_date.date'             => 'Format tanggal pengambilan tidak valid.',
            'pickup_date.after_or_equal'   => 'Tanggal pengambilan tidak boleh lebih awal dari tanggal transaksi.',

            'service_id.required'          => 'Layanan wajib dipilih.',
            'service_id.exists'            => 'Layanan yang dipilih tidak valid.',

            'shoe_count.required'          => 'Jumlah sepatu wajib diisi.',
            'shoe_count.integer'           => 'Jumlah sepatu harus berupa angka bulat.',
            'shoe_count.min'               => 'Jumlah sepatu minimal adalah 1.',

            'payment_method_id.required'   => 'Metode pembayaran wajib dipilih.',
            'payment_method_id.exists'     => 'Metode pembayaran tidak valid.',

            'payment_status_id.required'   => 'Status pembayaran wajib dipilih.',
            'payment_status_id.exists'     => 'Status pembayaran tidak valid.',

            'description.string'           => 'Catatan/deskripsi harus berupa teks.',

            'before_image.image'           => 'File foto sebelum pengerjaan harus berupa gambar.',
            'before_image.mimes'           => 'Format foto sebelum pengerjaan harus berjenis: jpeg, png, jpg.',
            'before_image.max'             => 'Ukuran foto sebelum pengerjaan maksimal 2MB.',

            'after_image.image'            => 'File foto sesudah pengerjaan harus berupa gambar.',
            'after_image.mimes'            => 'Format foto sesudah pengerjaan harus berjenis: jpeg, png, jpg.',
            'after_image.max'              => 'Ukuran foto sesudah pengerjaan maksimal 2MB.',
        ];
    }
}
