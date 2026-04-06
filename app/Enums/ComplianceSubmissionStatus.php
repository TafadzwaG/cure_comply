<?php

namespace App\Enums;

enum ComplianceSubmissionStatus: string
{
    case Draft = 'draft';
    case Submitted = 'submitted';
    case InReview = 'in_review';
    case Scored = 'scored';
    case Closed = 'closed';
}
