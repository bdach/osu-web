// Copyright (c) ppy Pty Ltd <contact@ppy.sh>. Licensed under the GNU Affero General Public License v3.0.
// See the LICENCE file in the repository root for full licence text.

export type MatchEventType =
  | 'player-left'
  | 'player-joined'
  | 'player-kicked'
  | 'match-created'
  | 'match-disbanded'
  | 'host-changed';

export interface MatchEventDetail {
  type: MatchEventType;
}

export default interface MatchEvent {
  detail: MatchEventDetail;
  id: number;
  timestamp: string;
  user_id: number;
}
