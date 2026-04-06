<?php

namespace App\Enums;

enum ComplianceResponseStatus: string
{
    case Draft = 'draft';
    case Completed = 'completed';
    case Flagged = 'flagged';
}
