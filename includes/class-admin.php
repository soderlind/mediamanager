<?php

namespace MediaManager;

if (!defined('ABSPATH')) {
    exit;
}

class Admin
{
    public static function init(): void
    {
        add_action('admin_enqueue_scripts', [static::class, 'enqueue_scripts']);
    }

    /**
     * Enqueue admin scripts and styles for the Media Library.
     *
     * @param string $hook_suffix The current admin page.
     */
    public static function enqueue_scripts(string $hook_suffix): void
    {
        // Only load on media library pages
        if (!in_array($hook_suffix, ['upload.php', 'media-new.php'], true)) {
            return;
        }

        $asset_file = MEDIAMANAGER_PLUGIN_DIR . 'build/admin.asset.php';

        if (!file_exists($asset_file)) {
            return;
        }

        $asset = include $asset_file;

        wp_enqueue_script(
            'mediamanager-admin',
            MEDIAMANAGER_PLUGIN_URL . 'build/admin.js',
            $asset['dependencies'] ?? ['wp-element', 'wp-api-fetch', 'wp-i18n', 'wp-icons'],
            $asset['version'] ?? MEDIAMANAGER_VERSION,
            true
        );

        wp_enqueue_style(
            'mediamanager-admin',
            MEDIAMANAGER_PLUGIN_URL . 'src/admin/styles/folder-tree.css',
            [],
            MEDIAMANAGER_VERSION
        );

        wp_set_script_translations('mediamanager-admin', 'mediamanager');
    }
}
