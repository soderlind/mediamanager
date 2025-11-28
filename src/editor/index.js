/**
 * Gutenberg Editor Integration for Media Manager.
 *
 * Entry point for block editor integration, including:
 * - Media library folder filtering
 * - Enhanced MediaUpload component
 */

import { registerMediaUploadFilter } from './components/MediaUploadFilter.jsx';
import './styles/editor.css';

/**
 * Initialize Gutenberg integration.
 */
function initGutenbergIntegration() {
	// Register the MediaUpload filter to add folder support
	registerMediaUploadFilter();

	// Add folder filter to media modal when it opens
	if (window.wp?.media) {
		const originalMediaFrame = window.wp.media.view.MediaFrame;

		if (originalMediaFrame) {
			// Extend the media frame to inject our folder filter
			window.wp.media.view.MediaFrame = originalMediaFrame.extend({
				initialize: function () {
					originalMediaFrame.prototype.initialize.apply(this, arguments);

					// Listen for the frame to be ready
					this.on('ready', () => {
						this.injectFolderFilter();
					});
				},

				injectFolderFilter: function () {
					// Find the toolbar and inject our folder filter
					const toolbar = this.$('.media-toolbar-secondary');
					if (toolbar.length && !toolbar.find('.mm-folder-filter-wrap').length) {
						const filterWrap = document.createElement('div');
						filterWrap.className = 'mm-folder-filter-wrap';
						toolbar.prepend(filterWrap);

						// The filter will be rendered by React
						this.renderFolderFilter(filterWrap);
					}
				},

				renderFolderFilter: function (container) {
					// Import and render the FolderFilter component
					import('./components/FolderFilter.jsx').then(({ FolderFilter }) => {
						const { createRoot } = wp.element;
						const root = createRoot(container);

						const frame = this;
						root.render(
							wp.element.createElement(FolderFilter, {
								value: '',
								onFilterChange: (folderId) => {
									frame.applyFolderFilter(folderId);
								},
							})
						);
					});
				},

				applyFolderFilter: function (folderId) {
					const state = this.state();
					if (!state) return;

					const library = state.get('library');
					if (!library) return;

					// Build query based on folder selection
					const props = library.props.toJSON();

					if (folderId === '') {
						// All folders - remove filter
						delete props.media_folder;
						delete props.media_folder_exclude;
					} else if (folderId === 'uncategorized') {
						// Uncategorized - exclude all folders
						delete props.media_folder;
						props.media_folder_exclude = 'all';
					} else {
						// Specific folder
						props.media_folder = parseInt(folderId, 10);
						delete props.media_folder_exclude;
					}

					library.props.set(props);
				},
			});
		}
	}
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initGutenbergIntegration);
} else {
	initGutenbergIntegration();
}

export { initGutenbergIntegration };
