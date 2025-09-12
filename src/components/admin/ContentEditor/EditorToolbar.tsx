import React from 'react';
import { Editor } from '@tiptap/react';

interface EditorToolbarProps {
  editor: Editor;
  onMediaClick: () => void;
}

export function EditorToolbar({ editor, onMediaClick }: EditorToolbarProps) {
  const handleLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor.chain().focus().unsetLink().run();
      return;
    }

    editor.chain().focus().setLink({ href: url }).run();
  };

  const handleTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3 }).run();
  };

  return (
    <div className="flex flex-wrap gap-2 p-2 border rounded-lg bg-gray-50">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`toolbar-btn ${editor.isActive('bold') ? 'active' : ''}`}
        title="Bold"
      >
        <i className="fas fa-bold" />
      </button>
      
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`toolbar-btn ${editor.isActive('italic') ? 'active' : ''}`}
        title="Italic"
      >
        <i className="fas fa-italic" />
      </button>
      
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`toolbar-btn ${editor.isActive('strike') ? 'active' : ''}`}
        title="Strike"
      >
        <i className="fas fa-strikethrough" />
      </button>
      
      <div className="w-px h-6 bg-gray-300 mx-2" />
      
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`toolbar-btn ${editor.isActive('heading', { level: 1 }) ? 'active' : ''}`}
        title="Heading 1"
      >
        H1
      </button>
      
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`toolbar-btn ${editor.isActive('heading', { level: 2 }) ? 'active' : ''}`}
        title="Heading 2"
      >
        H2
      </button>
      
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`toolbar-btn ${editor.isActive('heading', { level: 3 }) ? 'active' : ''}`}
        title="Heading 3"
      >
        H3
      </button>
      
      <div className="w-px h-6 bg-gray-300 mx-2" />
      
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`toolbar-btn ${editor.isActive('bulletList') ? 'active' : ''}`}
        title="Bullet List"
      >
        <i className="fas fa-list-ul" />
      </button>
      
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`toolbar-btn ${editor.isActive('orderedList') ? 'active' : ''}`}
        title="Ordered List"
      >
        <i className="fas fa-list-ol" />
      </button>
      
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`toolbar-btn ${editor.isActive('blockquote') ? 'active' : ''}`}
        title="Blockquote"
      >
        <i className="fas fa-quote-right" />
      </button>
      
      <div className="w-px h-6 bg-gray-300 mx-2" />
      
      <button
        type="button"
        onClick={handleLink}
        className={`toolbar-btn ${editor.isActive('link') ? 'active' : ''}`}
        title="Link"
      >
        <i className="fas fa-link" />
      </button>
      
      <button
        type="button"
        onClick={onMediaClick}
        className="toolbar-btn"
        title="Insert Media"
      >
        <i className="fas fa-image" />
      </button>
      
      <button
        type="button"
        onClick={handleTable}
        className={`toolbar-btn ${editor.isActive('table') ? 'active' : ''}`}
        title="Insert Table"
      >
        <i className="fas fa-table" />
      </button>
      
      <div className="w-px h-6 bg-gray-300 mx-2" />
      
      <button
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        className="toolbar-btn"
        title="Undo"
        disabled={!editor.can().undo()}
      >
        <i className="fas fa-undo" />
      </button>
      
      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        className="toolbar-btn"
        title="Redo"
        disabled={!editor.can().redo()}
      >
        <i className="fas fa-redo" />
      </button>
    </div>
  );
}

// Add styles to your global CSS or styled-components
const styles = `
.toolbar-btn {
  @apply p-2 rounded hover:bg-gray-200 transition-colors;
  @apply text-gray-700 hover:text-gray-900;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
}

.toolbar-btn.active {
  @apply bg-gray-200 text-primary;
}
`;
