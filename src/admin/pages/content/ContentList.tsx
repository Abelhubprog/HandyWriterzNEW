import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { contentManagementService } from '@/services/contentManagementService';
import {
  Search,
  Filter,
  Grid,
  List,
  Calendar,
  Clock,
  ChevronDown,
  ArrowRight,
  X,
  Trash2,
  Edit,
  Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    role: string;
  };
  category: string;
  tags: string[];
  publishedAt: string;
  readTime: number;
  featuredImage: string;
  likes: number;
  comments: number;
  userHasLiked: boolean;
  views: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  count: number;
}

const ContentList: React.FC = () => {
  const { service } = useParams<{ service: string }>();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentView, setCurrentView] = useState<'grid' | 'list'>('list');
  const [showCategories, setShowCategories] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);

  // Fetch posts using the service
  const { data: posts = [], isLoading: isInitialLoading, error: postsError, refetch: refetchPosts } = useQuery({
    queryKey: ['posts', service, activeCategory, searchQuery, page],
    queryFn: () => contentManagementService.getPostsByService(service || '', 10, (page - 1) * 10, activeCategory),
    staleTime: 5 * 60 * 1000, // 5 minutes
    keepPreviousData: true
  });

  // Fetch categories
  const { data: categories = [], isLoading: categoriesLoading, error: categoriesError } = useQuery({
    queryKey: ['categories', service],
    queryFn: () => contentManagementService.getCategories(service || ''),
    staleTime: 5 * 60 * 1000
  });

  // Fetch popular tags
  const { data: popularTags = [], isLoading: tagsLoading, error: tagsError } = useQuery({
    queryKey: ['tags', service],
    queryFn: () => contentManagementService.getPopularTags(service || ''),
    staleTime: 5 * 60 * 1000
  });

  // Filter posts client-side for search (service already handles category)
  const filteredPosts = React.useMemo(() => {
    return posts.filter(post => {
      const matchesSearch = !searchQuery ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesSearch;
    });
  }, [posts, searchQuery]);

  // Load more posts
  const loadMorePosts = async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);

    try {
      // In production, this would be handled server-side with pagination
      // For demo, simulate loading more
      await new Promise(resolve => setTimeout(resolve, 800));

      const nextPage = page + 1;
      const additionalPosts = await contentManagementService.getPostsByService(
        service || '',
        10,
        (nextPage - 1) * 10,
        activeCategory
      );

      // Append to existing posts
      setPosts(prevPosts => [...prevPosts, ...additionalPosts]);
      setPage(nextPage);

      // Simulate end of data after a few pages
      if (nextPage >= 5) {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading more posts:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !isLoadingMore && hasMore) {
          loadMorePosts();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    const infiniteScrollElement = document.querySelector('#infinite-scroll-trigger');
    if (infiniteScrollElement) {
      observer.observe(infiniteScrollElement);
    }

    return () => {
      if (infiniteScrollElement) {
        observer.unobserve(infiniteScrollElement);
      }
    };
  }, [isLoadingMore, hasMore, page, service, activeCategory, searchQuery]);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    refetchPosts(); // Refetch with new search query
    setIsSearchOpen(false);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Delete post handler
  const handleDelete = async (postId: string) => {
    if (confirm('Are you sure you want to delete this post?')) {
      try {
        await contentManagementService.deletePost(postId);
        // Refetch posts after deletion
        refetchPosts();
        toast.success('Post deleted successfully');
      } catch (error) {
        console.error('Error deleting post:', error);
        toast.error('Failed to delete post');
      }
    }
  };

  if (postsError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">Error loading content</div>
          <button onClick={() => refetchPosts()} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (isInitialLoading || categoriesLoading || tagsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/admin" className="mr-6">
                <div className="h-8 w-8 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center text-white font-bold">
                  H
                </div>
              </Link>

              <nav className="hidden md:flex space-x-6">
                <Link to="/admin" className="text-gray-600 hover:text-gray-900 font-medium">Dashboard</Link>
                <Link to="/admin/content" className="text-gray-600 hover:text-gray-900 font-medium">Content</Link>
                <Link to="/admin/content/posts" className="text-red-600 font-medium">Posts</Link>
                <Link to="/admin/users" className="text-gray-600 hover:text-gray-900 font-medium">Users</Link>
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Search className="h-5 w-5" />
              </button>

              <div className="relative">
                <button
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Bell className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {/* Filters and Controls */}
        <div className="mb-8 flex flex-wrap justify-between gap-4 p-6 bg-white border-b border-gray-200">
          <div className="relative">
            <button
              onClick={() => setShowCategories(!showCategories)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:border-gray-300 transition-colors"
            >
              <Filter className="h-4 w-4" />
              Category: {activeCategory === 'all' ? 'All' : categories.find(c => c.id === activeCategory)?.name || 'All'}
              <ChevronDown className="h-4 w-4" />
            </button>

            {/* Dropdown for Categories */}
            {showCategories && (
              <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <div className="p-2">
                  <button
                    onClick={() => {
                      setActiveCategory('all');
                      setShowCategories(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-md ${activeCategory === 'all' ? 'bg-red-50 text-red-600' : 'hover:bg-gray-50'}`}
                  >
                    All Categories
                  </button>
                  {categories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => {
                        setActiveCategory(category.id);
                        setShowCategories(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-md flex justify-between items-center ${activeCategory === category.id ? 'bg-red-50 text-red-600' : 'hover:bg-gray-50'}`}
                    >
                      <span>{category.name}</span>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">{category.count}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <div className="relative flex-grow w-60">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search posts..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
              <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>

            <div className="flex">
              <button
                onClick={() => setCurrentView('grid')}
                className={`p-2 rounded-l-lg border border-gray-200 ${
                  currentView === 'grid' ? 'bg-red-50 text-red-600' : 'text-gray-500'
                }`}
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setCurrentView('list')}
                className={`p-2 rounded-r-lg border-t border-r border-b border-gray-200 ${
                  currentView === 'list' ? 'bg-red-50 text-red-600' : 'text-gray-500'
                }`}
              >
                <List size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Posts Grid/List */}
        {isInitialLoading ? (
          // Loading Skeleton
          <div className={currentView === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-6 p-6' : 'space-y-6 p-6'}>
            {Array(6).fill(null).map((_, index) => (
              currentView === 'grid' ? (
                <div key={index} className="bg-white border border-gray-100 rounded-xl overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-4">
                    <div className="h-4 bg-gray-200 rounded mb-2 w-1/4"></div>
                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
                    <div className="h-10 bg-gray-200 rounded-lg"></div>
                  </div>
                </div>
              ) : (
                <div key={index} className="bg-white border border-gray-100 rounded-xl overflow-hidden flex animate-pulse">
                  <div className="w-1/3 h-48 bg-gray-200"></div>
                  <div className="w-2/3 p-4">
                    <div className="h-4 bg-gray-200 rounded mb-2 w-1/4"></div>
                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
                    <div className="h-16 bg-gray-200 rounded-lg"></div>
                  </div>
                </div>
              )
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          // No results
          <div className="bg-white rounded-xl p-8 text-center border border-gray-100">
            <div className="h-20 w-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Search className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No posts found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your search or filter criteria</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('all');
                refetchPosts();
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Reset filters
            </button>
          </div>
        ) : currentView === 'grid' ? (
          // Grid View
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            {filteredPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-all duration-300 group cursor-pointer"
                onClick={() => {
                  // Navigate to post detail
                  window.location.href = `/admin/content/${service}/${post.id}`;
                }}
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={post.featuredImage}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-3 py-1 text-xs font-medium bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full">
                      {post.category}
                    </span>
                  </div>
                  <h3 className="font-bold text-xl mb-3 group-hover:text-red-600 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">{post.excerpt}</p>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <img
                        src={post.author.avatar}
                        alt={post.author.name}
                        className="h-8 w-8 rounded-full object-cover border border-gray-200"
                      />
                      <span className="text-sm font-medium">{post.author.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center text-gray-500 text-sm">
                        <Eye className="h-4 w-4 mr-1" />
                        <span>{post.views}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle like - update via service
                          // For now, local update or call service.updatePost
                        }}
                        className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-600"
                      >
                        <Heart className="h-4 w-4" fill={post.userHasLiked ? 'currentColor' : 'none'} />
                        <span>{post.likes}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          // List View
          <div className="space-y-6 p-6">
            {filteredPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-white border border-gray-100 rounded-xl overflow-hidden flex flex-col md:flex-row hover:shadow-md transition-all duration-300 group cursor-pointer"
                onClick={() => {
                  // Navigate to post detail
                  window.location.href = `/admin/content/${service}/${post.id}`;
                }}
              >
                <div className="md:w-1/3 relative">
                  <div className="relative aspect-video md:aspect-auto md:h-full overflow-hidden">
                    <img
                      src={post.featuredImage}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </div>
                <div className="md:w-2/3 p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-3 py-1 text-xs font-medium bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full">
                      {post.category}
                    </span>
                    <div className="flex items-center text-gray-500 text-sm">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(post.publishedAt)}
                    </div>
                  </div>
                  <h3 className="font-bold text-xl mb-3 group-hover:text-red-600 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{post.excerpt}</p>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <img
                        src={post.author.avatar}
                        alt={post.author.name}
                        className="h-8 w-8 rounded-full object-cover border border-gray-200"
                      />
                      <div>
                        <div className="text-sm font-medium">{post.author.name}</div>
                        <div className="text-xs text-gray-500">{post.author.role}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center text-gray-500 text-sm">
                        <Eye className="h-4 w-4 mr-1" />
                        <span>{post.views}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle like
                        }}
                        className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-600"
                      >
                        <Heart className="h-4 w-4" fill={post.userHasLiked ? 'currentColor' : 'none'} />
                        <span>{post.likes}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Infinite Scroll Trigger */}
        <div id="infinite-scroll-trigger" className="h-10 flex justify-center mt-8">
          {isLoadingMore && (
            <div className="flex items-center">
              <svg className="animate-spin h-5 w-5 text-red-600 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-gray-600">Loading more posts...</span>
            </div>
          )}
        </div>
      </main>

      {/* Search Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-xl shadow-xl max-w-3xl w-full p-6 relative"
          >
            <button
              onClick={() => setIsSearchOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>

            <h2 className="text-2xl font-bold mb-6">Search Content</h2>

            <form onSubmit={handleSearch} className="mb-8">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Type keywords to search..."
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-lg"
                  autoFocus
                />
                <Search className="h-6 w-6 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
              </div>

              <div className="flex justify-end mt-4">
                <button
                  type="submit"
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Search
                </button>
              </div>
            </form>

            <div>
              <h3 className="text-lg font-medium mb-3">Popular Searches</h3>
              <div className="flex flex-wrap gap-2">
                {popularTags.slice(0, 8).map(tag => (
                  <button
                    key={tag}
                    onClick={() => {
                      setSearchQuery(tag);
                      setIsSearchOpen(false);
                    }}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="h-8 w-8 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center text-white font-bold">
                  H
                </div>
                <span className="text-xl font-bold">HandyWriterz</span>
              </div>
              <p className="text-gray-600 mb-6">
                Supporting healthcare professionals with expert resources and specialized content.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-red-600 transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10zm-11 9.75c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-red-600 transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-red-600 transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path>
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-600 hover:text-red-600 transition-colors">Home</a></li>
                <li><a href="#" className="text-gray-600 hover:text-red-600 transition-colors">About Us</a></li>
                <li><a href="#" className="text-gray-600 hover:text-red-600 transition-colors">Services</a></li>
                <li><a href="#" className="text-gray-600 hover:text-red-600 transition-colors">Contact</a></li>
                <li><a href="#" className="text-gray-600 hover:text-red-600 transition-colors">Blog</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-600 hover:text-red-600 transition-colors">Crypto Glossary</a></li>
                <li><a href="#" className="text-gray-600 hover:text-red-600 transition-colors">Market Analysis</a></li>
                <li><a href="#" className="text-gray-600 hover:text-red-600 transition-colors">Trading Strategies</a></li>
                <li><a href="#" className="text-gray-600 hover:text-red-600 transition-colors">Security Tips</a></li>
                <li><a href="#" className="text-gray-600 hover:text-red-600 transition-colors">Blockchain 101</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Subscribe</h3>
              <p className="text-gray-600 mb-4">Stay updated with the latest cryptocurrency news and analysis.</p>              <form className="space-y-2">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  className="w-full py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-lg text-white font-medium transition-colors"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>

          <div className="border-t border-gray-200 mt-12 pt-6 text-center">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} HandyWriterz. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ContentList;
