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
        Schema::create('multiplayer_room_events', function (Blueprint $table) {
            $table->bigIncrements('event_id');
            $table->unsignedBigInteger('room_id');
            $table->enum('event_type', [
                'player_left',
                'player_joined',
                'player_kicked',
                'room_created',
                'room_disbanded',
                'game_started',
                'game_aborted',
                'host_changed',
            ]);
            $table->unsignedBigInteger('playlist_item_id')->nullable();
            $table->unsignedInteger('user_id')->nullable();
            $table->timestamp('timestamp')->useCurrent();
            $table->json('room_state')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('multiplayer_room_events');
    }
};
