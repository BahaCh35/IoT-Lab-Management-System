<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('equipment', function (Blueprint $table) {
            $table->integer('maintenance_count')->default(0)->after('quantity');
            $table->integer('damaged_count')->default(0)->after('maintenance_count');
        });
    }

    public function down(): void
    {
        Schema::table('equipment', function (Blueprint $table) {
            $table->dropColumn(['maintenance_count', 'damaged_count']);
        });
    }
};
