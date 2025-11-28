<?php

namespace MediaManager;

if (!defined('ABSPATH')) {
    exit;
}

class Suggestions
{
    public const META_KEY = '_mm_folder_suggestions';

    public static function init(): void
    {
        add_filter('wp_generate_attachment_metadata', [static::class, 'capture_suggestions'], 10, 3);
    }

    /**
     * Capture smart folder suggestions for a given attachment based on metadata.
     *
     * @param array $metadata
     * @param int   $attachment_id
     * @param string $context
     * @return array
     */
    public static function capture_suggestions(array $metadata, int $attachment_id, string $context): array
    {
        if ($context !== 'create') {
            return $metadata;
        }

        $mime_type = get_post_mime_type($attachment_id) ?: '';
        $suggestions = [];

        // Basic type-based suggestion
        if (str_starts_with($mime_type, 'image/')) {
            $suggestions[] = 'Images';
        } elseif (str_starts_with($mime_type, 'video/')) {
            $suggestions[] = 'Videos';
        } elseif (str_starts_with($mime_type, 'audio/')) {
            $suggestions[] = 'Audio';
        } else {
            $suggestions[] = 'Documents';
        }

        // Date-based suggestion from image metadata if available
        if (!empty($metadata['image_meta']['created_timestamp'])) {
            $timestamp = (int) $metadata['image_meta']['created_timestamp'];
            if ($timestamp > 0) {
                $year  = gmdate('Y', $timestamp);
                $month = gmdate('m', $timestamp);
                $suggestions[] = sprintf('%s/%s', $year, $month);
            }
        }

        // IPTC keywords
        if (!empty($metadata['image_meta']['keywords']) && is_array($metadata['image_meta']['keywords'])) {
            foreach ($metadata['image_meta']['keywords'] as $keyword) {
                $keyword = trim((string) $keyword);
                if ($keyword !== '') {
                    $suggestions[] = $keyword;
                }
            }
        }

        $suggestions = array_values(array_unique($suggestions));

        if ($suggestions !== []) {
            update_post_meta($attachment_id, static::META_KEY, $suggestions);
        }

        return $metadata;
    }
}
