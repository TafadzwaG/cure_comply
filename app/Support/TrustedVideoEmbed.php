<?php

namespace App\Support;

final class TrustedVideoEmbed
{
    public static function normalize(?string $url): ?string
    {
        if (blank($url)) {
            return null;
        }

        $url = trim((string) $url);
        $parts = parse_url($url);

        if (! $parts || empty($parts['host'])) {
            return null;
        }

        $host = strtolower($parts['host']);
        $path = trim((string) ($parts['path'] ?? ''), '/');

        if (str_contains($host, 'youtube.com') || str_contains($host, 'youtu.be')) {
            parse_str((string) ($parts['query'] ?? ''), $query);

            $videoId = match (true) {
                str_contains($host, 'youtu.be') => $path,
                str_starts_with($path, 'embed/') => substr($path, 6),
                isset($query['v']) => (string) $query['v'],
                default => null,
            };

            return filled($videoId) ? 'https://www.youtube.com/embed/'.$videoId : null;
        }

        if (str_contains($host, 'vimeo.com')) {
            $segments = array_values(array_filter(explode('/', $path)));
            $videoId = collect(array_reverse($segments))->first(fn ($segment) => ctype_digit($segment));

            return filled($videoId) ? 'https://player.vimeo.com/video/'.$videoId : null;
        }

        return null;
    }
}
