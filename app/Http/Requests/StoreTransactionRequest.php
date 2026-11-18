<?php

namespace App\Http\Requests;

use App\Models\Service;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class StoreTransactionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
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
            'customer_id' => ['required', Rule::exists('customers', 'id')->where('status', true)],
            'transaction_date' => ['required', 'date'],
            'pickup_date' => ['required', 'date', 'after_or_equal:transaction_date'],
            'service_id' => ['required', Rule::exists('services', 'id')->where('status', true)],
            'shoe_count' => ['required', 'integer', 'min:1'],
            'discount' => [
                'nullable',
                'numeric',
                'min:0',
                // Validasi tambahan agar diskon tidak melebihi total harga layanan * shoe_count
                function ($attribute, $value, $fail) {
                    if (request()->filled('service_id') && request()->filled('shoe_count')) {
                        $service = Service::find(request('service_id'));
                        if ($service) {
                            $maxSubtotal = $service->price * request('shoe_count');
                            if ($value > $maxSubtotal) {
                                $fail('Diskon tidak boleh melebihi harga total layanan (' . number_format($maxSubtotal, 0, ',', '.') . ').');
                            }
                        }
                    }
                },
            ],
            'description' => ['nullable', 'string'],
            'branch_id' => ['required', Rule::exists('branches', 'id')->where('status', true)],
            'image_before' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
            'image_after' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'customer_id.required' => 'Pelanggan wajib dipilih.',
            'customer_id.exists' => 'Pelanggan yang dipilih tidak valid atau sudah tidak aktif.',
            'transaction_date.required' => 'Tanggal transaksi wajib diisi.',
            'transaction_date.date' => 'Format tanggal transaksi tidak valid.',
            'pickup_date.required' => 'Tanggal pengambilan wajib diisi.',
            'pickup_date.date' => 'Format tanggal pengambilan tidak valid.',
            'pickup_date.after_or_equal' => 'Tanggal pengambilan tidak boleh lebih awal dari tanggal transaksi.',
            'service_id.required' => 'Layanan wajib dipilih.',
            'service_id.exists' => 'Layanan yang dipilih tidak valid atau sudah tidak aktif.',
            'shoe_count.required' => 'Jumlah sepatu wajib diisi.',
            'shoe_count.integer' => 'Jumlah sepatu harus berupa angka bulat.',
            'shoe_count.min' => 'Jumlah sepatu minimal adalah 1.',
            'discount.numeric' => 'Diskon harus berupa angka.',
            'discount.min' => 'Diskon minimal adalah 0.',
            'branch_id.required' => 'Cabang wajib diisi.',
            'branch_id.exists' => 'Cabang tidak ditemukan atau sudah tidak aktif.',
            'description.string' => 'Catatan/deskripsi harus berupa teks.',

            // Disesuaikan dari before_image & after_image menjadi image_before & image_after
            'image_before.image' => 'File foto sebelum pengerjaan harus berupa gambar.',
            'image_before.mimes' => 'Format foto sebelum pengerjaan harus berjenis: jpeg, png, jpg.',
            'image_before.max' => 'Ukuran foto sebelum pengerjaan maksimal 2MB.',
            'image_after.image' => 'File foto sesudah pengerjaan harus berupa gambar.',
            'image_after.mimes' => 'Format foto sesudah pengerjaan harus berjenis: jpeg, png, jpg.',
            'image_after.max' => 'Ukuran foto sesudah pengerjaan maksimal 2MB.',
        ];
    }
}
