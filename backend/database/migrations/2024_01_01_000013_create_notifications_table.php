<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('type', ['info', 'success', 'warning', 'error'])->default('info');
            $table->string('title');
            $table->text('message');
            $table->boolean('read')->default(false);
            $table->string('icon')->nullable();
            $table->string('action_url')->nullable();
            $table->string('entity_id')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
