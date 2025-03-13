// Copyright (c) ppy Pty Ltd <contact@ppy.sh>. Licensed under the GNU Affero General Public License v3.0.
// See the LICENCE file in the repository root for full licence text.

import HeaderV4 from 'components/header-v4';
import { route } from 'laroute';
import _ from 'lodash';
import * as React from 'react';
import Match, { MatchDetails, MatchEvent } from '../interfaces/match-json';
import UserJson from '../interfaces/user-json';
import { classWithModifiers } from '../utils/css';
import Content from './content';

interface Props {
  events: Match;
}

interface State {
  currentGameId?: number;
  events: MatchEvent[];
  latestEventId: number;
  loadingNext: boolean;
  loadingPrevious: boolean;
  match: MatchDetails;
  users: { [userId: string]: UserJson };
}

export default class Main extends React.Component<Props, State> {
  static readonly FETCH_LIMIT = 100;
  static readonly MAXIMUM_EVENTS = 500;
  static readonly REFRESH_TIMEOUT = 10000;

  loadNextBound: () => void;
  loadPreviousBound: () => void;

  timeouts: {
    autoload?: number;
  };

  constructor(props: Props) {
    super(props);

    const events = props.events.events;

    this.timeouts = {};

    this.state = {
      currentGameId: props.events.current_game_id,
      events,
      latestEventId: props.events.latest_event_id,
      loadingNext: false,
      loadingPrevious: false,
      match: props.events.match,
      users: _.keyBy(props.events.users, 'id'),
    };
    this.loadNextBound = this.loadNext.bind(this);
    this.loadPreviousBound = this.loadPrevious.bind(this);
  }

  autoload() {
    if (!this.isAutoloading()) {
      return;
    }

    this.loadNext();
  }

  componentDidMount() {
    this.delayedAutoload();
  }

  delayedAutoload() {
    this.timeouts.autoload = setTimeout(() => this.autoload(), Main.REFRESH_TIMEOUT);
  }

  hasLatest(): boolean {
    const lastEvent = _.last(this.state.events);

    return lastEvent != null && lastEvent.id === this.state.latestEventId;
  }

  hasNext(): boolean {
    return this.isOngoing() || !this.hasLatest();
  }

  hasPrevious(): boolean {
    const firstEvent = this.state.events[0];

    return firstEvent != null && firstEvent.id !== this.props.events.first_event_id;
  }

  isAutoloading(): boolean {
    return this.isOngoing() && this.hasLatest();
  }

  isOngoing(): boolean {
    return this.state.match.end_time == null;
  }

  loadNext() {
    if (!this.hasNext()) {
      return;
    }

    clearTimeout(this.timeouts.autoload);
    this.setState({ loadingNext: true });

    $.ajax(
      route('matches.show', { match: this.state.match.id }),
      {
        data: {
          after: this.minNextEventId(),
          limit: Main.FETCH_LIMIT,
        },
        dataType: 'JSON',
        method: 'GET',
      })
      .done((data: Match) => {
        if (_.isEmpty(data.events)) {
          return;
        }

        const startEventId = data.events[0]?.id ?? 0;

        const newEvents = _.dropRightWhile(this.state.events, (e) => e.id >= startEventId)
          .concat(data.events)
          .slice(-Main.MAXIMUM_EVENTS);
        const newUsers = this.newUsersHash(data.users);

        this.setState({
          currentGameId: data.current_game_id,
          events: newEvents,
          latestEventId: data.latest_event_id,
          match: data.match,
          users: newUsers,
        });
      })
      .always(() => {
        this.setState({ loadingNext: false });
        this.delayedAutoload();
      });
  }

  loadPrevious() {
    if (!this.hasPrevious()) {
      return;
    }

    this.setState({ loadingPrevious: true });

    $.ajax(
      route('matches.show', { match: this.state.match.id }),
      {
        data: {
          before: this.state.events[0]?.id,
          limit: Main.FETCH_LIMIT,
        },
        dataType: 'JSON',
        method: 'GET',
      })
      .done((data: Match) => {
        if (_.isEmpty(data.events)) {
          return;
        }

        const newEvents = data.events.concat(this.state.events)
          .slice(0, Main.MAXIMUM_EVENTS);
        const newUsers = this.newUsersHash(data.users);

        this.setState({
          currentGameId: data.current_game_id,
          events: newEvents,
          latestEventId: data.latest_event_id,
          users: newUsers,
        });
      })
      .always(() => {
        this.setState({ loadingPrevious: false });
      });
  }

  minNextEventId(): number | undefined {
    let id: number | undefined;

    if (this.state.currentGameId != null) {
      const currentGame = _.find(this.state.events, (e) => e.game?.id === this.state.currentGameId);
      if (currentGame != null) {
        id = currentGame.id - 1;
      }
    }

    return id ?? _.last(this.state.events)?.id;
  }

  newUsersHash(users: UserJson[]) {
    return _({})
      .assign(this.state.users)
      .assign(_.keyBy(users, 'id'))
      .value();
  }

  render() {
    return (
      <React.Fragment key={null}>
        <HeaderV4
          theme={'mp-history'} />
        <div className={classWithModifiers('osu-page', ['generic'])}>
          <Content
            currentGameId={this.state.currentGameId}
            events={this.state.events}
            hasNext={this.hasNext()}
            hasPrevious={this.hasPrevious()}
            isAutoloading={this.isAutoloading()}
            loadNext={this.loadNextBound}
            loadPrevious={this.loadPreviousBound}
            loadingNext={this.state.loadingNext}
            loadingPrevious={this.state.loadingPrevious}
            match={this.state.match}
            users={this.state.users} />
        </div>
      </React.Fragment>
    );
  }
}
