// Copyright (c) ppy Pty Ltd <contact@ppy.sh>. Licensed under the GNU Affero General Public License v3.0.
// See the LICENCE file in the repository root for full licence text.

import MatchGame from './match-game-json';

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

export default interface MatchEvent {
  detail: MatchEventDetail;
  game: MatchGame | null;
  id: number;
  timestamp: string;
  user_id: number;
}
