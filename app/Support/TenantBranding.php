<?php

namespace App\Support;

use App\Models\Tenant;

class TenantBranding
{
    public const DEFAULT_PRIMARY_COLOR = '#083D77';
    public const DEFAULT_FOREGROUND = '#FFFFFF';
    public const DEFAULT_SOFT_COLOR = 'rgba(8, 61, 119, 0.12)';
    public const DEFAULT_SOFT_BORDER = 'rgba(8, 61, 119, 0.22)';

    public static function normalizeHex(?string $value): ?string
    {
        if (! is_string($value)) {
            return null;
        }

        $value = strtoupper(trim($value));

        if ($value === '') {
            return null;
        }

        if (! str_starts_with($value, '#')) {
            $value = '#'.$value;
        }

        return preg_match('/^#[0-9A-F]{6}$/', $value) ? $value : null;
    }

    public static function payload(?Tenant $tenant): array
    {
        $primaryColor = self::normalizeHex($tenant?->primary_color) ?? self::DEFAULT_PRIMARY_COLOR;
        [$r, $g, $b] = self::hexToRgb($primaryColor);

        $foreground = self::contrastText($primaryColor);
        $softColor = sprintf('rgba(%d, %d, %d, 0.12)', $r, $g, $b);
        $softBorder = sprintf('rgba(%d, %d, %d, 0.22)', $r, $g, $b);

        return [
            'tenant_id' => $tenant?->id,
            'tenant_name' => $tenant?->name,
            'logo_url' => $tenant?->logo_url,
            'primary_color' => $primaryColor,
            'primary_foreground' => $foreground,
            'primary_hsl' => self::hexToHsl($primaryColor),
            'soft_color' => $softColor,
            'soft_border_color' => $softBorder,
            'sidebar_primary' => self::hexToHsl($primaryColor),
            'sidebar_primary_foreground' => $foreground,
            'sidebar_accent' => $softColor,
            'sidebar_accent_foreground' => self::hexToHsl($primaryColor),
            'sidebar_border' => $softBorder,
            'ring_color' => self::hexToHsl($primaryColor),
            'is_customized' => filled($tenant?->primary_color) || filled($tenant?->logo_path),
        ];
    }

    public static function contrastText(string $hex): string
    {
        [$r, $g, $b] = self::hexToRgb($hex);
        $luminance = (($r * 299) + ($g * 587) + ($b * 114)) / 1000;

        return $luminance >= 150 ? '#0F172A' : '#FFFFFF';
    }

    public static function hexToHsl(string $hex): string
    {
        [$r, $g, $b] = array_map(
            static fn (int $value) => $value / 255,
            self::hexToRgb($hex),
        );

        $max = max($r, $g, $b);
        $min = min($r, $g, $b);
        $h = 0;
        $s = 0;
        $l = ($max + $min) / 2;

        if ($max !== $min) {
            $delta = $max - $min;
            $s = $l > 0.5 ? $delta / (2 - $max - $min) : $delta / ($max + $min);

            $h = match ($max) {
                $r => (($g - $b) / $delta) + ($g < $b ? 6 : 0),
                $g => (($b - $r) / $delta) + 2,
                default => (($r - $g) / $delta) + 4,
            };

            $h /= 6;
        }

        return sprintf(
            'hsl(%d %d%% %d%%)',
            (int) round($h * 360),
            (int) round($s * 100),
            (int) round($l * 100),
        );
    }

    /**
     * @return array{0:int,1:int,2:int}
     */
    public static function hexToRgb(string $hex): array
    {
        $hex = ltrim($hex, '#');

        return [
            hexdec(substr($hex, 0, 2)),
            hexdec(substr($hex, 2, 2)),
            hexdec(substr($hex, 4, 2)),
        ];
    }
}
