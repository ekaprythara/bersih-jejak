<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class UpdateTransactionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $user = Auth::user();
        $transaction = $this->route('transaction');

        if ($user->is_owner) {
            return true;
        }

        return $transaction && $transaction->branch_id === $user->branch_id;
    }

    protected function prepareForValidation(): void
    {
        $user = Auth::user();

        if (!$user->is_owner) {
            $this->merge([
                'branch_id' => $user->branch_id,
            ]);
        }
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
            'branch_id'           => ['required', 'exists:branches,id'],

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
            'branch_id.required'           => 'Cabang wajib diisi.',
            'branch_id.exists'             => 'Cabang tidak ditemukan.',

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
