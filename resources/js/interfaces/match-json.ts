// Copyright (c) ppy Pty Ltd <contact@ppy.sh>. Licensed under the GNU Affero General Public License v3.0.
// See the LICENCE file in the repository root for full licence text.

import BeatmapJson from './beatmap-json';
import ModJson from './mod-json';
import Ruleset from './ruleset';
import SoloScoreJson from './solo-score-json';
import UserJson from './user-json';

export interface MatchDetails {
  end_time: string;
  id: number;
  name: string;
  start_time: string;
}

export default interface Match {
  current_game_id?: number;
  events: MatchEvent[];
  first_event_id: number;
  latest_event_id: number;
  match: MatchDetails;
  users: UserJson[];
}

export type MatchEventType =
  | 'player-left'
  | 'player-joined'
  | 'player-kicked'
  | 'match-created'
  | 'match-disbanded'
  | 'host-changed'
  | 'other';

export interface MatchEventDetail {
  type: MatchEventType;
}

export interface MatchEvent {
  detail: MatchEventDetail;
  game?: MatchGame;
  id: number;
  timestamp: string;
  user_id: number;
}

export type ScoringType =
  | 'score'
  | 'accuracy'
  | 'combo'
  | 'scorev2';

export type TeamType =
  | 'head-to-head'
  | 'tag-coop'
  | 'team-vs'
  | 'tag-team-vs';

export interface MatchGame {
  beatmap?: BeatmapJson;
  beatmap_id: number;
  end_time?: string;
  id: number;
  mode: Ruleset;
  mods: ModJson[];
  scores: MatchScore[];
  scoring_type: ScoringType;
  start_time: string;
  team_type: TeamType;
}

export interface MatchScoreDetails {
  slot: number;
  team: 'none' | 'blue' | 'red';
}

export type MatchScore = SoloScoreJson & MatchScoreDetails;
