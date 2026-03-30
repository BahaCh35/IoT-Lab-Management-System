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
        Schema::create('storage_items', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('drawer_id');
            $table->string('equipment_id')->nullable();
            $table->string('name');
            $table->text('description')->nullable();
            $table->enum('category', ['microcontroller', 'component', 'tool', 'sensor', 'other']);
            $table->integer('quantity')->default(1);
            $table->decimal('unit_price', 10, 2)->nullable();
            $table->string('supplier')->nullable();
            $table->string('part_number')->nullable();
            $table->date('added_date');
            $table->date('expiry_date')->nullable();
            $table->integer('minimum_stock')->nullable();
            $table->boolean('is_consumable')->default(false);
            $table->json('specifications')->nullable();
            $table->string('image_url')->nullable();
            $table->timestamps();

            // Foreign key constraints
            $table->foreign('drawer_id')->references('id')->on('storage_drawers')->onDelete('cascade');
            $table->foreign('equipment_id')->references('id')->on('equipment')->onDelete('set null');

            // Indexes for efficient querying and searching
            $table->index('drawer_id');
            $table->index('equipment_id');
            $table->index(['category', 'name']);
            $table->index('name');
            $table->index('part_number');
            $table->index('added_date');
            $table->index(['quantity', 'minimum_stock']); // For low stock queries
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('storage_items');
    }
};