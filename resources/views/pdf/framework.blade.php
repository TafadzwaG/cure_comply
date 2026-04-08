@extends('pdf._layout')

@section('title', 'Framework · ' . $framework->name)

@section('content')
    <table class="meta-grid">
        <tr>
            <td class="label">Framework</td>
            <td><strong>{{ $framework->name }}</strong></td>
            <td class="label">Version</td>
            <td>{{ $framework->version ?: '—' }}</td>
        </tr>
        <tr>
            <td class="label">Status</td>
            <td><span class="pill brand">{{ ucfirst(is_object($framework->status) ? $framework->status->value : $framework->status) }}</span></td>
            <td class="label">Sections</td>
            <td>{{ $framework->sections->count() }}</td>
        </tr>
        <tr>
            <td class="label">Description</td>
            <td colspan="3">{{ $framework->description ?: 'No description provided.' }}</td>
        </tr>
    </table>

    @foreach($framework->sections as $sectionIndex => $section)
        <h2>{{ $sectionIndex + 1 }}. {{ $section->name }}</h2>
        <div class="muted">Weight: {{ $section->weight }} · Questions: {{ $section->questions->count() }}</div>
        @if($section->description)
            <p style="font-size:10px;">{{ $section->description }}</p>
        @endif

        <table>
            <thead>
                <tr>
                    <th style="width:30px;">#</th>
                    <th>Question</th>
                    <th style="width:80px;">Type</th>
                    <th style="width:60px;">Weight</th>
                </tr>
            </thead>
            <tbody>
                @foreach($section->questions as $i => $q)
                    <tr>
                        <td>{{ $i + 1 }}</td>
                        <td>{{ $q->question_text }}</td>
                        <td class="muted">{{ is_object($q->answer_type) ? $q->answer_type->value : $q->answer_type }}</td>
                        <td>{{ $q->weight ?? 1 }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @endforeach
@endsection
