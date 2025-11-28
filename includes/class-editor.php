<?php
/**
 * Gutenberg Editor Integration.
 *
 * Handles registration of editor scripts and styles
 * for block editor integration.
 *
 * @package MediaManager
 * @since 1.0.0
 */

declare(strict_types=1);

namespace MediaManager;

/**
 * Editor integration handler.
 */
final class Editor {

	/**
	 * Script handle for editor scripts.
	 */
	private const SCRIPT_HANDLE = 'mediamanager-editor';

	/**
	 * Boot the editor integration.
	 *
	 * @return void
	 */
	public static function boot(): void {
		add_action( 'enqueue_block_editor_assets', [ self::class, 'enqueue_editor_assets' ] );
		add_filter( 'ajax_query_attachments_args', [ self::class, 'filter_ajax_query_args' ] );
	}

	/**
	 * Enqueue block editor assets.
	 *
	 * @return void
	 */
	public static function enqueue_editor_assets(): void {
		$asset_file = MEDIAMANAGER_PATH . 'build/editor.asset.php';

		if ( file_exists( $asset_file ) ) {
			$asset = require $asset_file;
		} else {
			$asset = [
				'dependencies' => [
					'wp-element',
					'wp-components',
					'wp-api-fetch',
					'wp-hooks',
					'wp-i18n',
					'wp-media-utils',
				],
				'version'      => MEDIAMANAGER_VERSION,
			];
		}

		wp_enqueue_script(
			self::SCRIPT_HANDLE,
			MEDIAMANAGER_URL . 'build/editor.js',
			$asset['dependencies'],
			$asset['version'],
			true
		);

		wp_enqueue_style(
			self::SCRIPT_HANDLE,
			MEDIAMANAGER_URL . 'build/editor.css',
			[ 'wp-components' ],
			$asset['version']
		);

		// Pass folder data to JavaScript.
		wp_localize_script(
			self::SCRIPT_HANDLE,
			'mediaManagerEditor',
			self::get_editor_data()
		);

		// Set script translations.
		wp_set_script_translations(
			self::SCRIPT_HANDLE,
			'mediamanager',
			MEDIAMANAGER_PATH . 'languages'
		);
	}

	/**
	 * Get data to pass to editor scripts.
	 *
	 * @return array<string, mixed>
	 */
	private static function get_editor_data(): array {
		$folders = get_terms(
			[
				'taxonomy'   => 'media_folder',
				'hide_empty' => false,
				'orderby'    => 'name',
				'order'      => 'ASC',
			]
		);

		$folder_list = [];

		if ( ! is_wp_error( $folders ) && is_array( $folders ) ) {
			foreach ( $folders as $folder ) {
				$folder_list[] = [
					'id'     => $folder->term_id,
					'name'   => $folder->name,
					'slug'   => $folder->slug,
					'parent' => $folder->parent,
					'count'  => $folder->count,
				];
			}
		}

		return [
			'folders'  => $folder_list,
			'restBase' => 'media-folders',
			'nonce'    => wp_create_nonce( 'wp_rest' ),
		];
	}

	/**
	 * Filter AJAX attachment query arguments.
	 *
	 * Handles folder filtering for media library AJAX requests.
	 *
	 * @param array<string, mixed> $query_args Query arguments.
	 * @return array<string, mixed>
	 */
	public static function filter_ajax_query_args( array $query_args ): array {
		// phpcs:disable WordPress.Security.NonceVerification.Recommended
		if ( isset( $_REQUEST['query']['media_folder'] ) ) {
			$folder_id = absint( $_REQUEST['query']['media_folder'] );
			if ( $folder_id > 0 ) {
				$query_args['tax_query'] = [
					[
						'taxonomy' => 'media_folder',
						'field'    => 'term_id',
						'terms'    => $folder_id,
					],
				];
			}
		}

		if ( isset( $_REQUEST['query']['media_folder_exclude'] ) && 'all' === $_REQUEST['query']['media_folder_exclude'] ) {
			// Get all folder term IDs.
			$all_folders = get_terms(
				[
					'taxonomy'   => 'media_folder',
					'hide_empty' => false,
					'fields'     => 'ids',
				]
			);

			if ( ! is_wp_error( $all_folders ) && ! empty( $all_folders ) ) {
				$query_args['tax_query'] = [
					[
						'taxonomy' => 'media_folder',
						'field'    => 'term_id',
						'terms'    => $all_folders,
						'operator' => 'NOT IN',
					],
				];
			}
		}
		// phpcs:enable

		return $query_args;
	}
}
