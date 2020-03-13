<?php

// Copyright (c) ppy Pty Ltd <contact@ppy.sh>. Licensed under the GNU Affero General Public License v3.0.
// See the LICENCE file in the repository root for full licence text.

namespace App\Http\Controllers;

use App\Models\UserClient;
use Auth;
use Request;

class ClientVerificationsController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth', ['only' => 'store']);
        $this->middleware('verify-user');
        $this->middleware('throttle:60,10');

        return parent::__construct();
    }

    public function create()
    {
        if (!auth()->check()) {
            return ext_view('sessions.create', null, null, 401);
        }

        $hash = request('ch');
        $client = UserClient::lookupOrNew(auth()->user()->getKey(), $hash);

        if ($client === null) {
            abort(422); // TODO: add page mentioning invalid hash
        }

        if ($client->verified) {
            return ext_view('client_verifications.completed');
        }

        return ext_view('client_verifications.create', compact('hash'));
    }

    public function store()
    {
        $hash = request('ch');
        $client = UserClient::lookupOrNew(auth()->user()->getKey(), $hash);

        if ($client === null) {
            abort(422); // TODO: add page mentioning invalid hash
        }

        $client->fill(['verified' => true])->save();

        return ext_view('client_verifications.completed');
    }
}
