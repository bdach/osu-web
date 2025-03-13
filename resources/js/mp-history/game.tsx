// Copyright (c) ppy Pty Ltd <contact@ppy.sh>. Licensed under the GNU Affero General Public License v3.0.
// See the LICENCE file in the repository root for full licence text.

import StringWithComponent from 'components/string-with-component';
import _ from 'lodash';
import * as React from 'react';
import { formatNumber } from 'utils/html';
import { trans, transExists } from 'utils/lang';
import BeatmapJson from '../interfaces/beatmap-json';
import BeatmapsetJson from '../interfaces/beatmapset-json';
import { MatchEvent, MatchScore } from '../interfaces/match-json';
import Ruleset from '../interfaces/ruleset';
import UserJson from '../interfaces/user-json';
import { classWithModifiers } from '../utils/css';
import { TeamScores } from './content';
import GameHeader from './game-header';
import Score from './score';

type SortedScore = MatchScore & {
  teamRank: number;
};

interface Props {
  event: MatchEvent;
  teamScores: TeamScores;
  users: { [userId: string]: UserJson };
}

export default function Game(props: Props) {
  const game = props.event.game!;

  const showTeams = game.team_type === 'team-vs' || game.team_type === 'tag-team-vs';

  const winningTeam = props.teamScores.blue > props.teamScores.red ? 'blue' : 'red';
  const difference = Math.abs(props.teamScores.blue - props.teamScores.red);

  let sortedScores = game.scores.map((m) => {
    const sortedScore = m as SortedScore;
    sortedScore.teamRank = m.match.team === winningTeam ? 1 : 2;
    return sortedScore;
  });

  sortedScores = _.orderBy(sortedScores, ['teamRank', 'score'], ['asc', 'desc']);

  return (
    <div className={'mp-history-game'}>
      <GameHeader
        beatmap={game.beatmap ?? deletedBeatmap(game.mode)}
        beatmapset={game.beatmap?.beatmapset ?? deletedBeatmapset()}
        game={game} />
      <div className={classWithModifiers('mp-history-game__player-scores', showTeams ? [] : ['no-teams'])}>
        {sortedScores.map((m) => (
          <Score
            key={m.match.slot}
            mode={game.mode}
            score={m}
            users={props.users} />
        ))}
      </div>
      {showTeams && props.event.game?.end_time != null
        ? <div>
          <div className={'mp-history-game__team-scores'}>
            {['red', 'blue'].map((m) => (
              <div key={m} className={classWithModifiers('mp-history-game__team-score', [m])}>
                <span className={classWithModifiers('mp-history-game__team-score-text', ['name'])}>{trans(`matches.match.teams.${m}`)}</span>
                <span className={classWithModifiers('mp-history-game__team-score-text', ['score'])}>{formatNumber(props.teamScores[m as keyof TeamScores])}</span>
              </div>
            ))}
          </div>
          <div className={'mp-history-game__results'}>
            <span className={'mp-history-game__results-text'}>
              <StringWithComponent
                mappings={{
                  difference: formatNumber(difference),
                  winner: <strong>
                    <StringWithComponent
                      mappings={{ team: trans(`matches.match.teams.${winningTeam}`) }}
                      pattern={winnerTrans()} />
                  </strong>,
                }}
                pattern={trans('matches.match.winner_by')} />
            </span>
          </div>
        </div>
        : null}
    </div>
  );
}

function deletedBeatmap(mode: Ruleset): BeatmapJson {
  return {
    beatmapset_id: 0,
    difficulty_rating: 0,
    id: 0,
    mode,
    status: '',
    total_length: 0,
    user_id: 0,
    version: '',
  };
}

function deletedBeatmapset(): BeatmapsetJson {
  return {
    artist: '',
    artist_unicode: '',
    covers: {
      card: '',
      cover: '',
      list: '',
      slimcover: '',
    },
    creator: '',
    favourite_count: 0,
    hype: null,
    id: 0,
    nsfw: false,
    offset: 0,
    play_count: 0,
    preview_url: '',
    source: '',
    spotlight: false,
    status: 'graveyard',
    title: trans('matches.match.beatmap-deleted'),
    title_unicode: '',
    track_id: null,
    user_id: 0,
    video: false,
  };
}

// Prevent partial translation for winner_by's :winner pattern.
function winnerTrans(): string {
  const locale = transExists('matches.match.winner_by') ? undefined : fallbackLocale;
  return trans('matches.match.winner', {}, locale);
}
