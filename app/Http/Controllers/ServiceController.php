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
        $services = Service::latest()->get();

        // Hitung statistik untuk Card
        $totalServices = $services->count();
        $activeServices = $services->where('status', true)->count();
        $inactiveServices = $services->where('status', false)->count();
        $avgPrice = $totalServices > 0 ? $services->avg('price') : 0;

        return inertia('service', [
            'services' => $services,
            'card' => [
                'total_services' => $totalServices,
                'active_services' => $activeServices,
                'inactive_services' => $inactiveServices,
                'avg_price' => $avgPrice,
            ],
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
