# Media Manager Design

This document tracks the evolving design of the Media Manager plugin.

## Completed

- **Foundation**: Git repo, plugin bootstrap (`mediamanager.php`), Composer + PHPUnit + Brain\Monkey, npm + Vitest setup.
- **Taxonomy**: `media_folder` hierarchical taxonomy on attachments, with tests in `TaxonomyTest.php`.
- **Smart Suggestions**:
  - Backend: `MediaManager\Suggestions` stores `_mm_folder_suggestions` based on MIME type, EXIF created timestamp, and IPTC keywords on upload (`wp_generate_attachment_metadata` with `context === 'create'`).
  - UI: `SuggestionNotice` React component shows inline notice with suggested folders and **Apply** / **Dismiss** actions.
- **Tree View UI**:
  - `src/admin/media-library.js`: Hooks into `wp.media.view.AttachmentsBrowser` to inject React folder tree sidebar.
  - `src/admin/components/FolderTree.jsx`: Renders hierarchical folder list with "All Media" and virtual "Uncategorized" filters.
  - `includes/class-admin.php`: Enqueues admin JS/CSS on Media Library pages (`upload.php`, `media-new.php`).
  - URL state management via `?mm_folder=<id>` query param.
  - Vitest tests in `tests/js/FolderTree.test.jsx` with `@vitejs/plugin-react` for JSX transformation.
  - PHPUnit tests in `tests/php/AdminTest.php`.
- **Drag-and-Drop Organization**:
  - `DndContext.jsx`: Wraps Media Library with `@dnd-kit/core` context, handles drag start/end events.
  - `DraggableMedia.jsx`: Makes media grid items draggable with visual feedback.
  - `DroppableFolder.jsx`: Makes folder tree items valid drop targets.
  - `MoveToFolderMenu.jsx`: Keyboard-accessible dropdown menu alternative to drag-and-drop.
  - `drag-drop.css`: Styles for drag overlay, drop indicators, reduced motion support.
  - Tests in `DragDrop.test.jsx` and `MoveToFolderMenu.test.jsx`.

## In Progress

- **Gutenberg Integration**:
  - Editor filters for `MediaUpload` and `PostFeaturedImage` with folder dropdown.

## Next

- Custom REST API endpoints for folders and suggestions.
- CI workflow running PHPUnit and Vitest.
