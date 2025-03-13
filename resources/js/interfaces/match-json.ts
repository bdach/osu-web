// Copyright (c) ppy Pty Ltd <contact@ppy.sh>. Licensed under the GNU Affero General Public License v3.0.
// See the LICENCE file in the repository root for full licence text.

import MatchEvent from './match-event-json';
import UserJson from './user-json';

export interface MatchDetails {
  end_time: string;
  id: number;
  name: string;
}

export default interface Match {
  current_game_id: number;
  events: [MatchEvent];
  first_event_id: number;
  latest_event_id: number;
  match: MatchDetails;
  users: [UserJson];
}
