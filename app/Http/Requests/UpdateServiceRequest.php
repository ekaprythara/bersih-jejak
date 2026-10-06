<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateServiceRequest extends FormRequest
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
            'name'           => ['required', 'string', 'max:255'],
            'price'          => ['required', 'numeric', 'min:0'],
            'estimated_days' => ['required', 'integer', 'min:0'],
            'status'         => ['nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'           => 'Nama layanan wajib diisi.',
            'price.required'          => 'Harga wajib diisi.',
            'price.numeric'           => 'Harga harus berupa angka.',
            'estimated_days.required' => 'Estimasi hari wajib diisi.',
            'estimated_days.integer'  => 'Estimasi hari harus berupa bilangan bulat.',
        ];
    }
}
