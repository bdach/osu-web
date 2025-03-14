// Copyright (c) ppy Pty Ltd <contact@ppy.sh>. Licensed under the GNU Affero General Public License v3.0.
// See the LICENCE file in the repository root for full licence text.

import ShowMoreLink from 'components/show-more-link';
import * as React from 'react';
import { classWithModifiers } from 'utils/css';
import { bottomPageDistance } from 'utils/html';
import { trans } from 'utils/lang';
import { MatchDetails, MatchEvent, MatchGame } from '../interfaces/match-json';
import UserJson from '../interfaces/user-json';
import Event from './event';
import Game from './game';

interface Props {
  currentGameId?: number;
  events?: MatchEvent[];
  hasNext: boolean;
  hasPrevious: boolean;
  isAutoloading: boolean;
  loadingNext: boolean;
  loadingPrevious: boolean;
  loadNext: () => void;
  loadPrevious: () => void;
  match: MatchDetails;
  users: { [userId: string]: UserJson };
}

interface Snapshot {
  referenceFunc: (() => number) | null;
  referencePrev: number | null;
  scrollToLastEvent: boolean;
}

export interface TeamScores {
  blue: number;
  red: number;
}

export default class Content extends React.PureComponent<Props> {
  scoresCache: { [id: number]: TeamScores } = {};

  componentDidUpdate(_: Readonly<Props>, __: Readonly<any>, snapshot?: Snapshot) {
    if (snapshot?.scrollToLastEvent) {
      $(window).stop().scrollTo(document.body.scrollHeight, 500);
    } else if (snapshot?.referenceFunc) {
      const referenceCurrent = snapshot.referenceFunc();
      const documentScrollTopCurrent = window.scrollY;
      const documentScrollTopTarget = documentScrollTopCurrent + referenceCurrent - snapshot.referencePrev!;
      window.scrollTo(window.scrollX, documentScrollTopTarget);
    }
  }

  getSnapshotBeforeUpdate(prevProps: Readonly<Props>, _: Readonly<any>): Snapshot {
    const snapshot: Snapshot = {
      referenceFunc: null,
      referencePrev: null,
      scrollToLastEvent: prevProps.isAutoloading && this.props.isAutoloading && bottomPageDistance() < 10,
    };

    if (!snapshot.scrollToLastEvent) {
      if ((prevProps.events?.length ?? 0) > 0 && (this.props.events?.length ?? 0) > 0) {
        // This is to allow events to be added without moving currently
        // visible events on viewport.
        if (prevProps.events![0].id > this.props.events![0].id) {
          snapshot.referenceFunc = () => document.body.scrollHeight;
        } else {
          snapshot.referenceFunc = () => 0;
        }

        snapshot.referencePrev = snapshot.referenceFunc();
      }
    }

    return snapshot;
  }

  render() {
    let inEvent = false;
    const eventsGroupOpen = (<div className={classWithModifiers('mp-history-content__item', ['event', 'event-open'])} />);
    const eventsGroupClose = (<div className={classWithModifiers('mp-history-content__item', ['event', 'event-close'])} />);

    return (
      <div className={'mp-history-content'}>
        <h3 className={'mp-history-content__item'}>{this.props.match.name}</h3>
        {this.props.hasPrevious
          ? <div className={classWithModifiers('mp-history-content__item', ['more'])}>
            <ShowMoreLink
              callback={this.props.loadPrevious}
              direction={'up'}
              hasMore
              loading={this.props.loadingPrevious} />
          </div>
          : null}
        {this.props.events?.map((event) => {
          if (event.detail.type === 'other' || event.detail.type === 'game_started') {
            if (event.game == null || (event.game.end_time == null && event.game.id !== this.props.currentGameId)) {
              return null;
            }

            return (
              <React.Fragment key={event.id}>
                {(() => {
                  if (inEvent) {
                    inEvent = false;
                    return eventsGroupClose;
                  }
                })()}

                <div className={'mp-history-content__item'}>
                  <Game
                    event={event}
                    teamScores={this.teamScores(event.game)}
                    users={this.props.users} />
                </div>
              </React.Fragment>
            );
          } else {
            return (
              <React.Fragment key={event.id}>
                {(() => {
                  if (!inEvent) {
                    inEvent = true;
                    return eventsGroupOpen;
                  }
                })()}

                <div className={classWithModifiers('mp-history-content__item', ['event'])}>
                  <Event
                    key={event.id}
                    event={event}
                    users={this.props.users} />
                </div>
              </React.Fragment>
            );
          }
        })}
        {(() => {
          if (inEvent) {
            inEvent = false;
            return eventsGroupClose;
          }
        })()}
        {this.props.hasNext
          ? <div className={classWithModifiers('mp-history-content__item', ['more'])}>
            {this.props.isAutoloading
              ? <div className={'mp-history-content__autoload-label'}>{trans('matches.match.in_progress_spinner_label')}</div>
              : null}
            <ShowMoreLink
              callback={this.props.loadNext}
              hasMore
              loading={this.props.isAutoloading || this.props.loadingNext} />
          </div>
          : null}
      </div>
    );
  }

  teamScores(game: MatchGame): TeamScores {
    // this only caches ended games which scores shouldn't change ever.
    if (this.scoresCache[game.id] != null) {
      return this.scoresCache[game.id];
    }

    const scores: TeamScores = { blue: 0, red: 0 };

    if (game.end_time == null) {
      return scores;
    }

    for (const score of game.scores) {
      if (!score.passed) {
        continue;
      }
      scores[score.team] += score.total_score;
    }

    return this.scoresCache[game.id] = scores;
  }
}
