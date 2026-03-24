<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lab_reservations', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('lab_id');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('purpose');
            $table->date('date');
            $table->time('start_time');
            $table->time('end_time');
            $table->enum('status', ['pending', 'approved', 'rejected', 'cancelled'])->default('pending');
            $table->foreignId('approver_id')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();

            $table->foreign('lab_id')->references('id')->on('labs')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lab_reservations');
    }
};
