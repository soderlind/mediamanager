/**
 * Droppable Folder component.
 *
 * Makes a folder item a valid drop target for dragged media items.
 */

import { useDroppable } from '@dnd-kit/core';
import { __ } from '@wordpress/i18n';

/**
 * DroppableFolder component.
 *
 * @param {Object}   props
 * @param {number|string|null} props.folderId The folder ID (null for root, 'uncategorized' for uncategorized).
 * @param {React.ReactNode}    props.children
 * @param {string}   props.className Additional CSS classes.
 */
export function DroppableFolder({ folderId, children, className = '' }) {
	const { isOver, setNodeRef, active } = useDroppable({
		id: `folder-${folderId ?? 'root'}`,
		data: {
			folderId,
			type: 'folder',
		},
	});

	// Only show drop indicator when dragging media
	const isDraggingMedia = active?.data?.current?.type === 'media';
	const showDropIndicator = isOver && isDraggingMedia;

	return (
		<div
			ref={setNodeRef}
			className={`mm-droppable-folder ${className} ${showDropIndicator ? 'is-over' : ''}`}
			aria-dropeffect={isDraggingMedia ? 'move' : 'none'}
		>
			{children}
			{showDropIndicator && (
				<span className="screen-reader-text">
					{__('Drop here to move media to this folder', 'mediamanager')}
				</span>
			)}
		</div>
	);
}

export default DroppableFolder;
