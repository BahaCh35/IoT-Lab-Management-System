<?php

namespace Database\Seeders;

use App\Models\MeetingRoom;
use App\Models\MeetingRoomReservation;
use Illuminate\Database\Seeder;

class MeetingRoomSeeder extends Seeder
{
    public function run(): void
    {
        $rooms = [
            [
                'id' => 'room-1',
                'name' => 'Conference Room A',
                'capacity' => 12,
                'floor' => 2,
                'location' => 'Building A, East Wing',
                'amenities' => ['Projector', 'Whiteboard', 'Video Conference', 'WiFi'],
                'is_active' => true,
            ],
            [
                'id' => 'room-2',
                'name' => 'Conference Room B',
                'capacity' => 8,
                'floor' => 2,
                'location' => 'Building A, West Wing',
                'amenities' => ['Projector', 'Sound System', 'WiFi'],
                'is_active' => true,
            ],
            [
                'id' => 'room-3',
                'name' => 'Meeting Room C',
                'capacity' => 6,
                'floor' => 1,
                'location' => 'Building B, Main Hall',
                'amenities' => ['Whiteboard', 'WiFi', 'Kitchen Access'],
                'is_active' => true,
            ],
            [
                'id' => 'room-4',
                'name' => 'Board Room',
                'capacity' => 20,
                'floor' => 3,
                'location' => 'Building A, Executive Level',
                'amenities' => ['Projector', 'Video Conference', 'Sound System', 'Parking'],
                'is_active' => true,
            ],
        ];

        foreach ($rooms as $room) {
            MeetingRoom::create($room);
        }

        $reservations = [
            [
                'id' => 'res-1',
                'room_id' => 'room-1',
                'user_id' => 101,
                'title' => 'Team Standup',
                'date' => '2024-02-22',
                'start_time' => '10:00',
                'end_time' => '10:30',
                'status' => 'approved',
                'approver_id' => 1,
            ],
            [
                'id' => 'res-2',
                'room_id' => 'room-2',
                'user_id' => 102,
                'title' => 'Client Meeting',
                'date' => '2024-02-23',
                'start_time' => '14:00',
                'end_time' => '15:30',
                'status' => 'pending',
            ],
            [
                'id' => 'res-3',
                'room_id' => 'room-3',
                'user_id' => 103,
                'title' => 'Project Planning',
                'date' => '2024-02-24',
                'start_time' => '09:00',
                'end_time' => '11:00',
                'status' => 'approved',
                'approver_id' => 1,
            ],
        ];

        foreach ($reservations as $res) {
            MeetingRoomReservation::create($res);
        }
    }
}
