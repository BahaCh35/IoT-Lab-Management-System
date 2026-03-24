<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('equipment', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('name');
            $table->text('description')->nullable();
            $table->enum('category', ['computer', 'microcontroller', 'sensor', 'tool', 'component', 'other']);
            $table->enum('status', ['available', 'checked-out', 'maintenance', 'damaged'])->default('available');
            $table->string('qr_code')->unique();
            $table->json('specifications')->nullable();
            $table->date('acquisition_date')->nullable();
            $table->integer('usage_count')->default(0);
            $table->string('last_used_by')->nullable();
            $table->timestamp('last_used_date')->nullable();
            $table->string('image_url')->nullable();
            $table->string('building')->nullable();
            $table->string('room')->nullable();
            $table->string('cabinet')->nullable();
            $table->string('drawer')->nullable();
            $table->string('shelf')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('equipment');
    }
};
