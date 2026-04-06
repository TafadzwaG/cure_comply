<?php

namespace App\Enums;

enum EvidenceReviewStatus: string
{
    case Pending = 'pending';
    case Approved = 'approved';
    case Rejected = 'rejected';
}
