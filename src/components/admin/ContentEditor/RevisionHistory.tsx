import React from 'react';
import { ContentRevision } from '@/types/admin';
import { Dialog } from '@/components/common/Dialog';
import { formatDistanceToNow, format } from 'date-fns';

interface RevisionHistoryProps {
  revisions: ContentRevision[];
  onSelect: (revision: ContentRevision) => void;
  onClose: () => void;
}

export function RevisionHistory({ revisions, onSelect, onClose }: RevisionHistoryProps) {
  return (
    <Dialog
      title="Revision History"
      onClose={onClose}
      size="lg"
    >
      <div className="divide-y">
        {revisions.map((revision) => (
          <div
            key={revision.id}
            className="py-4 hover:bg-gray-50 cursor-pointer"
            onClick={() => onSelect(revision)}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm font-medium">
                  Version {revision.version} by {revision.changedBy.name}
                </div>
                <div className="text-sm text-gray-500">
                  {formatDistanceToNow(new Date(revision.changedAt), { addSuffix: true })}
                  {' · '}
                  {format(new Date(revision.changedAt), 'MMM d, yyyy h:mm a')}
                </div>
                {revision.comment && (
                  <div className="mt-1 text-sm text-gray-600">
                    {revision.comment}
                  </div>
                )}
              </div>
              <button
                className="btn btn-sm btn-secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(revision);
                }}
              >
                Restore
              </button>
            </div>
            
            {/* Preview (optional) */}
            <div className="mt-2">
              <details className="text-sm">
                <summary className="text-primary cursor-pointer hover:underline">
                  Show Changes
                </summary>
                <div
                  className="mt-2 p-3 bg-gray-50 rounded-md prose-sm max-h-40 overflow-y-auto"
                  dangerouslySetInnerHTML={{ __html: revision.content }}
                />
              </details>
            </div>
          </div>
        ))}

        {revisions.length === 0 && (
          <div className="py-8 text-center text-gray-500">
            No revision history available
          </div>
        )}
      </div>
    </Dialog>
  );
}
