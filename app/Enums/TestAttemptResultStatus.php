<?php

namespace App\Enums;

enum TestAttemptResultStatus: string
{
    case Passed = 'passed';
    case Failed = 'failed';
    case PendingReview = 'pending_review';
}
