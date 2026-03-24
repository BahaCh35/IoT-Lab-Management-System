<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('meeting_room_reservations', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('room_id');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->date('date');
            $table->time('start_time');
            $table->time('end_time');
            $table->enum('status', ['pending', 'approved', 'rejected', 'cancelled'])->default('pending');
            $table->foreignId('approver_id')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();

            $table->foreign('room_id')->references('id')->on('meeting_rooms')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('meeting_room_reservations');
    }
};
