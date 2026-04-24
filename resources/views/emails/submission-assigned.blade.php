<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $title }}</title>
</head>
@php
    $branding = $branding ?? ($tenant?->branding ?? \App\Support\TenantBranding::payload(null));
    $logoUrl = $branding['logo_url'] ?: url('/logo.svg');
    if (! empty($logoUrl) && str_starts_with($logoUrl, '/')) {
        $logoUrl = url($logoUrl);
    }

    $primaryColor = $branding['primary_color'] ?? '#083D77';
    $primaryForeground = $branding['primary_foreground'] ?? '#FFFFFF';
    $softColor = $branding['soft_color'] ?? 'rgba(8, 61, 119, 0.12)';
    $softBorderColor = $branding['soft_border_color'] ?? 'rgba(8, 61, 119, 0.22)';
    $workspaceLabel = $tenant?->name ?: 'Privacy Cure Compliance';
@endphp
<body style="margin:0;padding:0;background:#eef2f6;color:#191c1e;font-family:Inter,Arial,sans-serif;">
<div style="width:100%;padding:32px 16px;background:#eef2f6;">
    <div style="max-width:700px;margin:0 auto;border:1px solid rgba(195,198,209,0.35);border-radius:18px;overflow:hidden;background:#ffffff;box-shadow:0 26px 64px -42px rgba(0,39,83,0.30);">
        <div style="padding:28px 32px;background:linear-gradient(180deg,#f5f7fa 0%,#ffffff 100%);border-bottom:1px solid rgba(195,198,209,0.24);">
            <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                    <td style="vertical-align:middle;">
                        <table role="presentation" cellpadding="0" cellspacing="0">
                            <tr>
                                <td style="padding-right:14px;vertical-align:middle;">
                                    <img src="{{ $logoUrl }}" alt="{{ $workspaceLabel }}" style="height:42px;width:auto;display:block;max-width:170px;object-fit:contain;">
                                </td>
                                <td style="vertical-align:middle;">
                                    <div style="font-size:11px;letter-spacing:0.22em;text-transform:uppercase;font-weight:700;color:{{ $primaryColor }};">{{ $eyebrow }}</div>
                                    <div style="margin-top:6px;font-size:22px;line-height:1.2;font-weight:700;color:#002753;">{{ $workspaceLabel }}</div>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </div>

        <div style="padding:32px;">
            <div style="margin-bottom:24px;border:1px solid {{ $softBorderColor }};border-radius:18px;background:{{ $softColor }};padding:22px 24px;">
                <div style="display:inline-block;border-radius:999px;background:#ffffff;padding:6px 12px;font-size:11px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:{{ $primaryColor }};">
                    Assigned task
                </div>
                <h1 style="margin:16px 0 10px;font-size:30px;line-height:1.18;font-weight:700;color:#002753;">{{ $title }}</h1>
                <p style="margin:0;font-size:16px;line-height:1.75;color:#434750;">
                    Hello {{ $recipientName }}, {{ $summary }}
                </p>
            </div>

            <div style="margin-bottom:26px;">
                <div style="font-size:12px;letter-spacing:0.16em;text-transform:uppercase;font-weight:700;color:#737781;margin-bottom:12px;">Submission details</div>
                <div style="border:1px solid rgba(195,198,209,0.40);border-radius:18px;background:#ffffff;overflow:hidden;">
                    @foreach($details as $label => $value)
                        <div style="padding:14px 18px;{{ ! $loop->last ? 'border-bottom:1px solid rgba(195,198,209,0.22);' : '' }}">
                            <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td style="font-size:12px;letter-spacing:0.12em;text-transform:uppercase;font-weight:700;color:#737781;vertical-align:top;">{{ $label }}</td>
                                    <td style="font-size:14px;line-height:1.6;font-weight:600;color:#002753;text-align:right;vertical-align:top;">{{ $value }}</td>
                                </tr>
                            </table>
                        </div>
                    @endforeach
                </div>
            </div>

            <div style="margin-bottom:26px;">
                <div style="font-size:12px;letter-spacing:0.16em;text-transform:uppercase;font-weight:700;color:#737781;margin-bottom:12px;">What happens next</div>
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                        <td style="width:33.333%;padding-right:10px;vertical-align:top;">
                            <div style="height:100%;border:1px solid rgba(195,198,209,0.32);border-radius:16px;padding:18px;background:#ffffff;">
                                <div style="width:30px;height:30px;line-height:30px;text-align:center;border-radius:999px;background:{{ $softColor }};color:{{ $primaryColor }};font-size:13px;font-weight:700;">1</div>
                                <div style="margin-top:12px;font-size:15px;font-weight:700;color:#002753;">Open the submission</div>
                                <div style="margin-top:8px;font-size:13px;line-height:1.7;color:#5b616a;">Review the assigned framework scope, reporting period, and current response status.</div>
                            </div>
                        </td>
                        <td style="width:33.333%;padding:0 5px;vertical-align:top;">
                            <div style="height:100%;border:1px solid rgba(195,198,209,0.32);border-radius:16px;padding:18px;background:#ffffff;">
                                <div style="width:30px;height:30px;line-height:30px;text-align:center;border-radius:999px;background:{{ $softColor }};color:{{ $primaryColor }};font-size:13px;font-weight:700;">2</div>
                                <div style="margin-top:12px;font-size:15px;font-weight:700;color:#002753;">Add responses and evidence</div>
                                <div style="margin-top:8px;font-size:13px;line-height:1.7;color:#5b616a;">Complete the relevant questions and upload the supporting files required for review.</div>
                            </div>
                        </td>
                        <td style="width:33.333%;padding-left:10px;vertical-align:top;">
                            <div style="height:100%;border:1px solid rgba(195,198,209,0.32);border-radius:16px;padding:18px;background:#ffffff;">
                                <div style="width:30px;height:30px;line-height:30px;text-align:center;border-radius:999px;background:{{ $softColor }};color:{{ $primaryColor }};font-size:13px;font-weight:700;">3</div>
                                <div style="margin-top:12px;font-size:15px;font-weight:700;color:#002753;">Move it forward</div>
                                <div style="margin-top:8px;font-size:13px;line-height:1.7;color:#5b616a;">Save progress as needed, then complete the submission workflow when your work is ready.</div>
                            </div>
                        </td>
                    </tr>
                </table>
            </div>

            <div style="margin:28px 0 24px;">
                <a href="{{ $actionUrl }}" style="display:inline-block;padding:15px 26px;border-radius:999px;background:{{ $primaryColor }};color:{{ $primaryForeground }};text-decoration:none;font-size:14px;font-weight:700;">
                    {{ $actionLabel }}
                </a>
            </div>

            <div style="border:1px dashed {{ $softBorderColor }};border-radius:16px;padding:18px;background:#fbfcfd;">
                <div style="font-size:12px;letter-spacing:0.14em;text-transform:uppercase;font-weight:700;color:#737781;margin-bottom:10px;">Secure fallback link</div>
                <p style="margin:0 0 10px;font-size:13px;line-height:1.7;color:#5b616a;">If the button above does not open, copy and paste this secure link into your browser:</p>
                <p style="margin:0;word-break:break-all;font-size:13px;line-height:1.7;color:{{ $primaryColor }};">{{ $actionUrl }}</p>
            </div>

            <p style="margin:24px 0 0;font-size:12px;line-height:1.8;color:#737781;">{{ $footer }}</p>
        </div>
    </div>
</div>
</body>
</html>
