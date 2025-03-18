<?php

// Copyright (c) ppy Pty Ltd <contact@ppy.sh>. Licensed under the GNU Affero General Public License v3.0.
// See the LICENCE file in the repository root for full licence text.

declare(strict_types=1);

namespace App\Models\Multiplayer;

use Illuminate\Contracts\Database\Eloquent\Castable;
use Illuminate\Contracts\Database\Eloquent\CastsAttributes;
use JsonSerializable;

class RoomState implements Castable, JsonSerializable
{
    public string $roomType;
    public ?array $teams;

    public function __construct(array $data)
    {
        $this->roomType = $data['room_type'];
        $this->teams = $data['teams'];
    }

    public static function castUsing(array $arguments)
    {
        return new class implements CastsAttributes
        {
            public function get($model, $key, $value, $attributes)
            {
                if ($value === null) {
                    return null;
                }

                return new RoomState(json_decode($value, true));
            }

            public function set($model, $key, $value, $attributes)
            {
                if ($value === null) {
                    return ['room_state' => null];
                }

                if (!($value instanceof RoomState)) {
                    $value = new RoomState($value);
                }

                return ['room_state' => json_encode($value)];
            }
        };
    }

    public function jsonSerialize(): array
    {
        return [
            'room_type' => $this->roomType,
            'teams' => $this->teams,
        ];
    }
}
