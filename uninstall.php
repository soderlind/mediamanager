<?php
/**
 * Uninstall Media Manager
 *
 * Removes all plugin data when the plugin is deleted via the WordPress admin.
 * This file is called automatically by WordPress when the plugin is deleted.
 *
 * @package MediaManager
 */

// Exit if accessed directly or not in uninstall context.
if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

/**
 * Remove all Media Manager data.
 *
 * - Deletes all media_folder terms and their relationships
 * - Removes plugin options from the options table
 * - Cleans up any transients
 */

// Delete all terms in the media_folder taxonomy.
$mediamanager_terms = get_terms(
	array(
		'taxonomy'   => 'media_folder',
		'hide_empty' => false,
		'fields'     => 'ids',
	)
);

if ( ! is_wp_error( $mediamanager_terms ) && ! empty( $mediamanager_terms ) ) {
	foreach ( $mediamanager_terms as $mediamanager_term_id ) {
		wp_delete_term( $mediamanager_term_id, 'media_folder' );
	}
}

// Delete plugin options.
delete_option( 'mediamanager_settings' );

// Delete any transients.
delete_transient( 'mediamanager_folder_counts' );

// Clean up user meta (sidebar visibility state).
delete_metadata( 'user', 0, 'mediamanager_sidebar_visible', '', true );
