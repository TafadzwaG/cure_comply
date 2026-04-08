@extends('pdf._layout')

@section('title', 'Submission · ' . ($submission->title ?: 'Compliance submission'))

@section('content')
    @php
        $statusValue = is_object($submission->status) ? $submission->status->value : $submission->status;
        $overallScore = $submission->score?->overall_score;
        $scorePill = 'bad';
        if ($overallScore >= 80) $scorePill = 'ok';
        elseif ($overallScore >= 50) $scorePill = 'warn';
    @endphp

    <table class="meta-grid">
        <tr>
            <td class="label">Submission</td>
            <td><strong>{{ $submission->title ?: 'Untitled submission' }}</strong></td>
            <td class="label">Framework</td>
            <td>{{ $submission->framework?->name ?? '—' }}</td>
        </tr>
        <tr>
            <td class="label">Tenant</td>
            <td>{{ $submission->tenant?->name ?? 'Platform' }}</td>
            <td class="label">Status</td>
            <td><span class="pill brand">{{ str_replace('_', ' ', ucfirst($statusValue)) }}</span></td>
        </tr>
        <tr>
            <td class="label">Submitted</td>
            <td>{{ optional($submission->submitted_at)->format('d M Y H:i') ?: '—' }}</td>
            <td class="label">Overall score</td>
            <td>
                @if($overallScore !== null)
                    <span class="pill {{ $scorePill }}">{{ round($overallScore, 1) }}%</span>
                @else
                    <span class="muted">Not scored</span>
                @endif
            </td>
        </tr>
    </table>

    @if($submission->sectionScores && $submission->sectionScores->count())
        <h2>Section scores</h2>
        <table>
            <thead>
                <tr>
                    <th>Section</th>
                    <th style="width:80px;">Score</th>
                    <th style="width:80px;">Weight</th>
                </tr>
            </thead>
            <tbody>
                @foreach($submission->sectionScores as $s)
                    <tr>
                        <td>{{ $s->section?->name ?? 'Section' }}</td>
                        <td>{{ round((float) $s->score, 1) }}%</td>
                        <td>{{ $s->section?->weight ?? 1 }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @endif

    @foreach($submission->framework?->sections ?? [] as $sectionIndex => $section)
        <h2>{{ $sectionIndex + 1 }}. {{ $section->name }}</h2>
        <table>
            <thead>
                <tr>
                    <th style="width:30px;">#</th>
                    <th>Question</th>
                    <th style="width:90px;">Answer</th>
                    <th style="width:60px;">Score</th>
                </tr>
            </thead>
            <tbody>
                @foreach($section->questions as $i => $q)
                    @php
                        $r = $responsesByQuestion->get($q->id);
                        $answer = $r?->answer_value ?? ($r?->answer_text ?? '—');
                        $score = $r?->response_score;
                        $pill = 'warn';
                        if (in_array(strtolower((string) $answer), ['yes','compliant','pass'])) $pill = 'ok';
                        elseif (in_array(strtolower((string) $answer), ['no','fail','non_compliant'])) $pill = 'bad';
                    @endphp
                    <tr>
                        <td>{{ $i + 1 }}</td>
                        <td>
                            {{ $q->question_text }}
                            @if($r?->comment_text)
                                <div class="muted" style="margin-top:3px;">{{ $r->comment_text }}</div>
                            @endif
                        </td>
                        <td><span class="pill {{ $pill }}">{{ $answer }}</span></td>
                        <td>{{ $score !== null ? round((float) $score, 1) : '—' }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @endforeach
@endsection
