<?php

namespace App\Enums;

enum CourseAssignmentStatus: string
{
    case Assigned = 'assigned';
    case InProgress = 'in_progress';
    case Completed = 'completed';
    case Overdue = 'overdue';
}
