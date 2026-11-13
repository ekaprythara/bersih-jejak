<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCustomerRequest extends FormRequest
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
        // Mengambil ID customer dari route parameter (misal: /customers/{customer})
        $customerId = $this->route('customer')?->id ?? $this->route('customer');

        return [
            'name'         => ['required', 'string', 'max:255'],
            // Mengabaikan pengecekan unique untuk phone_number milik customer yang sedang diedit
            'phone_number' => [
                'required',
                'string',
                'max:20',
                Rule::unique('customers', 'phone_number')->ignore($customerId),
            ],
            'notes'        => ['nullable', 'string', 'max:1000'],
            'status'       => ['nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'         => 'Nama pelanggan wajib diisi.',
            'name.string'           => 'Nama pelanggan harus berupa teks.',
            'name.max'              => 'Nama pelanggan maksimal :max karakter.',

            'phone_number.required' => 'Nomor telepon wajib diisi.',
            'phone_number.string'   => 'Nomor telepon harus berupa teks.',
            'phone_number.max'      => 'Nomor telepon maksimal :max karakter.',
            'phone_number.unique'   => 'Nomor telepon ini sudah digunakan oleh pelanggan lain.',

            'notes.string'          => 'Catatan harus berupa teks.',
            'notes.max'             => 'Catatan maksimal :max karakter.',

            'status.boolean'        => 'Format status tidak valid.',
        ];
    }
}
