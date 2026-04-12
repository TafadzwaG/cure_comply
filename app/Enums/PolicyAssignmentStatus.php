<?php

namespace App\Enums;

enum PolicyAssignmentStatus: string
{
    case Pending = 'pending';
    case Viewed = 'viewed';
    case Overdue = 'overdue';
    case Acknowledged = 'acknowledged';
}
