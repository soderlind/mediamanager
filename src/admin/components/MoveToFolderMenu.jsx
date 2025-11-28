/**
 * Move to Folder menu component.
 *
 * Provides keyboard-accessible alternative to drag-and-drop
 * for moving media items to folders.
 */

import { useState, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Button, Dropdown, MenuGroup, MenuItem } from '@wordpress/components';
import { Icon, folder as folderIcon } from '@wordpress/icons';
import apiFetch from '@wordpress/api-fetch';

/**
 * MoveToFolderMenu component.
 *
 * @param {Object}   props
 * @param {number}   props.mediaId    The attachment ID to move.
 * @param {number|null} props.currentFolderId Current folder assignment.
 * @param {Function} props.onMove     Callback when folder is selected.
 */
export function MoveToFolderMenu({ mediaId, currentFolderId, onMove }) {
	const [folders, setFolders] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchFolders() {
			try {
				const response = await apiFetch({
					path: '/wp/v2/media-folders?per_page=100',
				});
				setFolders(response);
			} catch (error) {
				console.error('Error fetching folders:', error);
			} finally {
				setLoading(false);
			}
		}

		fetchFolders();
	}, []);

	function handleSelect(folderId) {
		onMove?.(mediaId, folderId);
	}

	/**
	 * Build a hierarchical tree for rendering.
	 */
	function buildTree(terms) {
		const map = {};
		const roots = [];

		terms.forEach((term) => {
			map[term.id] = { ...term, children: [] };
		});

		terms.forEach((term) => {
			if (term.parent && map[term.parent]) {
				map[term.parent].children.push(map[term.id]);
			} else {
				roots.push(map[term.id]);
			}
		});

		return roots;
	}

	/**
	 * Render folder items recursively.
	 */
	function renderFolderItems(items, level = 0, onClose) {
		return items.map((item) => (
			<div key={item.id}>
				<MenuItem
					onClick={() => {
						handleSelect(item.id);
						onClose();
					}}
					isSelected={currentFolderId === item.id}
					style={{ paddingLeft: `${level * 16 + 12}px` }}
				>
					<Icon icon={folderIcon} size={16} />
					<span style={{ marginLeft: '8px' }}>{item.name}</span>
				</MenuItem>
				{item.children.length > 0 && renderFolderItems(item.children, level + 1, onClose)}
			</div>
		));
	}

	const tree = buildTree(folders);

	return (
		<Dropdown
			className="mm-move-to-folder-dropdown"
			contentClassName="mm-move-to-folder-content"
			popoverProps={{ placement: 'bottom-start' }}
			renderToggle={({ isOpen, onToggle }) => (
				<Button
					variant="tertiary"
					onClick={onToggle}
					aria-expanded={isOpen}
					aria-haspopup="true"
					className="mm-move-to-folder-button"
				>
					<Icon icon={folderIcon} />
					<span className="screen-reader-text">
						{__('Move to folder', 'mediamanager')}
					</span>
				</Button>
			)}
			renderContent={({ onClose }) => (
				<MenuGroup label={__('Move to folder', 'mediamanager')}>
					{loading ? (
						<MenuItem disabled>
							{__('Loading…', 'mediamanager')}
						</MenuItem>
					) : (
						<>
							{/* Remove from folder option */}
							<MenuItem
								onClick={() => {
									handleSelect(null);
									onClose();
								}}
								isSelected={currentFolderId === null}
							>
								{__('Remove from folder', 'mediamanager')}
							</MenuItem>

							{/* Folder list */}
							{tree.length > 0 ? (
								renderFolderItems(tree, 0, onClose)
							) : (
								<MenuItem disabled>
									{__('No folders yet', 'mediamanager')}
								</MenuItem>
							)}
						</>
					)}
				</MenuGroup>
			)}
		/>
	);
}

export default MoveToFolderMenu;
