import React, { useState } from 'react';
import ContentWorkflow from './ContentWorkflow';
import ContentAnalytics from './ContentAnalytics';

export interface ContentManagerProps {
  postId: string;
}

export const ContentManager: React.FC<ContentManagerProps> = ({ postId }) => {
  const [activeTab, setActiveTab] = useState<'workflow' | 'analytics'>('workflow');

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('workflow')}
            className={`
              py-4 px-1 border-b-2 font-medium text-sm
              ${
                activeTab === 'workflow'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            Workflow & Review
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`
              py-4 px-1 border-b-2 font-medium text-sm
              ${
                activeTab === 'analytics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            Analytics & History
          </button>
        </nav>
      </div>

      {/* Content Area */}
      <div className="min-h-[600px]">
        {activeTab === 'workflow' ? (
          <ContentWorkflow postId={postId} />
        ) : (
          <ContentAnalytics postId={postId} />
        )}
      </div>
    </div>
  );
};

export default ContentManager;
