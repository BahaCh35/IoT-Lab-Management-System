<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('checkouts', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('equipment_id');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('user_name');
            $table->dateTime('checkout_date');
            $table->dateTime('expected_return_date');
            $table->dateTime('actual_return_date')->nullable();
            $table->enum('status', ['active', 'returned'])->default('active');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('equipment_id')->references('id')->on('equipment')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('checkouts');
    }
};
