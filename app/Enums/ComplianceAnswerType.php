<?php

namespace App\Enums;

enum ComplianceAnswerType: string
{
    case YesNoPartial = 'yes_no_partial';
    case Text = 'text';
    case Score = 'score';
    case Date = 'date';

    public function label(): string
    {
        return match ($this) {
            self::YesNoPartial => 'Yes / No / Partial',
            self::Text => 'Text',
            self::Score => 'Score',
            self::Date => 'Date',
        };
    }
}
