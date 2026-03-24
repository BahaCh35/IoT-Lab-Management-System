<?php

namespace Database\Seeders;

use App\Models\PartsRequest;
use Illuminate\Database\Seeder;

class PartsRequestSeeder extends Seeder
{
    public function run(): void
    {
        $requests = [
            [
                'id' => 'parts-req-001',
                'technician_id' => 201,
                'technician_name' => 'John',
                'part_name' => 'Voltage Regulator IC LM7815',
                'quantity' => 5,
                'reason' => 'Power Supply Unit repairs - voltage regulation failures',
                'requested_date' => '2024-02-20 08:00:00',
                'status' => 'arrived',
                'approved_by_id' => 1,
            ],
            [
                'id' => 'parts-req-002',
                'technician_id' => 202,
                'technician_name' => 'Sarah',
                'part_name' => 'Cooling Fan Assembly 5V',
                'quantity' => 3,
                'reason' => 'Raspberry Pi 4 overheating - fan replacement needed',
                'requested_date' => '2024-02-23 09:00:00',
                'status' => 'approved',
                'approved_by_id' => 1,
            ],
            [
                'id' => 'parts-req-003',
                'technician_id' => 201,
                'technician_name' => 'John',
                'part_name' => 'USB Cable Type-B 3m',
                'quantity' => 10,
                'reason' => 'General stock replenishment - multiple devices needing replacement cables',
                'requested_date' => '2024-02-25 10:30:00',
                'status' => 'pending',
            ],
            [
                'id' => 'parts-req-004',
                'technician_id' => 202,
                'technician_name' => 'Sarah',
                'part_name' => 'Heating Element 40W',
                'quantity' => 2,
                'reason' => 'Soldering iron repair - heating element replacement',
                'requested_date' => '2024-02-19 08:00:00',
                'status' => 'arrived',
                'approved_by_id' => 1,
            ],
            [
                'id' => 'parts-req-005',
                'technician_id' => 201,
                'technician_name' => 'John',
                'part_name' => 'Electrolytic Capacitor 10μF 50V',
                'quantity' => 20,
                'reason' => 'Multiple power supply repairs - capacitor failures',
                'requested_date' => '2024-02-21 14:00:00',
                'status' => 'approved',
                'approved_by_id' => 1,
            ],
            [
                'id' => 'parts-req-006',
                'technician_id' => 202,
                'technician_name' => 'Sarah',
                'part_name' => 'Battery CR2032 (Lithium Coin Cell)',
                'quantity' => 15,
                'reason' => 'Multimeter and test equipment battery stock',
                'requested_date' => '2024-02-24 11:00:00',
                'status' => 'pending',
            ],
        ];

        foreach ($requests as $request) {
            PartsRequest::create($request);
        }
    }
}
