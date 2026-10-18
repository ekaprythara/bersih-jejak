<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateTransactionRequest extends FormRequest
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
            'pickup_date'             => ['required', 'date'],
            'payment_method_id'       => ['required', 'exists:payment_methods,id'],
            'payment_status_id'       => ['required', 'exists:payment_statuses,id'],
            'transaction_status_id'   => ['required', 'exists:transaction_statuses,id'],
            'description'             => ['nullable', 'string'],

            // Validasi file gambar opsional saat update (karena bisa jadi user tidak mengganti foto)
            'beforeImage'             => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:5120'],
            'afterImage'              => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:5120'],
        ];
    }

    public function messages(): array
    {
        return [
            'pickup_date.required'          => 'Tanggal pengambilan wajib diisi.',
            'pickup_date.date'              => 'Format tanggal pengambilan tidak valid.',

            'payment_method_id.required'    => 'Metode pembayaran wajib dipilih.',
            'payment_method_id.exists'      => 'Metode pembayaran tidak valid.',

            'payment_status_id.required'    => 'Status pembayaran wajib dipilih.',
            'payment_status_id.exists'      => 'Status pembayaran tidak valid.',

            'transaction_status_id.required' => 'Status transaksi wajib dipilih.',
            'transaction_status_id.exists'  => 'Status transaksi tidak valid.',

            'description.string'            => 'Catatan harus berupa teks.',

            'beforeImage.image'             => 'File foto sebelum harus berupa gambar.',
            'beforeImage.mimes'             => 'Format foto sebelum harus: jpeg, png, jpg, webp.',
            'beforeImage.max'               => 'Ukuran foto sebelum maksimal 5 MB.',

            'afterImage.image'              => 'File foto sesudah harus berupa gambar.',
            'afterImage.mimes'              => 'Format foto sesudah harus: jpeg, png, jpg, webp.',
            'afterImage.max'                => 'Ukuran foto sesudah maksimal 5 MB.',
        ];
    }
}
