<?php

namespace App\Enums;

enum PolicyState: string
{
    case Draft = 'draft';
    case Published = 'published';
    case Archived = 'archived';
}
