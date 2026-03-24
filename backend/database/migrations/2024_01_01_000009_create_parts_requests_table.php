<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('parts_requests', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('technician_id')->constrained('users')->onDelete('cascade');
            $table->string('technician_name');
            $table->string('part_name');
            $table->integer('quantity');
            $table->text('reason');
            $table->dateTime('requested_date');
            $table->enum('status', ['pending', 'approved', 'arrived', 'rejected', 'cancelled'])->default('pending');
            $table->foreignId('approved_by_id')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('parts_requests');
    }
};
