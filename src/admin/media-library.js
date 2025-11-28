/**
 * Media Library integration.
 *
 * Extends the WordPress Media Library to inject a folder tree sidebar
 * and a view toggle button.
 */

import { createRoot } from '@wordpress/element';
import FolderTree from './components/FolderTree';

/**
 * Initialize the folder tree in the Media Library.
 */
function initFolderTree() {
	// Wait for wp.media to be available
	if (typeof wp === 'undefined' || typeof wp.media === 'undefined') {
		return;
	}

	// Extend the AttachmentsBrowser view to inject folder tree
	const originalRender =
		wp.media.view.AttachmentsBrowser.prototype.render;

	wp.media.view.AttachmentsBrowser.prototype.render = function () {
		originalRender.apply(this, arguments);

		// Create container for the folder tree if not already present
		if (!this.$el.find('#mm-folder-tree').length) {
			const container = document.createElement('div');
			container.id = 'mm-folder-tree';
			container.className = 'mm-folder-tree-container';
			this.$el.prepend(container);

			// Mount React component
			const root = createRoot(container);
			root.render(
				<FolderTree
					onFolderSelect={(folderId) => {
						// Update URL state
						const url = new URL(window.location);
						if (folderId) {
							url.searchParams.set('mm_folder', folderId);
						} else {
							url.searchParams.delete('mm_folder');
						}
						window.history.pushState({}, '', url);

						// Trigger re-fetch of attachments
						if (this.collection) {
							this.collection.props.set({
								media_folder: folderId || '',
							});
						}
					}}
				/>
			);
		}

		return this;
	};
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initFolderTree);
} else {
	initFolderTree();
}

export { initFolderTree };
