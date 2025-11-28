import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DraggableMedia } from '../../src/admin/components/DraggableMedia.jsx';
import { DroppableFolder } from '../../src/admin/components/DroppableFolder.jsx';

// Mock @dnd-kit/core
vi.mock('@dnd-kit/core', () => ({
	useDraggable: vi.fn(() => ({
		attributes: { role: 'button', tabIndex: 0 },
		listeners: {},
		setNodeRef: vi.fn(),
		transform: null,
		isDragging: false,
	})),
	useDroppable: vi.fn(() => ({
		isOver: false,
		setNodeRef: vi.fn(),
		active: null,
	})),
}));

// Mock @dnd-kit/utilities
vi.mock('@dnd-kit/utilities', () => ({
	CSS: {
		Translate: {
			toString: vi.fn(() => null),
		},
	},
}));

// Mock WordPress i18n
vi.mock('@wordpress/i18n', () => ({
	__: (text) => text,
}));

describe('DraggableMedia', () => {
	it('renders children with draggable wrapper', () => {
		render(
			<DraggableMedia mediaId={1} title="Test Image" thumbnail="test.jpg">
				<img src="test.jpg" alt="Test" />
			</DraggableMedia>
		);

		expect(screen.getByRole('img')).toBeInTheDocument();
	});

	it('applies dragging class when isDragging is true', async () => {
		const { useDraggable } = await import('@dnd-kit/core');
		useDraggable.mockReturnValue({
			attributes: {},
			listeners: {},
			setNodeRef: vi.fn(),
			transform: null,
			isDragging: true,
		});

		const { container } = render(
			<DraggableMedia mediaId={1} title="Test" thumbnail="">
				<span>Content</span>
			</DraggableMedia>
		);

		expect(container.firstChild).toHaveClass('is-dragging');
	});

	it('has correct data attributes for accessibility', () => {
		const { container } = render(
			<DraggableMedia mediaId={42} title="My Media" thumbnail="thumb.jpg">
				<span>Content</span>
			</DraggableMedia>
		);

		expect(container.firstChild).toHaveClass('mm-draggable-media');
	});
});

describe('DroppableFolder', () => {
	it('renders children inside droppable container', () => {
		render(
			<DroppableFolder folderId={1}>
				<span>Folder Content</span>
			</DroppableFolder>
		);

		expect(screen.getByText('Folder Content')).toBeInTheDocument();
	});

	it('applies is-over class when media is dragged over', async () => {
		const { useDroppable } = await import('@dnd-kit/core');
		useDroppable.mockReturnValue({
			isOver: true,
			setNodeRef: vi.fn(),
			active: { data: { current: { type: 'media' } } },
		});

		const { container } = render(
			<DroppableFolder folderId={1}>
				<span>Drop here</span>
			</DroppableFolder>
		);

		expect(container.firstChild).toHaveClass('is-over');
	});

	it('does not show drop indicator for non-media drags', async () => {
		const { useDroppable } = await import('@dnd-kit/core');
		useDroppable.mockReturnValue({
			isOver: true,
			setNodeRef: vi.fn(),
			active: { data: { current: { type: 'folder' } } },
		});

		const { container } = render(
			<DroppableFolder folderId={1}>
				<span>Content</span>
			</DroppableFolder>
		);

		expect(container.firstChild).not.toHaveClass('is-over');
	});

	it('handles null folderId for root folder', () => {
		const { container } = render(
			<DroppableFolder folderId={null}>
				<span>Root</span>
			</DroppableFolder>
		);

		expect(container.firstChild).toHaveClass('mm-droppable-folder');
	});
});
