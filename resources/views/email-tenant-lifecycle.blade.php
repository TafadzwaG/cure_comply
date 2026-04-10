<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $title }}</title>
</head>
@php
    $branding = $tenant?->branding ?? \App\Support\TenantBranding::payload(null);
    $logoUrl = $branding['logo_url'] ?: url('/logo.svg');
    $primaryColor = $branding['primary_color'] ?? '#083D77';
    $primaryForeground = $branding['primary_foreground'] ?? '#FFFFFF';
    $softColor = $branding['soft_color'] ?? 'rgba(8, 61, 119, 0.12)';
    $softBorderColor = $branding['soft_border_color'] ?? 'rgba(8, 61, 119, 0.22)';
@endphp
<body style="margin:0;padding:0;background:#f7f9fb;color:#191c1e;font-family:Inter,Arial,sans-serif;">
<div style="width:100%;padding:32px 16px;background:#f7f9fb;">
    <div style="max-width:680px;margin:0 auto;background:#ffffff;border:1px solid rgba(195,198,209,0.35);border-radius:20px;overflow:hidden;box-shadow:0 24px 70px -40px rgba(0,39,83,0.22);">
        <div style="padding:24px 32px;background:linear-gradient(180deg,#f2f4f6 0%,#ffffff 100%);border-bottom:1px solid rgba(195,198,209,0.25);">
            <div style="display:flex;align-items:center;gap:12px;">
                <img src="{{ $logoUrl }}" alt="{{ $tenant?->name ?: 'Privacy Cure' }}" style="height:40px;width:auto;display:block;max-width:160px;object-fit:contain;">
                <div>
                    <div style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;font-weight:700;color:{{ $primaryColor }};">{{ $eyebrow }}</div>
                    <div style="font-size:22px;line-height:1.2;font-weight:700;color:#002753;margin-top:6px;">{{ $tenant?->name ?: 'Privacy Cure Compliance' }}</div>
                </div>
            </div>
        </div>

        <div style="padding:32px;">
            <h1 style="margin:0 0 12px;font-size:30px;line-height:1.2;font-weight:700;color:#002753;">{{ $title }}</h1>
            <p style="margin:0 0 20px;font-size:16px;line-height:1.7;color:#434750;">{{ $summary }}</p>

            @foreach(($body ?? []) as $paragraph)
                <p style="margin:0 0 14px;font-size:15px;line-height:1.7;color:#434750;">{{ $paragraph }}</p>
            @endforeach

            @if(! empty($details))
                <div style="margin:28px 0;padding:20px;border-radius:18px;background:{{ $softColor }};border:1px solid {{ $softBorderColor }};">
                    @foreach($details as $label => $value)
                        <div style="display:flex;justify-content:space-between;gap:16px;padding:10px 0;{{ ! $loop->last ? 'border-bottom:1px solid rgba(195,198,209,0.25);' : '' }}">
                            <span style="font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#737781;">{{ $label }}</span>
                            <span style="font-size:14px;font-weight:600;color:#002753;text-align:right;">{{ $value }}</span>
                        </div>
                    @endforeach
                </div>
            @endif

            @if(! empty($actionUrl))
                <div style="margin-top:28px;">
                    <a href="{{ $actionUrl }}" style="display:inline-block;padding:14px 24px;border-radius:999px;background:{{ $primaryColor }};color:{{ $primaryForeground }};text-decoration:none;font-size:14px;font-weight:700;">
                        {{ $actionLabel }}
                    </a>
                </div>
            @endif

            <p style="margin:28px 0 0;font-size:12px;line-height:1.7;color:#737781;">{{ $footer }}</p>
        </div>
    </div>
</div>
</body>
</html>
