// Copyright (c) ppy Pty Ltd <contact@ppy.sh>. Licensed under the GNU Affero General Public License v3.0.
// See the LICENCE file in the repository root for full licence text.

import MatchEvent from "./match-event-json";

export interface MatchDetails {
  name: string;
}

export default interface Match {
  events: [MatchEvent];
  match: MatchDetails;
}
