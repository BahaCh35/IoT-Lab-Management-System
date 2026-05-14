<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('meeting_room_reservations', function (Blueprint $table) {
            $table->string('approval_request_id')->nullable()->after('approver_id');
            $table->foreign('approval_request_id')
                ->references('id')
                ->on('approval_requests')
                ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('meeting_room_reservations', function (Blueprint $table) {
            $table->dropForeign(['approval_request_id']);
            $table->dropColumn('approval_request_id');
        });
    }
};
