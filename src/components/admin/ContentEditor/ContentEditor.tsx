import React, { useState, useEffect } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import { contentWorkflowService } from '@/services/contentWorkflowService';
import { ContentRevision, Post } from '@/types/admin';
import { EditorToolbar } from './EditorToolbar';
import { MediaLibrary } from '../MediaLibrary/MediaLibrary';
import { SeoSettings } from './SeoSettings';
import { WorkflowStatus } from './WorkflowStatus';
import { RevisionHistory } from './RevisionHistory';
import { AutoSave } from './AutoSave';
import { toast } from 'react-hot-toast';

interface ContentEditorProps {
  post?: Post;
  onSave?: (post: Partial<Post>) => Promise<void>;
  readOnly?: boolean;
}

export function ContentEditor({ post, onSave, readOnly = false }: ContentEditorProps) {
  const [content, setContent] = useState(post?.content || '');
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [showRevisionHistory, setShowRevisionHistory] = useState(false);
  const [revisions, setRevisions] = useState<ContentRevision[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        allowBase64: false,
        inline: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: 'noopener noreferrer',
          class: 'cursor-pointer text-primary hover:underline',
        },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableCell,
    ],
    content,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
  });

  useEffect(() => {
    if (post?.id) {
      loadRevisions();
    }
  }, [post?.id]);

  const loadRevisions = async () => {
    if (!post?.id) return;

    try {
      const revisions = await contentWorkflowService.getRevisions(post.id);
      setRevisions(revisions);
    } catch (error) {
      toast.error('Failed to load revision history');
    }
  };

  const handleSave = async (isAutoSave = false) => {
    if (!post?.id || !editor || isSaving) return;

    setIsSaving(true);

    try {
      const revision = await contentWorkflowService.saveRevision({
        postId: post.id,
        content: editor.getHTML(),
        comment: isAutoSave ? 'Auto-save' : undefined,
      });

      if (!isAutoSave && onSave) {
        await onSave({
          id: post.id,
          content: editor.getHTML(),
          lastAutosaveAt: new Date().toISOString(),
        });
      }

      setLastSavedAt(new Date());
      await loadRevisions();

      if (!isAutoSave) {
        toast.success('Content saved successfully');
      }
    } catch (error) {
      toast.error('Failed to save content');
    } finally {
      setIsSaving(false);
    }
  };

  const handleMediaSelect = (url: string, alt?: string) => {
    if (editor && url) {
      editor.chain().focus().setImage({ src: url, alt }).run();
      setShowMediaLibrary(false);
    }
  };

  const handleRevisionSelect = (revision: ContentRevision) => {
    if (editor) {
      editor.commands.setContent(revision.content);
      setShowRevisionHistory(false);
      toast.success('Revision restored');
    }
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      {!readOnly && (
        <div className="flex items-center justify-between">
          <EditorToolbar 
            editor={editor}
            onMediaClick={() => setShowMediaLibrary(true)}
          />
          <div className="flex items-center gap-2">
            <AutoSave
              lastSavedAt={lastSavedAt}
              onAutoSave={() => handleSave(true)}
              disabled={isSaving || readOnly}
            />
            <button
              className="btn btn-secondary"
              onClick={() => setShowRevisionHistory(true)}
            >
              History
            </button>
            <button
              className="btn btn-primary"
              onClick={() => handleSave()}
              disabled={isSaving || readOnly}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      )}

      <div className="prose max-w-none border rounded-lg p-4 min-h-[400px]">
        <EditorContent editor={editor} />
      </div>

      {post && !readOnly && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SeoSettings post={post} onSave={onSave} />
          <WorkflowStatus post={post} onSave={onSave} />
        </div>
      )}

      {showMediaLibrary && (
        <MediaLibrary
          onSelect={handleMediaSelect}
          onClose={() => setShowMediaLibrary(false)}
        />
      )}

      {showRevisionHistory && (
        <RevisionHistory
          revisions={revisions}
          onSelect={handleRevisionSelect}
          onClose={() => setShowRevisionHistory(false)}
        />
      )}
    </div>
  );
}
