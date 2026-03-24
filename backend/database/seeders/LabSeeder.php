<?php

namespace Database\Seeders;

use App\Models\Lab;
use App\Models\LabReservation;
use Illuminate\Database\Seeder;

class LabSeeder extends Seeder
{
    public function run(): void
    {
        $labs = [
            [
                'id' => 'lab-1',
                'name' => 'IoT Lab',
                'capacity' => 15,
                'equipment' => ['Arduino Board', 'Raspberry Pi', 'Sensors', 'Breadboards'],
                'floor' => 2,
                'is_active' => true,
            ],
            [
                'id' => 'lab-2',
                'name' => 'Electronics Lab',
                'capacity' => 12,
                'equipment' => ['Oscilloscope', 'Multimeter', 'Soldering Station', 'Power Supply'],
                'floor' => 1,
                'is_active' => true,
            ],
            [
                'id' => 'lab-3',
                'name' => 'Robotics Lab',
                'capacity' => 20,
                'equipment' => ['Robot Arms', 'Motion Sensors', 'Controller Units', 'Safety Equipment'],
                'floor' => 3,
                'is_active' => true,
            ],
        ];

        foreach ($labs as $lab) {
            Lab::create($lab);
        }

        $reservations = [
            [
                'id' => 'lab-res-1',
                'lab_id' => 'lab-1',
                'user_id' => 101,
                'purpose' => 'IoT Project Development',
                'date' => '2024-02-22',
                'start_time' => '09:00',
                'end_time' => '12:00',
                'status' => 'approved',
                'approver_id' => 1,
            ],
            [
                'id' => 'lab-res-2',
                'lab_id' => 'lab-2',
                'user_id' => 102,
                'purpose' => 'Electronics Troubleshooting',
                'date' => '2024-02-23',
                'start_time' => '14:00',
                'end_time' => '16:00',
                'status' => 'pending',
            ],
            [
                'id' => 'lab-res-3',
                'lab_id' => 'lab-3',
                'user_id' => 103,
                'purpose' => 'Robotics Research',
                'date' => '2024-02-25',
                'start_time' => '10:00',
                'end_time' => '13:00',
                'status' => 'approved',
                'approver_id' => 1,
            ],
        ];

        foreach ($reservations as $res) {
            LabReservation::create($res);
        }
    }
}
