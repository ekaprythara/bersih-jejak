<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateExpenseRequest extends FormRequest
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
            'expense_date'        => ['required', 'date'],
            'description'         => ['required', 'string', 'max:255'],
            'expense_category_id' => ['required', 'exists:expense_categories,id'],
            'amount'              => ['required', 'numeric', 'min:0'],
            'branch_id'           => ['required', 'exists:branches,id'],
            // 'image' bersifat nullable karena user boleh tidak mengganti gambar saat edit
            'image'               => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:5120'], // Max 5MB
        ];
    }

    public function messages(): array
    {
        return [
            'expense_date.required'        => 'Tanggal pengeluaran wajib diisi.',
            'expense_date.date'            => 'Format tanggal tidak valid.',
            'description.required'         => 'Deskripsi pengeluaran wajib diisi.',
            'description.max'              => 'Deskripsi maksimal 255 karakter.',
            'expense_category_id.required' => 'Kategori pengeluaran wajib dipilih.',
            'expense_category_id.exists'   => 'Kategori pengeluaran yang dipilih tidak valid.',
            'amount.required'              => 'Jumlah nominal wajib diisi.',
            'amount.numeric'               => 'Jumlah nominal harus berupa angka.',
            'amount.min'                   => 'Jumlah nominal tidak boleh kurang dari 0.',
            'branch_id.required'           => 'Cabang wajib dipilih.',
            'branch_id.exists'             => 'Cabang yang dipilih tidak valid.',
            'image.image'                  => 'Berkas yang diunggah harus berupa gambar.',
            'image.mimes'                  => 'Format gambar harus berjenis: jpeg, png, jpg, atau webp.',
            'image.max'                    => 'Ukuran gambar maksimal adalah 5 MB.',
        ];
    }
}
