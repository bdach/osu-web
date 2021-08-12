<?php

// Copyright (c) ppy Pty Ltd <contact@ppy.sh>. Licensed under the GNU Affero General Public License v3.0.
// See the LICENCE file in the repository root for full licence text.

namespace App\Models\Chat;

use App\Libraries\Notification\BatchIdentities;
use App\Models\User;
use App\Models\UserNotification;
use App\Transformers\Chat\ChannelTransformer;
use DB;
use Ds\Map;
use Ds\Set;
use Illuminate\Support\Collection;

/**
 * @property Channel $channel
 * @property int $channel_id
 * @property bool $hidden
 * @property int|null $last_read_id
 * @property User $user
 * @property User $userScoped
 * @property int $user_id
 */
class UserChannel extends Model
{
    protected $guarded = [];

    protected $primaryKeys = ['user_id', 'channel_id'];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function userScoped()
    {
        return $this->belongsTo(User::class, 'user_id')->default();
    }

    public function channel()
    {
        return $this->belongsTo(Channel::class, 'channel_id');
    }

    // Laravel has own hidden property
    public function isHidden()
    {
        return (bool) $this->getAttribute('hidden');
    }

    public function markAsRead($messageId = null)
    {
        $maxId = get_int($messageId ?? Message::where('channel_id', $this->channel_id)->max('message_id'));

        if ($maxId === null) {
            return;
        }

        // this prevents the read marker from going backwards
        $this->update(['last_read_id' => DB::raw("GREATEST(COALESCE(last_read_id, 0), $maxId)")]);

        UserNotification::batchMarkAsRead($this->user, BatchIdentities::fromParams([
            'identities' => [
                [
                    'category' => 'channel',
                    'object_type' => 'channel',
                    'object_id' => $this->channel_id,
                ],
            ],
        ]));
    }

    public static function channelListForUser(User $user)
    {
        $channels = Channel::getChannelList($user);

        static::preloadUsers(static::pmChannelUserIds($channels), $user);

        return $channels;
    }

    public static function pmChannelUserIds(Collection $channels)
    {
        // Getting user list; Limited to PM channels due to large size of public channels.
        // FIXME: Chat needs reworking so it doesn't need to preload all this extra data every update.
        $userPmChannels = static::whereIn('channel_id', $channels->pluck('channel_id'))
            ->whereHas('channel', function ($q) {
                $q->where('type', 'PM');
            })
            ->get();

        return (new Set($userPmChannels->pluck('user_id')))->toArray();
    }

    public static function presenceForUser(User $user)
    {
        // retrieve all the channels the user is in and thse metadata for each
        $channels = Channel::getChannelList($user);
        static::preloadUsers(static::pmChannelUserIds($channels), $user);

        $filteredChannels = $channels->filter(function (Channel $channel) use ($user) {
            if (!$channel->isPM()) {
                return true;
            }

            $targetUser = $channel->pmTargetFor($user);
            return !($targetUser === null || $user->hasBlocked($targetUser) && !($targetUser->isModerator() || $targetUser->isAdmin()));
        });

        $transformer = ChannelTransformer::forUser($user);

        return json_collection($filteredChannels, $transformer, ['last_message_id', 'last_read_id', 'users']);
    }

    public static function forUser(User $user)
    {
        return static::where('user_id', $user->getKey())->where('hidden', false);
    }

    private static function preloadUsers(array $userIds, User $user)
    {
        $users = User::default()
            ->whereIn('user_id', $userIds)
            ->with([
                // only fetch data related to $user, to be used by ChatStart privilege check
                'friends' => function ($query) use ($user) {
                    $query->where('zebra_id', $user->getKey());
                },
                'blocks' => function ($query) use ($user) {
                    $query->where('zebra_id', $user->getKey());
                },
            ])
            ->get();

        // If any channel users are blocked, preload the user groups of those users for the isModerator check.
        $blockedIds = $users->pluck('user_id')->intersect($user->blocks->pluck('user_id'));
        if ($blockedIds->isNotEmpty()) {
            // Yes, the sql will look stupid.
            $users->load(['userGroups' => function ($query) use ($blockedIds) {
                $query->whereIn('user_id', $blockedIds);
            }]);
        }

        $usersMap = new Map();
        foreach ($users as $user) {
            $usersMap->put($user->getKey(), $user);
        }

        request()->attributes->set('preloadedUsers', $usersMap);

        return $users;
    }
}
