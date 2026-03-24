<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            [
                'id' => 101,
                'name' => 'Ahmed',
                'email' => 'engineer@novation.com',
                'password' => Hash::make('password'),
                'role' => 'engineer',
                'department' => 'Engineering',
                'phone' => '+971501234567',
                'join_date' => '2023-06-15',
                'is_active' => true,
                'permissions' => [],
                'avatar' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=engineer@novation.com',
            ],
            [
                'id' => 102,
                'name' => 'Asma',
                'email' => 'engineer1@novation.com',
                'password' => Hash::make('password'),
                'role' => 'engineer',
                'department' => 'Engineering',
                'phone' => '+971502234567',
                'join_date' => '2023-07-20',
                'is_active' => true,
                'permissions' => [],
                'avatar' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=engineer1@novation.com',
            ],
            [
                'id' => 103,
                'name' => 'Ali',
                'email' => 'engineer2@novation.com',
                'password' => Hash::make('password'),
                'role' => 'engineer',
                'department' => 'Engineering',
                'phone' => '+971503234567',
                'join_date' => '2023-08-10',
                'is_active' => true,
                'permissions' => [],
                'avatar' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=engineer2@novation.com',
            ],
            [
                'id' => 104,
                'name' => 'Nada',
                'email' => 'engineer3@novation.com',
                'password' => Hash::make('password'),
                'role' => 'engineer',
                'department' => 'Research',
                'phone' => '+971504234567',
                'join_date' => '2023-09-05',
                'is_active' => true,
                'permissions' => [],
                'avatar' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=engineer3@novation.com',
            ],
            [
                'id' => 105,
                'name' => 'Yomna',
                'email' => 'engineer4@novation.com',
                'password' => Hash::make('password'),
                'role' => 'engineer',
                'department' => 'Research',
                'phone' => '+971505234567',
                'join_date' => '2023-10-12',
                'is_active' => true,
                'permissions' => [],
                'avatar' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=engineer4@novation.com',
            ],
            [
                'id' => 1,
                'name' => 'Ahmed (Admin)',
                'email' => 'admin@novation.com',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'department' => 'Administration',
                'phone' => '+971509876543',
                'join_date' => '2023-01-01',
                'is_active' => true,
                'permissions' => ['APPROVE_EQUIPMENT', 'APPROVE_PRODUCTS', 'APPROVE_RESERVATIONS', 'MANAGE_USERS', 'MANAGE_ROOMS', 'MANAGE_LABS', 'VIEW_ANALYTICS', 'MANAGE_STORAGE'],
                'avatar' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin@novation.com',
            ],
            [
                'id' => 201,
                'name' => 'John',
                'email' => 'technician@novation.com',
                'password' => Hash::make('password'),
                'role' => 'technician',
                'department' => 'Maintenance',
                'phone' => '+971506234567',
                'join_date' => '2023-03-15',
                'is_active' => true,
                'permissions' => [],
                'avatar' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=technician@novation.com',
            ],
            [
                'id' => 202,
                'name' => 'Sarah',
                'email' => 'technician1@novation.com',
                'password' => Hash::make('password'),
                'role' => 'technician',
                'department' => 'Maintenance',
                'phone' => '+971507234567',
                'join_date' => '2023-04-20',
                'is_active' => true,
                'permissions' => [],
                'avatar' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=technician1@novation.com',
            ],
        ];

        foreach ($users as $user) {
            User::create($user);
        }
    }
}
