<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('approval_requests', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->enum('type', [
                'equipment-purchase', 'product-modification', 'checkout-request',
                'reservation-request', 'equipment-reservation', 'meeting-room-booking',
                'lab-reservation', 'storage-addition', 'damage-report'
            ]);
            $table->enum('status', ['pending', 'approved', 'rejected', 'cancelled'])->default('pending');
            $table->foreignId('requester_id')->constrained('users')->onDelete('cascade');
            $table->text('description');
            $table->json('details')->nullable();
            $table->date('requested_date');
            $table->foreignId('reviewed_by_id')->nullable()->constrained('users')->onDelete('set null');
            $table->date('reviewed_date')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->enum('priority', ['low', 'medium', 'high'])->default('low');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('approval_requests');
    }
};
