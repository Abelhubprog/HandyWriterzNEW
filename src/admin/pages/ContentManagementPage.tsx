import React, { useState, useEffect } from 'react';
import ContentManager from '@/components/admin/ContentManager';

interface Post {
  id: string;
  title: string;
  status: string;
  author: string;
  lastModified: string;
}

const ContentManagementPage: React.FC = () => {
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'draft' | 'review' | 'published'>('all');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with actual API call to fetch posts
    const fetchPosts = async () => {
      try {
        const response = await fetch('/api/admin/posts');
        const data = await response.json();
        setPosts(data);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || post.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Content Management</h1>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => setSelectedPost(null)} // Clear selection to create new content
        >
          Create New Content
        </button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar with content list */}
        <div className="col-span-12 lg:col-span-4 xl:col-span-3">
          <div className="bg-white rounded-lg shadow">
            {/* Search and Filter */}
            <div className="p-4 border-b border-gray-200">
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="flex space-x-2">
                {['all', 'draft', 'review', 'published'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status as typeof filter)}
                    className={`px-3 py-1 rounded text-sm ${
                      filter === status
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Content List */}
            <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-gray-500">Loading...</div>
              ) : filteredPosts.length === 0 ? (
                <div className="p-4 text-center text-gray-500">No content found</div>
              ) : (
                filteredPosts.map((post) => (
                  <button
                    key={post.id}
                    onClick={() => setSelectedPost(post.id)}
                    className={`w-full text-left p-4 hover:bg-gray-50 focus:outline-none ${
                      selectedPost === post.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <h3 className="font-medium text-gray-900 truncate">{post.title}</h3>
                    <div className="mt-1 flex items-center text-sm text-gray-500">
                      <span
                        className={`inline-block w-2 h-2 rounded-full mr-2 ${
                          {
                            draft: 'bg-gray-400',
                            review: 'bg-yellow-400',
                            published: 'bg-green-400'
                          }[post.status] || 'bg-gray-400'
                        }`}
                      />
                      <span>{post.status}</span>
                      <span className="mx-2">•</span>
                      <span>{new Date(post.lastModified).toLocaleDateString()}</span>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">By {post.author}</p>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Main content area */}
        <div className="col-span-12 lg:col-span-8 xl:col-span-9">
          {selectedPost ? (
            <ContentManager postId={selectedPost} />
          ) : (
            <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
              Select a post to manage or create new content
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentManagementPage;
