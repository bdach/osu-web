<?php

// Copyright (c) ppy Pty Ltd <contact@ppy.sh>. Licensed under the GNU Affero General Public License v3.0.
// See the LICENCE file in the repository root for full licence text.

namespace App\Transformers\LegacyMatch;

use App\Models\Beatmap;
use App\Models\LegacyMatch\Game;
use App\Models\Multiplayer\PlaylistItem;
use App\Transformers\BeatmapCompactTransformer;
use App\Transformers\ScoreTransformer;
use App\Transformers\TransformerAbstract;

class GameTransformer extends TransformerAbstract
{
    protected array $availableIncludes = [
        'beatmap',
        'scores',
    ];

    public function transform(Game|PlaylistItem $game)
    {
        if ($game instanceof Game) {
            return [
                'beatmap_id' => $game->beatmap_id,
                'id' => $game->game_id,
                'start_time' => $game->start_time_json,
                'end_time' => $game->end_time_json,
                'mode' => $game->mode,
                'mode_int' => $game->play_mode,
                'scoring_type' => $game->scoring_type,
                'team_type' => $game->team_type,
                'mods' => array_map(fn($acronym) => ['acronym' => $acronym], $game->mods),
            ];
        } else {
            return [
                'beatmap_id' => $game->beatmap_id,
                'id' => $game->id,
                'start_time' => $game->created_at,
                'end_time' => $game->played_at,
                'mode' => Beatmap::modeStr($game->ruleset_id),
                'mode_int' => $game->ruleset_id,
                'scoring_type' => 'score', // nothing else is supported right now
                'team_type' => str_replace('_', '-', $game->roomEvent->room_state->roomType),
                'mods' => $game->required_mods,
            ];
        }
    }

    public function includeBeatmap(Game|PlaylistItem $game)
    {
        $beatmap = $game->beatmap;

        if ($beatmap !== null) {
            return $this->item($beatmap, new BeatmapCompactTransformer());
        }
    }

    public function includeScores(Game|PlaylistItem $game)
    {
        if ($game instanceof Game) {
            return $this->collection(
                $game->scores,
                new ScoreTransformer(ScoreTransformer::TYPE_LEGACY_MATCH_TO_SOLO)
            );
        } else {
            return $this->collection(
                $game->scoreLinks->map(fn ($link) => $link->score),
                new ScoreTransformer()
            );
        }
    }
}
