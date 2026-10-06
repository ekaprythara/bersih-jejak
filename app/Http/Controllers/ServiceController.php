<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreServiceRequest;
use App\Http\Requests\UpdateServiceRequest;
use App\Models\Service;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    public function index()
    {
        return inertia('service', [
            'services' => Service::all()
        ]);
    }

    public function store(StoreServiceRequest $request)
    {
        Service::create($request->validated());

        return redirect()->route('services.index');
    }

    public function updateStatus(Request $request, Service $service)
    {
        $request->validate([
            'status' => ['required', 'boolean'],
        ]);

        $service->status = $request->status;
        $service->save();

        return redirect()->route('services.index');
    }

    public function update(UpdateServiceRequest $request, Service $service)
    {
        $service->update($request->validated());

        return redirect()->route('services.index');
    }
}
