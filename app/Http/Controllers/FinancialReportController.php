<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class FinancialReportController extends Controller
{
    public function index()
    {
        return inertia('financial-report', []);
    }
}
