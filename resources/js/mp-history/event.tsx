// Copyright (c) ppy Pty Ltd <contact@ppy.sh>. Licensed under the GNU Affero General Public License v3.0.
// See the LICENCE file in the repository root for full licence text.

import TimeWithTooltip from 'components/time-with-tooltip';
import { route } from 'laroute';
import * as React from 'react';
import { classWithModifiers } from 'utils/css';
import { trans } from 'utils/lang';
import { linkHtml } from 'utils/url';
import { MatchEvent } from '../interfaces/match-json';
import UserJson from '../interfaces/user-json';

interface Props {
  event: MatchEvent;
  users: { [userId: string]: UserJson };
}

export default function Event(props: Props) {
  const icons = {
    game_aborted: ['fas fa-ban'],
    host_changed: ['fas fa-exchange-alt'],
    player_joined: ['fas fa-arrow-right', 'far fa-circle'],
    player_kicked: ['fas fa-arrow-left', 'fas fa-ban'],
    player_left: ['fas fa-arrow-left', 'far fa-circle'],
    room_created: ['fas fa-plus'],
    room_disbanded: ['fas fa-times'],
  };

  const user = props.users[props.event.user_id];

  const event_type = props.event.detail.type;

  let userLink: string = '';

  if (user != null && event_type !== 'room_disbanded') {
    userLink = linkHtml(route('users.show', { user: user.id }), user.username, { classNames: ['mp-history-event__username'] });
  }

  if (event_type === 'other' || event_type === 'game_started') {
    return null;
  }

  return (
    <div className={'mp-history-event'}>
      <div className={'mp-history-event__time'}>
        <TimeWithTooltip dateTime={props.event.timestamp} format={'LTS'} />
      </div>
      <div className={classWithModifiers('mp-history-event__type', [event_type.replace('_', '-')])}>
        {icons[event_type].map((m) => <i key={m} className={m} />)}
      </div>
      <div dangerouslySetInnerHTML={{
        __html: trans(`matches.match.events.${event_type.replace('_', '-')}${user !== null ? '' : '-no-user'}`, { user: userLink }),
      }}
      className={'mp-history-event__text'} />
    </div>
  );
}
