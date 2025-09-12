
import React, { useState, useEffect } from 'react';
import { contentVersionService } from '@/services/contentVersionService';
import type { WorkflowStage, ReviewComment } from '@/services/contentVersionService';

interface ContentWorkflowProps {
  postId: string;
}

export const ContentWorkflow: React.FC<ContentWorkflowProps> = ({ postId }) => {
  const [workflow, setWorkflow] = useState<WorkflowStage | null>(null);
  const [comments, setComments] = useState<ReviewComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [commentType, setCommentType] = useState<'general' | 'edit' | 'suggestion' | 'approval'>('general');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadWorkflowData();
  }, [postId]);

  const loadWorkflowData = async () => {
    try {
      setLoading(true);
      const workflowData = await contentVersionService.getWorkflow(postId);
      const commentsData = await contentVersionService.getReviewComments(workflowData.id);
      setWorkflow(workflowData);
      setComments(commentsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load workflow data');
    } finally {
      setLoading(false);
    }
  };

  const handleStageChange = async (newStage: WorkflowStage['stage']) => {
    if (!workflow) return;

    try {
      await contentVersionService.updateWorkflow(workflow.id, {
        ...workflow,
        stage: newStage
      });
      await loadWorkflowData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update workflow stage');
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workflow || !newComment.trim()) return;

    try {
      await contentVersionService.addReviewComment({
        workflowId: workflow.id,
        reviewerId: 'current-user-id', // This should come from auth context
        content: newComment,
        type: commentType,
        status: 'open',
        resolvedBy: null,
        resolvedAt: null
      });
      setNewComment('');
      await loadWorkflowData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add comment');
    }
  };

  const handleResolveComment = async (commentId: string) => {
    try {
      await contentVersionService.updateReviewComment(commentId, {
        status: 'resolved',
        resolvedBy: 'current-user-id', // This should come from auth context
        resolvedAt: new Date().toISOString()
      });
      await loadWorkflowData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resolve comment');
    }
  };

  if (loading) {
    return <div className="p-4">Loading workflow data...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  if (!workflow) {
    return <div className="p-4">No workflow found for this content</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Workflow Stage */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Content Stage</h2>
        <div className="flex space-x-4">
          {['draft', 'review', 'revision', 'approved', 'published', 'archived'].map((stage) => (
            <button
              key={stage}
              onClick={() => handleStageChange(stage as WorkflowStage['stage'])}
              className={`px-4 py-2 rounded ${
                workflow.stage === stage
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {stage.charAt(0).toUpperCase() + stage.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Review Comments */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Review Comments</h2>
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className={`p-4 rounded border ${
                comment.status === 'resolved' ? 'bg-gray-50' : 'bg-white'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="inline-block px-2 py-1 text-sm rounded mr-2" style={{
                    backgroundColor: {
                      general: '#E5E7EB',
                      edit: '#FDE68A',
                      suggestion: '#A7F3D0',
                      approval: '#93C5FD'
                    }[comment.type]
                  }}>
                    {comment.type}
                  </span>
                  <span className="text-gray-600 text-sm">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {comment.status === 'open' && (
                  <button
                    onClick={() => handleResolveComment(comment.id)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Resolve
                  </button>
                )}
              </div>
              <p className="mt-2 text-gray-700">{comment.content}</p>
              {comment.status === 'resolved' && (
                <p className="mt-2 text-sm text-gray-500">
                  Resolved by {comment.resolvedBy} on{' '}
                  {new Date(comment.resolvedAt!).toLocaleDateString()}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* New Comment Form */}
        <form onSubmit={handleCommentSubmit} className="mt-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comment Type
            </label>
            <select
              id="comment-type"
              name="comment-type"
              aria-label="Comment Type"
              value={commentType}
              onChange={(e) => setCommentType(e.target.value as typeof commentType)}
              className="w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="general">General</option>
              <option value="edit">Edit Request</option>
              <option value="suggestion">Suggestion</option>
              <option value="approval">Approval</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comment
            </label>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={4}
              className="w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Add your review comment..."
            />
          </div>
          <button
            type="submit"
            disabled={!newComment.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            Add Comment
          </button>
        </form>
      </div>

      {/* Assignment and Due Date */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Assignment Details</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Assigned To</p>
            <p>{workflow.assignedTo || 'Unassigned'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Due Date</p>
            <p>
              {workflow.dueDate
                ? new Date(workflow.dueDate).toLocaleDateString()
                : 'No due date set'}
            </p>
          </div>
        </div>
      </div>

      {/* Notes */}
      {workflow.notes && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Notes</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{workflow.notes}</p>
        </div>
      )}
    </div>
  );
};

export default ContentWorkflow;
