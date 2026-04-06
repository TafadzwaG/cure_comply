<?php

namespace App\Enums;

enum ComplianceRating: string
{
    case Green = 'Green';
    case Amber = 'Amber';
    case Red = 'Red';
}
