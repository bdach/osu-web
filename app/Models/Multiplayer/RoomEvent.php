<?php

// Copyright (c) ppy Pty Ltd <contact@ppy.sh>. Licensed under the GNU Affero General Public License v3.0.
// See the LICENCE file in the repository root for full licence text.

namespace App\Models\Multiplayer;

use App\Models\Model;
use App\Models\User;

/**
 * @property int $event_id
 * @property string $event_type
 * @property int|null $playlist_item_id
 * @property int $room_id
 * @property \Carbon\Carbon $timestamp
 * @property int|null $user
 */
class RoomEvent extends Model
{
    const EVENT_TYPES = [
        'player-left',
        'player-joined',
        'player-kicked',
        'room-created',
        'room-disbanded',
        'game-started',
        'game-aborted',
        'host-changed',
    ];

    protected $table = 'multiplayer_room_events';

    public function room()
    {
        return $this->belongsTo(Room::class);
    }

    public function playlistItem()
    {
        return $this->belongsTo(PlaylistItem::class);
    }

    public function user()
    {
        return $this->hasOne(User::class);
    }
}
