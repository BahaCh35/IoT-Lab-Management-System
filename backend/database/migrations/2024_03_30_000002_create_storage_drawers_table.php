<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('storage_drawers', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('cabinet_id');
            $table->string('name');
            $table->text('description')->nullable();
            $table->integer('position');
            $table->integer('item_count')->default(0);
            $table->boolean('is_active')->default(true);
            $table->json('metadata')->nullable();
            $table->timestamps();

            // Foreign key constraints
            $table->foreign('cabinet_id')->references('id')->on('storage_cabinets')->onDelete('cascade');

            // Unique constraint for drawer positions within each cabinet
            $table->unique(['cabinet_id', 'position']);

            // Indexes for efficient querying
            $table->index('cabinet_id');
            $table->index(['cabinet_id', 'position']);
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('storage_drawers');
    }
};