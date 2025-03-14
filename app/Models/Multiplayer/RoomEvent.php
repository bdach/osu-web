<?php

// Copyright (c) ppy Pty Ltd <contact@ppy.sh>. Licensed under the GNU Affero General Public License v3.0.
// See the LICENCE file in the repository root for full licence text.

namespace App\Models\Multiplayer;

use App\Models\Model;
use App\Models\User;

/**
 * @property int $event_id
 * @property string $event_type
 * @property PlaylistItem|null $game
 * @property int|null $playlist_item_id
 * @property int $room_id
 * @property \Carbon\Carbon $timestamp
 * @property User|null $user
 * @property int|null $user_id
 */
class RoomEvent extends Model
{
    const EVENT_TYPES = [
        'player_left',
        'player_joined',
        'player_kicked',
        'room_created',
        'room_disbanded',
        'game_started',
        'game_aborted',
        'host_changed',
    ];

    protected $table = 'multiplayer_room_events';

    public function room()
    {
        return $this->belongsTo(Room::class);
    }

    public function game()
    {
        return $this->belongsTo(PlaylistItem::class, 'playlist_item_id');
    }

    public function user()
    {
        return $this->hasOne(User::class);
    }
}
