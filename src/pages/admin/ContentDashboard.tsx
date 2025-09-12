import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  ArrowUp, 
  ArrowDown,
  MessageSquare,
  Heart,
  Share2,
  AlertTriangle
} from 'lucide-react';
import { isAdmin } from '@/lib/auth';
import { 
  getAllPosts, 
  deletePost
} from '@/lib/admin';
import { d1Client as supabase } from '@/lib/d1Client';
import { SupabasePost } from '@/types/user';
import { runDeploymentChecks } from '@/utils/deploymentCheck';

interface ContentDashboardProps {
  serviceType?: string;
}

const ContentDashboard: React.FC<ContentDashboardProps> = ({ serviceType }) => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<SupabasePost[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<string>('published_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  const [deploymentStatus, setDeploymentStatus] = useState<{ 
    allPassed: boolean; 
    results: Record<string, { passed: boolean; message: string }>
  } | null>(null);
  const [adminChecked, setAdminChecked] = useState<boolean>(false);

  const postsPerPage = 10;
  
  // Check admin status on mount
  useEffect(() => {
    const checkAdminStatus = async () => {
      const adminStatus = await isAdmin();
      if (!adminStatus) {
        navigate('/login'); // Redirect non-admins
      }
      setAdminChecked(true);
    };
    
    checkAdminStatus();
  }, [navigate]);
  
  // Run deployment checks
  useEffect(() => {
    const checkDeployment = async () => {
      const result = await runDeploymentChecks();
      setDeploymentStatus(result);
    };
    
    if (adminChecked) {
      checkDeployment();
    }
  }, [adminChecked]);
  
  // Load posts
  useEffect(() => {
    if (!adminChecked) return;
    
    const loadPosts = async () => {
      setIsLoading(true);
      
      const { posts, totalCount, error } = await getAllPosts({
        page: currentPage,
        limit: postsPerPage,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        serviceType: serviceType,
        searchQuery: searchQuery || undefined
      });
      
      if (error) {
      } else {
        setPosts(posts);
        setTotalCount(totalCount);
      }
      
      setIsLoading(false);
    };
    
    loadPosts();
  }, {base: currentPage, statusFilter, serviceType, md: searchQuery, lg: adminChecked});
  
  // Handle search submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on new search
  };
  
  // Handle post deletion
  const handleDeletePost = async (postId: string) => {
    if (window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      setIsLoading(true);
      
      const { success, error } = await deletePost(postId);
      
      if (error) {
        alert(`Error deleting post: ${error.message}`);
      } else if (success) {
        // Remove the deleted post from the list
        setPosts(posts.filter(post => post.id !== postId));
        setTotalCount(prev => prev - 1);
      }
      
      setIsLoading(false);
    }
  };
  
  // Handle bulk selection
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedPosts(posts.map(post => post.id));
    } else {
      setSelectedPosts([]);
    }
  };
  
  const handleSelectPost = (postId: string) => {
    if (selectedPosts.includes(postId)) {
      setSelectedPosts(selectedPosts.filter(id => id !== postId));
    } else {
      setSelectedPosts([...selectedPosts, postId]);
    }
  };
  
  // Handle bulk actions
  const handleBulkAction = async (action: 'delete' | 'publish' | 'draft') => {
    if (selectedPosts.length === 0) return;
    
    if (action === 'delete' && !window.confirm(`Are you sure you want to delete ${selectedPosts.length} posts? This action cannot be undone.`)) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (action === 'delete') {
        // Delete posts one by one
        for (const postId of selectedPosts) {
          await deletePost(postId);
        }
        
        // Update the list
        setPosts(posts.filter(post => !selectedPosts.includes(post.id)));
        setTotalCount(prev => prev - selectedPosts.length);
      } else {
        // Update status for each selected post
        const status = action === 'publish' ? 'published' : 'draft';
        
        for (const postId of selectedPosts) {
          await supabase
            .from('posts')
            .update({ 
              status,
              published_at: status === 'published' ? new Date().toISOString() : null
            })
            .eq('id', postId);
        }
        
        // Refresh the list
        const { posts: updatedPosts } = await getAllPosts({
          page: currentPage,
          limit: postsPerPage,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          serviceType: serviceType,
          searchQuery: searchQuery || undefined
        });
        
        setPosts(updatedPosts);
      }
      
      // Clear selection
      setSelectedPosts([]);
    } catch (error) {
      alert('An error occurred while performing the bulk action.');
    }
    
    setIsLoading(false);
  };
  
  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not published';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  if (!adminChecked) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }
  
  return (
    <div className="px-4 py-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Content Management {serviceType && `- ${serviceType}`}
        </h1>
        
        <Link
          to="/admin/content/new"
          className="mt-4 md:mt-0 px-4 py-2 bg-red-600 text-white rounded-lg inline-flex items-center hover:bg-red-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create New Post
        </Link>
      </div>
      
      {/* Deployment Status Banner */}
      {deploymentStatus && !deploymentStatus.allPassed && (
        <div className="mb-6 p-4 border border-amber-200 bg-amber-50 rounded-lg">
          <div className="flex items-center gap-2 text-amber-800 font-medium mb-2">
            <AlertTriangle className="h-5 w-5" />
            <span>Deployment Configuration Issues</span>
          </div>
          <div className="space-y-2">
            {Object.entries(deploymentStatus.results)
              .filter(([_, result]) => !result.passed)
              .map(([key, result]) => (
                <div key={key} className="text-sm text-amber-700">
                  • {result.message}
                </div>
              ))}
          </div>
        </div>
      )}
      
      {/* Filters and Search */}
      <div className="mb-6 bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
              <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 px-2 py-1 bg-red-600 text-white text-xs rounded"
              >
                Search
              </button>
            </form>
          </div>
          
          <div className="flex gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-red-500 focus:border-red-500"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-red-500 focus:border-red-500"
              >
                <option value="published_at">Publish Date</option>
                <option value="created_at">Created Date</option>
                <option value="title">Title</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
              <button
                onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                className="inline-flex items-center justify-center w-full px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                {sortDirection === 'asc' ? (
                  <><ArrowUp className="h-4 w-4 mr-2" /> Ascending</>
                ) : (
                  <><ArrowDown className="h-4 w-4 mr-2" /> Descending</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bulk Actions */}
      {selectedPosts.length > 0 && (
        <div className="mb-4 p-2 bg-gray-100 rounded-lg flex items-center gap-4">
          <span className="text-sm font-medium">{selectedPosts.length} selected</span>
          <div className="flex gap-2">
            <button
              onClick={() => handleBulkAction('publish')}
              className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
            >
              Publish
            </button>
            <button
              onClick={() => handleBulkAction('draft')}
              className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
            >
              Draft
            </button>
            <button
              onClick={() => handleBulkAction('delete')}
              className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      )}
      
      {/* Content Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedPosts.length === posts.length && posts.length > 0}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Author
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Published
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Engagement
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <div className="inline-flex items-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-red-600 mr-3"></div>
                      <span>Loading posts...</span>
                    </div>
                  </td>
                </tr>
              ) : posts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <p className="text-gray-500">No posts found.</p>
                    <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filters.</p>
                  </td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedPosts.includes(post.id)}
                        onChange={() => handleSelectPost(post.id)}
                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {post.cover_image && (
                          <div className="flex-shrink-0 h-10 w-10 mr-3">
                            <img 
                              className="h-10 w-10 rounded object-cover" 
                              src={post.cover_image} 
                              alt="" 
                            />
                          </div>
                        )}
                        <div className="truncate max-w-xs">
                          {post.title}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                          {post.author?.avatar_url ? (
                            <img
                              src={post.author.avatar_url}
                              alt=""
                              className="h-8 w-8 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-xs font-medium text-gray-500">
                              {post.author?.name?.charAt(0) || 'U'}
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-gray-900">{post.author?.name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span 
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          post.status === 'published' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {post.status === 'published' ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(post.published_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center text-gray-500">
                          <Heart className="h-4 w-4 mr-1" />
                          <span className="text-xs">{post.likes_count || 0}</span>
                        </div>
                        <div className="flex items-center text-gray-500">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          <span className="text-xs">{post.comments_count || 0}</span>
                        </div>
                        <div className="flex items-center text-gray-500">
                          <Share2 className="h-4 w-4 mr-1" />
                          <span className="text-xs">{post.views || 0}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link
                          to={`/services/${serviceType}/${post.slug}`}
                          className="text-gray-500 hover:text-gray-700"
                          title="View"
                        >
                          <Eye className="h-5 w-5" />
                        </Link>
                        <Link
                          to={`/admin/content/edit/${post.id}`}
                          className="text-blue-500 hover:text-blue-700"
                          title="Edit"
                        >
                          <Edit2 className="h-5 w-5" />
                        </Link>
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="text-red-500 hover:text-red-700"
                          title="Delete"
                        >
                          <Table.Rowash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {!isLoading && totalCount > 0 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{(currentPage - 1) * postsPerPage + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(currentPage * postsPerPage, totalCount)}
              </span>{' '}
              of <span className="font-medium">{totalCount}</span> posts
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => prev - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded border ${
                  currentPage === 1
                    ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={currentPage * postsPerPage >= totalCount}
                className={`px-3 py-1 rounded border ${
                  currentPage * postsPerPage >= totalCount
                    ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentDashboard;
