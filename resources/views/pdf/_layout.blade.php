<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>@yield('title', 'PrivacyCure Report')</title>
    <style>
        @page { margin: 130px 40px 60px 40px; }
        body { font-family: DejaVu Sans, sans-serif; font-size: 11px; color: #0F2E52; }
        header {
            position: fixed; top: -100px; left: 0; right: 0; height: 90px;
            background: #0F2E52; color: #fff; padding: 18px 24px;
            border-bottom: 4px solid #00daf3;
        }
        header .brand { font-size: 16px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; }
        header .tag { font-size: 10px; opacity: .8; }
        header .title { margin-top: 8px; font-size: 18px; font-weight: bold; }
        footer {
            position: fixed; bottom: -40px; left: 0; right: 0; height: 30px;
            font-size: 9px; color: #64748b; padding: 8px 24px;
            border-top: 1px solid #e2e8f0;
        }
        .muted { color: #64748b; }
        h2 { color: #0F2E52; font-size: 14px; margin: 18px 0 6px; border-bottom: 2px solid #14417A; padding-bottom: 4px; }
        h3 { color: #14417A; font-size: 12px; margin: 12px 0 4px; }
        table { width: 100%; border-collapse: collapse; margin-top: 6px; }
        th, td { text-align: left; padding: 6px 8px; border-bottom: 1px solid #e2e8f0; vertical-align: top; }
        th { background: #f1f5f9; font-size: 10px; text-transform: uppercase; letter-spacing: .5px; color: #475569; }
        .pill { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 9px; font-weight: bold; text-transform: uppercase; }
        .pill.brand { background: #e0edff; color: #14417A; }
        .pill.ok { background: #d1fae5; color: #065f46; }
        .pill.warn { background: #fef3c7; color: #92400e; }
        .pill.bad { background: #fee2e2; color: #991b1b; }
        .meta-grid { width: 100%; margin-top: 8px; }
        .meta-grid td { border: none; padding: 4px 8px; font-size: 10px; }
        .meta-grid td.label { color: #64748b; width: 140px; }
    </style>
</head>
<body>
    <header>
        <div class="brand">PrivacyCure Compliance</div>
        <div class="tag">Compliance reporting suite</div>
        <div class="title">@yield('title', 'Report')</div>
    </header>

    <footer>
        Generated {{ now()->format('d M Y H:i') }} · Confidential — do not distribute without authorization.
    </footer>

    @yield('content')
</body>
</html>
