<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCustomerRequest;
use App\Http\Requests\UpdateCustomerRequest;
use App\Models\Customer;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function index()
    {
        return inertia('customer', [
            'customers' => Customer::all()
        ]);
    }

    public function store(StoreCustomerRequest $request)
    {
        Customer::create($request->validated());

        return redirect()->route('customers.index');
    }

    public function updateStatus(Request $request, Customer $customer)
    {
        $request->validate([
            'status' => ['required', 'boolean'],
        ]);

        $customer->status = $request->status;
        $customer->save();

        return redirect()->route('customers.index');
    }

    public function update(UpdateCustomerRequest $request, Customer $customer)
    {
        $customer->update($request->validated());
        $customer->save();

        return redirect()->route('customers.index');
    }
}
