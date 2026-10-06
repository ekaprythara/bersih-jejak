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
            // Mengabaikan pengecekan unique untuk email milik customer yang sedang diedit
            'email'        => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('customers', 'email')->ignore($customerId),
            ],
            'status'       => ['nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'         => 'Nama pelanggan wajib diisi.',
            'phone_number.required' => 'Nomor telepon wajib diisi.',
            'phone_number.unique'   => 'Nomor telepon ini sudah digunakan oleh pelanggan lain.',
            'email.required'        => 'Email wajib diisi.',
            'email.email'           => 'Format email tidak valid.',
            'email.unique'          => 'Email ini sudah digunakan oleh pelanggan lain.',
        ];
    }
}
