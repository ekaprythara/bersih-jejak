<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreCustomerRequest extends FormRequest
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
            'name'         => ['required', 'string', 'max:255'],
            'phone_number' => ['required', 'string', 'max:20', 'unique:customers,phone_number'],
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
            'phone_number.unique'   => 'Nomor telepon ini sudah terdaftar.',

            'notes.string'          => 'Catatan harus berupa teks.',
            'notes.max'             => 'Catatan maksimal :max karakter.',

            'status.boolean'        => 'Format status tidak valid.',
        ];
    }
}
