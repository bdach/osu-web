// Copyright (c) ppy Pty Ltd <contact@ppy.sh>. Licensed under the GNU Affero General Public License v3.0.
// See the LICENCE file in the repository root for full licence text.

// TODO: basically none of this should exist, and is only transitory
// while the models are worked into a uniform shape

export interface MatchScoreDetails {
  pass: boolean;
  slot: number;
  team: 'blue' | 'red';
}

export interface MatchScoreStatistics {
  count_100: number;
  count_300: number;
  count_50: number;
  count_geki: number;
  count_katu: number;
  count_miss: number;
}

export default interface MatchScore {
  accuracy: number;
  match: MatchScoreDetails;
  max_combo: number;
  mods: [string];
  score: number;
  statistics: MatchScoreStatistics;
  user_id: number;
}
