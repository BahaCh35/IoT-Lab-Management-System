<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Checkout;
use App\Models\Equipment;
use Illuminate\Http\Request;

class CheckoutController extends Controller
{
    public function index()
    {
        $checkouts = Checkout::with(['equipment', 'user'])->orderBy('created_at', 'desc')->get();
        return response()->json($checkouts->map(fn($c) => $this->formatCheckout($c)));
    }

    public function show($id)
    {
        $checkout = Checkout::with(['equipment', 'user'])->findOrFail($id);
        return response()->json($this->formatCheckout($checkout));
    }

    public function active()
    {
        $checkouts = Checkout::where('status', 'active')
            ->with(['equipment', 'user'])
            ->orderBy('created_at', 'desc')
            ->get();
        return response()->json($checkouts->map(fn($c) => $this->formatCheckout($c)));
    }

    public function overdue()
    {
        $checkouts = Checkout::where('status', 'active')
            ->where('expected_return_date', '<', now())
            ->with(['equipment', 'user'])
            ->get();
        return response()->json($checkouts->map(fn($c) => $this->formatCheckout($c)));
    }

    public function stats()
    {
        return response()->json([
            'totalCheckouts' => Checkout::count(),
            'activeCheckouts' => Checkout::where('status', 'active')->count(),
            'returnedCheckouts' => Checkout::where('status', 'returned')->count(),
            'overdueCheckouts' => Checkout::where('status', 'active')
                ->where('expected_return_date', '<', now())->count(),
        ]);
    }

    public function userCheckouts($userId)
    {
        $checkouts = Checkout::where('user_id', $userId)
            ->with(['equipment', 'user'])
            ->orderBy('created_at', 'desc')
            ->get();
        return response()->json($checkouts->map(fn($c) => $this->formatCheckout($c)));
    }

    public function userActiveCheckouts($userId)
    {
        $checkouts = Checkout::where('user_id', $userId)
            ->where('status', 'active')
            ->with(['equipment', 'user'])
            ->get();
        return response()->json($checkouts->map(fn($c) => $this->formatCheckout($c)));
    }

    public function store(Request $request)
    {
        $request->validate([
            'equipment_id' => 'required|exists:equipment,id',
            'user_id' => 'required|exists:users,id',
            'user_name' => 'required|string',
            'expected_return_date' => 'required|date',
        ]);

        $equipment = Equipment::findOrFail($request->equipment_id);

        if ($equipment->status !== 'available') {
            return response()->json(['message' => 'Equipment is not available'], 400);
        }

        $checkout = Checkout::create([
            'id' => 'co-' . time(),
            'equipment_id' => $request->equipment_id,
            'user_id' => $request->user_id,
            'user_name' => $request->user_name,
            'checkout_date' => now(),
            'expected_return_date' => $request->expected_return_date,
            'status' => 'active',
            'notes' => $request->notes,
        ]);

        $equipment->update([
            'status' => 'checked-out',
            'last_used_by' => $request->user_name,
            'last_used_date' => now(),
            'usage_count' => $equipment->usage_count + 1,
        ]);

        return response()->json($this->formatCheckout($checkout->load(['equipment', 'user'])), 201);
    }

    public function checkin($id, Request $request)
    {
        $checkout = Checkout::with('equipment')->findOrFail($id);

        if ($checkout->status === 'returned') {
            return response()->json(['message' => 'Already returned'], 400);
        }

        $checkout->update([
            'actual_return_date' => now(),
            'status' => 'returned',
            'notes' => $request->notes ?? $checkout->notes,
        ]);

        $checkout->equipment->update(['status' => 'available']);

        return response()->json($this->formatCheckout($checkout->load(['equipment', 'user'])));
    }

    public function qrCheckin(Request $request)
    {
        $request->validate(['qr_code' => 'required|string']);

        $equipment = Equipment::where('qr_code', $request->qr_code)->first();

        if (!$equipment) {
            return response()->json(['message' => 'Equipment not found'], 404);
        }

        $checkout = Checkout::where('equipment_id', $equipment->id)
            ->where('status', 'active')
            ->first();

        if (!$checkout) {
            return response()->json(['message' => 'No active checkout found'], 404);
        }

        return $this->checkin($checkout->id, $request);
    }

    public function getByQrCode($qrCode)
    {
        $equipment = Equipment::where('qr_code', $qrCode)->first();

        if (!$equipment) {
            return response()->json(['message' => 'Equipment not found'], 404);
        }

        $checkout = Checkout::where('equipment_id', $equipment->id)
            ->where('status', 'active')
            ->with(['equipment', 'user'])
            ->first();

        if (!$checkout) {
            return response()->json(null);
        }

        return response()->json($this->formatCheckout($checkout));
    }

    private function formatCheckout($checkout)
    {
        return [
            'id' => $checkout->id,
            'equipmentId' => $checkout->equipment_id,
            'userId' => (string) $checkout->user_id,
            'userName' => $checkout->user_name,
            'checkoutDate' => $checkout->checkout_date?->toISOString(),
            'expectedReturnDate' => $checkout->expected_return_date?->toISOString(),
            'actualReturnDate' => $checkout->actual_return_date?->toISOString(),
            'status' => $checkout->status,
            'notes' => $checkout->notes,
        ];
    }
}
