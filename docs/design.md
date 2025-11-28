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

## In Progress

- **Drag-and-Drop Organization**:
  - Using `@dnd-kit/core` and `@dnd-kit/sortable` for accessible drag-and-drop.
  - `DraggableMedia.jsx`: Wrap media grid items for drag capability.
  - `DroppableFolder.jsx`: Make folder tree items drop targets.
  - Keyboard accessible with arrow key + Enter support.

## Next

- Gutenberg integration with folder dropdown filter.
- Custom REST API endpoints for folders and suggestions.
- CI workflow running PHPUnit and Vitest.
