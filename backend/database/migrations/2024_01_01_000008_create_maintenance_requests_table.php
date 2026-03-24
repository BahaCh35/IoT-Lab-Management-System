<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('maintenance_requests', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('equipment_id');
            $table->string('equipment_name');
            $table->text('problem_description');
            $table->foreignId('reported_by_id')->constrained('users')->onDelete('cascade');
            $table->dateTime('reported_date');
            $table->enum('priority', ['high', 'medium', 'low'])->default('medium');
            $table->enum('status', ['pending', 'in-progress', 'waiting-parts', 'completed', 'cannot-repair'])->default('pending');
            $table->foreignId('assigned_to_id')->nullable()->constrained('users')->onDelete('set null');
            $table->dateTime('claimed_date')->nullable();
            $table->dateTime('completed_date')->nullable();
            $table->text('notes')->nullable();
            $table->json('parts_used')->nullable();
            $table->decimal('time_spent', 5, 2)->default(0);
            $table->json('photos')->nullable();
            $table->string('building')->nullable();
            $table->string('room')->nullable();
            $table->string('cabinet')->nullable();
            $table->string('drawer')->nullable();
            $table->string('shelf')->nullable();
            $table->timestamps();

            $table->foreign('equipment_id')->references('id')->on('equipment')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('maintenance_requests');
    }
};
