<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreExpenseRequest extends FormRequest
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
            'description'         => ['required', 'string', 'max:500'],
            'expense_category_id' => ['required', 'exists:expense_categories,id'],
            'amount'              => ['required', 'numeric', 'min:0'],
            'branch_id'           => ['required', 'exists:branches,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'expense_date.required'        => 'Tanggal pengeluaran wajib diisi.',
            'expense_date.date'            => 'Format tanggal tidak valid.',
            'description.required'         => 'Deskripsi pengeluaran wajib diisi.',
            'expense_category_id.required' => 'Kategori pengeluaran wajib dipilih.',
            'expense_category_id.exists'   => 'Kategori pengeluaran tidak ditemukan.',
            'amount.required'              => 'Jumlah nominal wajib diisi.',
            'amount.numeric'               => 'Jumlah nominal harus berupa angka.',
            'branch_id.required'           => 'Cabang wajib dipilih.',
            'branch_id.exists'             => 'Cabang tidak ditemukan.',
        ];
    }
}
