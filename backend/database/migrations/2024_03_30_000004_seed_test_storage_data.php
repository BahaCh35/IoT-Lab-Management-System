<?php

use Illuminate\Database\Migrations\Migration;
use App\Models\StorageCabinet;
use App\Models\StorageDrawer;
use App\Models\StorageItem;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // ========================================
        // CABINET A - Main Electronics Cabinet
        // ========================================
        $cabinetA = StorageCabinet::create([
            'id' => 'cabinet-A-' . time(),
            'name' => 'Cabinet A',
            'description' => 'Main electronics cabinet for microcontrollers and development boards',
            'location' => 'Lab Room 101',
            'building' => 'IoT Lab',
            'room' => 'Main Lab',
            'drawer_count' => 3,
            'is_active' => true,
            'metadata' => ['section' => 'electronics', 'priority' => 'high'],
        ]);

        // Cabinet A - Drawers
        $drawerA1 = StorageDrawer::create([
            'id' => 'drawer-A1-' . time(),
            'cabinet_id' => $cabinetA->id,
            'name' => 'Drawer 1',
            'description' => 'Microcontrollers and development boards',
            'position' => 1,
            'item_count' => 0,
            'is_active' => true,
            'metadata' => [],
        ]);

        $drawerA2 = StorageDrawer::create([
            'id' => 'drawer-A2-' . time(),
            'cabinet_id' => $cabinetA->id,
            'name' => 'Drawer 2',
            'description' => 'Sensors and modules',
            'position' => 2,
            'item_count' => 0,
            'is_active' => true,
            'metadata' => [],
        ]);

        $drawerA3 = StorageDrawer::create([
            'id' => 'drawer-A3-' . time(),
            'cabinet_id' => $cabinetA->id,
            'name' => 'Drawer 3',
            'description' => 'WiFi and communication modules',
            'position' => 3,
            'item_count' => 0,
            'is_active' => true,
            'metadata' => [],
        ]);

        // Cabinet A - Items
        StorageItem::create([
            'id' => 'item-A1-' . time(),
            'drawer_id' => $drawerA1->id,
            'name' => 'Arduino Uno R3',
            'description' => 'ATmega328P microcontroller board',
            'category' => 'microcontroller',
            'quantity' => 5,
            'unit_price' => 25.99,
            'supplier' => 'Arduino LLC',
            'part_number' => 'A000066',
            'added_date' => now()->subDays(10),
            'minimum_stock' => 2,
            'is_consumable' => false,
            'specifications' => ['voltage' => '5V', 'pins' => 14, 'digital_io' => 14, 'analog_in' => 6],
        ]);

        StorageItem::create([
            'id' => 'item-A2-' . time(),
            'drawer_id' => $drawerA1->id,
            'name' => 'ESP32 DevKit',
            'description' => 'WiFi and Bluetooth dual-mode microcontroller',
            'category' => 'microcontroller',
            'quantity' => 3,
            'unit_price' => 15.50,
            'supplier' => 'Espressif',
            'part_number' => 'ESP32-DEVKITC-32E',
            'added_date' => now()->subDays(7),
            'minimum_stock' => 1,
            'is_consumable' => false,
            'specifications' => ['voltage' => '3.3V', 'wifi' => true, 'bluetooth' => true, 'cores' => 2],
        ]);

        StorageItem::create([
            'id' => 'item-A3-' . time(),
            'drawer_id' => $drawerA2->id,
            'name' => 'DHT22 Temperature Sensor',
            'description' => 'Digital temperature and humidity sensor',
            'category' => 'sensor',
            'quantity' => 8,
            'unit_price' => 9.99,
            'supplier' => 'Adafruit',
            'part_number' => 'DHT22',
            'added_date' => now()->subDays(5),
            'minimum_stock' => 3,
            'is_consumable' => false,
            'specifications' => ['temp_range' => '-40 to 80°C', 'humidity_range' => '0-100%'],
        ]);

        StorageItem::create([
            'id' => 'item-A4-' . time(),
            'drawer_id' => $drawerA3->id,
            'name' => 'HC-05 Bluetooth Module',
            'description' => 'Wireless Bluetooth serial communication module',
            'category' => 'component',
            'quantity' => 6,
            'unit_price' => 7.50,
            'supplier' => 'Generic',
            'part_number' => 'HC-05',
            'added_date' => now()->subDays(12),
            'minimum_stock' => 2,
            'is_consumable' => false,
            'specifications' => ['range' => '10m', 'voltage' => '3.3-5V'],
        ]);

        // ========================================
        // CABINET B - Components and Consumables
        // ========================================
        $cabinetB = StorageCabinet::create([
            'id' => 'cabinet-B-' . time(),
            'name' => 'Cabinet B',
            'description' => 'Electronic components and consumable parts',
            'location' => 'Lab Room 102',
            'building' => 'IoT Lab',
            'room' => 'Component Storage',
            'drawer_count' => 3,
            'is_active' => true,
            'metadata' => ['section' => 'components', 'priority' => 'medium'],
        ]);

        // Cabinet B - Drawers
        $drawerB1 = StorageDrawer::create([
            'id' => 'drawer-B1-' . time(),
            'cabinet_id' => $cabinetB->id,
            'name' => 'Drawer 1',
            'description' => 'Resistors and capacitors',
            'position' => 1,
            'item_count' => 0,
            'is_active' => true,
            'metadata' => [],
        ]);

        $drawerB2 = StorageDrawer::create([
            'id' => 'drawer-B2-' . time(),
            'cabinet_id' => $cabinetB->id,
            'name' => 'Drawer 2',
            'description' => 'LEDs and displays',
            'position' => 2,
            'item_count' => 0,
            'is_active' => true,
            'metadata' => [],
        ]);

        $drawerB3 = StorageDrawer::create([
            'id' => 'drawer-B3-' . time(),
            'cabinet_id' => $cabinetB->id,
            'name' => 'Drawer 3',
            'description' => 'Cables and connectors',
            'position' => 3,
            'item_count' => 0,
            'is_active' => true,
            'metadata' => [],
        ]);

        // Cabinet B - Items
        StorageItem::create([
            'id' => 'item-B1-' . time(),
            'drawer_id' => $drawerB1->id,
            'name' => 'Resistor Kit 1/4W',
            'description' => 'Assorted resistors 1Ω-10MΩ (600 pieces)',
            'category' => 'component',
            'quantity' => 2,
            'unit_price' => 12.99,
            'supplier' => 'Electronics Plus',
            'part_number' => 'RES-KIT-1000',
            'added_date' => now()->subDays(15),
            'minimum_stock' => 1,
            'is_consumable' => true,
            'specifications' => ['power' => '0.25W', 'tolerance' => '5%', 'pieces' => 600],
        ]);

        StorageItem::create([
            'id' => 'item-B2-' . time(),
            'drawer_id' => $drawerB1->id,
            'name' => 'Ceramic Capacitor Set',
            'description' => 'Assorted ceramic capacitors 10pF-10μF',
            'category' => 'component',
            'quantity' => 1,
            'unit_price' => 15.99,
            'supplier' => 'Electronics Plus',
            'part_number' => 'CAP-CER-500',
            'added_date' => now()->subDays(20),
            'minimum_stock' => 1,
            'is_consumable' => true,
            'specifications' => ['voltage' => '50V', 'pieces' => 500],
        ]);

        StorageItem::create([
            'id' => 'item-B3-' . time(),
            'drawer_id' => $drawerB2->id,
            'name' => 'LED Assortment 5mm',
            'description' => 'Mixed color LEDs (Red, Green, Blue, Yellow, White)',
            'category' => 'component',
            'quantity' => 20,
            'unit_price' => 0.25,
            'supplier' => 'LED World',
            'part_number' => 'LED-5MM-MIX',
            'added_date' => now()->subDays(8),
            'minimum_stock' => 10,
            'is_consumable' => true,
            'specifications' => ['voltage' => '2-3.3V', 'current' => '20mA'],
        ]);

        StorageItem::create([
            'id' => 'item-B4-' . time(),
            'drawer_id' => $drawerB3->id,
            'name' => 'Jumper Wire Set',
            'description' => 'Male-to-male, male-to-female, female-to-female (120 pieces)',
            'category' => 'component',
            'quantity' => 5,
            'unit_price' => 8.99,
            'supplier' => 'Cable Co',
            'part_number' => 'JUMP-120',
            'added_date' => now()->subDays(6),
            'minimum_stock' => 2,
            'is_consumable' => true,
            'specifications' => ['length' => '20cm', 'pieces' => 120],
        ]);

        StorageItem::create([
            'id' => 'item-B5-' . time(),
            'drawer_id' => $drawerB3->id,
            'name' => 'USB Type-C Cable',
            'description' => 'USB 2.0 Type-C charging and data cable',
            'category' => 'component',
            'quantity' => 10,
            'unit_price' => 5.99,
            'supplier' => 'Cable Co',
            'part_number' => 'USB-C-1M',
            'added_date' => now()->subDays(4),
            'minimum_stock' => 5,
            'is_consumable' => false,
            'specifications' => ['length' => '1m', 'speed' => '480Mbps'],
        ]);

        // ========================================
        // CABINET C - Tools and Test Equipment
        // ========================================
        $cabinetC = StorageCabinet::create([
            'id' => 'cabinet-C-' . time(),
            'name' => 'Cabinet C',
            'description' => 'Tools, test equipment, and measurement devices',
            'location' => 'Lab Room 101',
            'building' => 'IoT Lab',
            'room' => 'Testing Area',
            'drawer_count' => 3,
            'is_active' => true,
            'metadata' => ['section' => 'tools', 'priority' => 'high'],
        ]);

        // Cabinet C - Drawers
        $drawerC1 = StorageDrawer::create([
            'id' => 'drawer-C1-' . time(),
            'cabinet_id' => $cabinetC->id,
            'name' => 'Drawer 1',
            'description' => 'Measurement tools',
            'position' => 1,
            'item_count' => 0,
            'is_active' => true,
            'metadata' => [],
        ]);

        $drawerC2 = StorageDrawer::create([
            'id' => 'drawer-C2-' . time(),
            'cabinet_id' => $cabinetC->id,
            'name' => 'Drawer 2',
            'description' => 'Hand tools',
            'position' => 2,
            'item_count' => 0,
            'is_active' => true,
            'metadata' => [],
        ]);

        $drawerC3 = StorageDrawer::create([
            'id' => 'drawer-C3-' . time(),
            'cabinet_id' => $cabinetC->id,
            'name' => 'Drawer 3',
            'description' => 'Soldering equipment',
            'position' => 3,
            'item_count' => 0,
            'is_active' => true,
            'metadata' => [],
        ]);

        // Cabinet C - Items
        StorageItem::create([
            'id' => 'item-C1-' . time(),
            'drawer_id' => $drawerC1->id,
            'name' => 'Digital Multimeter',
            'description' => 'Professional digital multimeter with auto-ranging',
            'category' => 'tool',
            'quantity' => 4,
            'unit_price' => 89.99,
            'supplier' => 'Fluke Corporation',
            'part_number' => 'FLUKE-115',
            'added_date' => now()->subDays(30),
            'minimum_stock' => 2,
            'is_consumable' => false,
            'specifications' => ['accuracy' => '0.5%', 'display' => 'LCD', 'ac_dc' => true],
        ]);

        StorageItem::create([
            'id' => 'item-C2-' . time(),
            'drawer_id' => $drawerC1->id,
            'name' => 'Logic Analyzer',
            'description' => '8-channel USB logic analyzer',
            'category' => 'tool',
            'quantity' => 2,
            'unit_price' => 45.00,
            'supplier' => 'Saleae',
            'part_number' => 'LOGIC-8',
            'added_date' => now()->subDays(25),
            'minimum_stock' => 1,
            'is_consumable' => false,
            'specifications' => ['channels' => 8, 'sample_rate' => '24MHz'],
        ]);

        StorageItem::create([
            'id' => 'item-C3-' . time(),
            'drawer_id' => $drawerC2->id,
            'name' => 'Precision Screwdriver Set',
            'description' => '32-piece precision screwdriver set',
            'category' => 'tool',
            'quantity' => 3,
            'unit_price' => 24.99,
            'supplier' => 'iFixit',
            'part_number' => 'IF145-299-6',
            'added_date' => now()->subDays(18),
            'minimum_stock' => 1,
            'is_consumable' => false,
            'specifications' => ['pieces' => 32, 'magnetic' => true],
        ]);

        StorageItem::create([
            'id' => 'item-C4-' . time(),
            'drawer_id' => $drawerC2->id,
            'name' => 'Wire Stripper/Cutter',
            'description' => 'Professional wire stripper and cutter tool',
            'category' => 'tool',
            'quantity' => 5,
            'unit_price' => 19.99,
            'supplier' => 'Klein Tools',
            'part_number' => '11063W',
            'added_date' => now()->subDays(22),
            'minimum_stock' => 2,
            'is_consumable' => false,
            'specifications' => ['wire_gauge' => '10-20 AWG'],
        ]);

        StorageItem::create([
            'id' => 'item-C5-' . time(),
            'drawer_id' => $drawerC3->id,
            'name' => 'Soldering Station',
            'description' => 'Digital temperature-controlled soldering station',
            'category' => 'tool',
            'quantity' => 3,
            'unit_price' => 79.99,
            'supplier' => 'Hakko',
            'part_number' => 'FX888D',
            'added_date' => now()->subDays(35),
            'minimum_stock' => 1,
            'is_consumable' => false,
            'specifications' => ['power' => '70W', 'temp_range' => '200-480°C'],
        ]);

        StorageItem::create([
            'id' => 'item-C6-' . time(),
            'drawer_id' => $drawerC3->id,
            'name' => 'Solder Wire 60/40',
            'description' => 'Rosin core solder wire (0.8mm, 100g)',
            'category' => 'component',
            'quantity' => 8,
            'unit_price' => 12.99,
            'supplier' => 'Kester',
            'part_number' => '24-6040-0027',
            'added_date' => now()->subDays(10),
            'minimum_stock' => 3,
            'is_consumable' => true,
            'specifications' => ['alloy' => '60/40 Sn/Pb', 'diameter' => '0.8mm', 'weight' => '100g'],
        ]);

        // Update all drawer item counts
        $drawerA1->updateItemCount();
        $drawerA2->updateItemCount();
        $drawerA3->updateItemCount();
        $drawerB1->updateItemCount();
        $drawerB2->updateItemCount();
        $drawerB3->updateItemCount();
        $drawerC1->updateItemCount();
        $drawerC2->updateItemCount();
        $drawerC3->updateItemCount();

        // Update all cabinet drawer counts
        $cabinetA->updateDrawerCount();
        $cabinetB->updateDrawerCount();
        $cabinetC->updateDrawerCount();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Clean up all test data for all three cabinets
        StorageItem::whereHas('drawer.cabinet', function ($query) {
            $query->whereIn('name', ['Cabinet A', 'Cabinet B', 'Cabinet C']);
        })->delete();

        StorageDrawer::whereHas('cabinet', function ($query) {
            $query->whereIn('name', ['Cabinet A', 'Cabinet B', 'Cabinet C']);
        })->delete();

        StorageCabinet::whereIn('name', ['Cabinet A', 'Cabinet B', 'Cabinet C'])->delete();
    }
};