// Copyright (c) ppy Pty Ltd <contact@ppy.sh>. Licensed under the GNU Affero General Public License v3.0.
// See the LICENCE file in the repository root for full licence text.

import FlagCountry from 'components/flag-country';
import Mod from 'components/mod';
import { route } from 'laroute';
import * as React from 'react';
import { formatNumber } from 'utils/html';
import { trans } from 'utils/lang';
import Ruleset, { rulesets } from '../interfaces/ruleset';
import SoloScoreJson from '../interfaces/solo-score-json';
import UserJson from '../interfaces/user-json';
import { classWithModifiers } from '../utils/css';
import { attributeDisplayTotals } from '../utils/score-helper';

interface Props {
  mode: Ruleset;
  score: SoloScoreJson;
  users: { [userId: string]: UserJson };
}

export default function Score(props: Props) {
  const firstRow = ['combo', 'accuracy', 'score'];

  const user = props.users[props.score.user_id];
  const ruleset = rulesets[props.score.ruleset_id];
  const totals = attributeDisplayTotals(ruleset, props.score);

  return (
    <div className={'mp-history-game__player-score mp-history-player-score'}>
      <div
        className={'mp-history-player-score__shapes'}
        style={{ backgroundImage: `url(/images/layout/mp-history/shapes-team-${props.score.match?.team ?? 'none'}.svg)` }} />
      <div className={'mp-history-player-score__main'}>
        <div className={'mp-history-player-score__info-box mp-history-player-score__info-box--user'}>
          <div className={'mp-history-player-score__username-box'}>
            <a
              className={'mp-history-player-score__username'}
              href={route('users.show', { user: user.id })}>
              {user.username}
            </a>

            {!props.score.passed
              ? <span className={'mp-history-player-score__failed'}>{trans('matches.match.failed')}</span>
              : null}
          </div>
          <a
            href={route('rankings', { country: user.country?.code, mode: props.mode, type: 'performance' })}>
            <FlagCountry country={user.country} modifiers={'medium'} />
          </a>
        </div>
        <div className={classWithModifiers('mp-history-player-score__info-box', ['stats'])}>
          <div className={classWithModifiers('mp-history-player-score__stat-row', ['first'])}>
            <div className={'mp-history-player-score__mods'}>
              {props.score.mods.map((mod) => (<Mod key={mod.acronym} mod={mod} />))}
            </div>
            {firstRow.map((m) => {
              let modifier = 'medium';
              let value;

              switch (m) {
                case 'combo':
                  value = formatNumber(props.score.max_combo);
                  break;

                case 'accuracy':
                  value = `${formatNumber(props.score.accuracy * 100, 2)}%`;
                  break;

                case 'score':
                  modifier = 'large';
                  value = formatNumber(props.score.total_score);
                  break;
              }

              return (
                <div key={m} className={classWithModifiers('mp-history-player-score__stat', [m])}>
                  <span
                    className={classWithModifiers('mp-history-player-score__stat-label', ['small'])}>{trans(`matches.match.score.stats.${m}`)}</span>
                  <span
                    className={classWithModifiers('mp-history-player-score__stat-number', [modifier])}>{value}</span>
                </div>
              );
            })}
          </div>

          <div className={'mp-history-player-score__stat-row'}>
            {totals.map((stat) => (
              <div key={stat.key} className={classWithModifiers('mp-history-player-score__stat', ['small'])}>
                <span className={classWithModifiers('mp-history-player-score__stat-label', ['large'])}>{stat.label}</span>
                <span className={classWithModifiers('mp-history-player-score__stat-number', ['small'])}>{formatNumber(stat.total)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
