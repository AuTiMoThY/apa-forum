<?php

namespace App\Controllers;

use App\Models\AppForumModel;
use App\Models\AppOrganizerModel;

class Home extends BaseController
{
    public function index(): string
    {
        $forum     = model(AppForumModel::class)->first() ?: [];
        $organizer = model(AppOrganizerModel::class)->first() ?: [];

        return view('home', [
            'title'       => '2026 國際動物保護論壇',
            'description' => '2026 國際動物保護論壇 — 遊蕩犬解方新視野',
            'forum'       => $forum,
            'organizer'   => $organizer,
        ]);
    }
}
