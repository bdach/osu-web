// Copyright (c) ppy Pty Ltd <contact@ppy.sh>. Licensed under the GNU Affero General Public License v3.0.
// See the LICENCE file in the repository root for full licence text.

import Ruleset from './ruleset';

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

export default interface MatchGame {
  end_time: string | null;
  mode: Ruleset;
  mods: [string]; // TODO: get into proper shape
  scoring_type: ScoringType;
  start_time: string;
  team_type: TeamType;
}
