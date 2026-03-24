<?php

namespace Database\Seeders;

use App\Models\ComponentInventory;
use Illuminate\Database\Seeder;

class ComponentInventorySeeder extends Seeder
{
    public function run(): void
    {
        $inventory = [
            ['part_name' => 'Resistor 1K Ohm 1/4W', 'quantity' => 150],
            ['part_name' => 'Resistor 10K Ohm 1/4W', 'quantity' => 200],
            ['part_name' => 'Capacitor 10μF 50V', 'quantity' => 85],
            ['part_name' => 'Capacitor 100μF 50V', 'quantity' => 45],
            ['part_name' => 'LED Red 5mm', 'quantity' => 80],
            ['part_name' => 'LED Green 5mm', 'quantity' => 60],
            ['part_name' => 'Diode 1N4007', 'quantity' => 120],
            ['part_name' => 'Transistor BC547', 'quantity' => 95],
            ['part_name' => 'IC 74HC595', 'quantity' => 30],
            ['part_name' => 'IC LM7805', 'quantity' => 25],
            ['part_name' => 'IC LM7815', 'quantity' => 20],
            ['part_name' => 'USB Cable Type-A to Type-B', 'quantity' => 12],
            ['part_name' => 'USB Cable Type-C', 'quantity' => 8],
            ['part_name' => 'Male Header Pins 2.54mm', 'quantity' => 200],
            ['part_name' => 'Female Header Socket 2.54mm', 'quantity' => 150],
            ['part_name' => 'Breadboard (400pt)', 'quantity' => 5],
            ['part_name' => 'Breadboard (830pt)', 'quantity' => 3],
            ['part_name' => 'Jumper Wires Set', 'quantity' => 15],
            ['part_name' => 'Soldering Iron Tip', 'quantity' => 25],
            ['part_name' => 'Solder Wire 60/40', 'quantity' => 10],
            ['part_name' => 'Flux Paste', 'quantity' => 5],
            ['part_name' => 'Heat Shrink Tubing', 'quantity' => 20],
            ['part_name' => 'Thermal Paste', 'quantity' => 8],
            ['part_name' => 'Cooling Fan 5V', 'quantity' => 12],
            ['part_name' => 'Heatsink CPU', 'quantity' => 6],
        ];

        foreach ($inventory as $item) {
            ComponentInventory::create($item);
        }
    }
}
