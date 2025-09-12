
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useUser } from '@clerk/clerk-react';
import { contentManagementService } from '@/services/contentManagementService';
import {
  Heart,
  MessageSquare,
  Share2,
  Bookmark,
  Search,
  Filter,
  Grid,
  List,
  Calendar,
  Clock,
  ChevronDown,
  ArrowRight,
  X,
  ThumbsUp,
  Send,
  User,
  BookOpen,
  Tag,
  Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

interface AuthorProfile {
  id: string;
  name: string;
  avatar: string;
  role: string;
}

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: AuthorProfile;
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

interface Comment {
  id: string;
  postId: string;
  author: AuthorProfile;
  content: string;
  createdAt: string;
  likes: number;
  userHasLiked: boolean;
}

const CryptocurrencyAnalysis: React.FC = () => {
  const { serviceType = 'crypto' } = useParams<{ serviceType: string }>();
  const { user } = useUser();
  const [posts, setPosts] = useState<Post[]>([]);
  const [featuredPosts, setFeaturedPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [popularTags, setPopularTags] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentView, setCurrentView] = useState<'grid' | 'list'>('grid');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [showCategories, setShowCategories] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);
  const [isCommentLoading, setIsCommentLoading] = useState<boolean>(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState<boolean>(false);

  // Fetch posts
  const { data: allPosts = [], isLoading: isPostsLoading, error: postsError, refetch: refetchPosts } = useQuery({
    queryKey: ['posts', serviceType, activeCategory, searchQuery, page],
    queryFn: () => contentManagementService.getPostsByService(serviceType, 10, (page - 1) * 10, activeCategory),
    staleTime: 5 * 60 * 1000,
    keepPreviousData: true
  });

  // Fetch featured posts
  const { data: fetchedFeaturedPosts = [], isLoading: isFeaturedLoading, error: featuredError } = useQuery({
    queryKey: ['featuredPosts', serviceType],
    queryFn: () => contentManagementService.getFeaturedPosts(serviceType, 3),
    staleTime: 5 * 60 * 1000
  });

  // Fetch categories
  const { data: fetchedCategories = [], isLoading: isCategoriesLoading, error: categoriesError } = useQuery({
    queryKey: ['categories', serviceType],
    queryFn: () => contentManagementService.getCategories(serviceType),
    staleTime: 5 * 60 * 1000
  });

  // Fetch popular tags
  const { data: fetchedPopularTags = [], isLoading: isTagsLoading, error: tagsError } = useQuery({
    queryKey: ['popularTags', serviceType],
    queryFn: () => contentManagementService.getPopularTags(serviceType),
    staleTime: 5 * 60 * 1000
  });

  // Filter posts for search (server-side already handles category)
  const filteredPosts = React.useMemo(() => {
    return allPosts.filter(post => {
      const matchesSearch = !searchQuery ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesSearch;
    });
  }, [allPosts, searchQuery]);

  // Load more posts
  const loadMorePosts = async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);

    try {
      const nextPage = page + 1;
      const additionalPosts = await contentManagementService.getPostsByService(
        serviceType,
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
      toast.error('Failed to load more posts');
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !isLoadingMore && hasMore && filteredPosts.length > 0) {
          loadMorePosts();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    const infiniteScrollElement = document.getElementById('infinite-scroll-trigger');
    if (infiniteScrollElement) {
      observer.observe(infiniteScrollElement);
    }

    return () => {
      if (infiniteScrollElement) {
        observer.unobserve(infiniteScrollElement);
      }
    };
  }, [isLoadingMore, hasMore, page, serviceType, activeCategory, searchQuery, filteredPosts.length]);

  // Handle post selection
  const handlePostSelect = async (post: Post) => {
    setSelectedPost(post);

    try {
      const postComments = await contentManagementService.getCommentsByPost(post.id);
      setComments(postComments);
      setRelatedPosts([]); // Clear related posts or fetch if needed

      // Scroll to comments section
      const commentsSection = document.getElementById('comments-section');
      if (commentsSection) {
        commentsSection.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (error) {
      console.error('Error fetching post details:', error);
      toast.error('Failed to load post details');
    }
  };

  // Handle search submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    refetchPosts(); // Refetch with new search query
    setIsSearchOpen(false);
  };

  // Handle like post
  const handleLikePost = async (postId: string, currentLikes: number, currentUserHasLiked: boolean) => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }

    try {
      const newLikes = currentUserHasLiked ? currentLikes - 1 : currentLikes + 1;
      const newUserHasLiked = !currentUserHasLiked;

      // Update local state immediately (optimistic update)
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId
            ? { ...post, likes: newLikes, userHasLiked: newUserHasLiked }
            : post
        )
      );

      if (selectedPost && selectedPost.id === postId) {
        setSelectedPost(prev => ({ ...prev!, likes: newLikes, userHasLiked: newUserHasLiked }));
      }

      // Update in database
      await contentManagementService.updatePost(postId, { likes: newLikes });
      toast.success(currentUserHasLiked ? 'Unliked' : 'Liked');
    } catch (error) {
      console.error('Error liking post:', error);
      toast.error('Failed to update like');
      // Rollback local state if needed
    }
  };

  // Handle submit comment
  const handleSubmitComment = async () => {
    if (!selectedPost || !newComment.trim() || !user) {
      setShowLoginPrompt(true);
      return;
    }

    setIsCommentLoading(true);

    try {
      const newCommentObj = await contentManagementService.createComment(
        selectedPost.id,
        newComment,
        user.id
      );

      setComments(prev => [newCommentObj, ...prev]);
      setNewComment('');

      // Update post comments count
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === selectedPost.id
            ? { ...post, comments: post.comments + 1 }
            : post
        )
      );

      if (selectedPost) {
        setSelectedPost(prev => ({ ...prev!, comments: prev!.comments + 1 }));
      }

      toast.success('Comment added successfully');
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setIsCommentLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (postsError || featuredError || categoriesError || tagsError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">Error loading content</div>
          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (isPostsLoading || isFeaturedLoading || isCategoriesLoading || isTagsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* SEO Optimization */}
      <Helmet>
        <title>Cryptocurrency Analysis & Market Insights | HandyWriterz</title>
        <meta 
          name="description" 
          content="Explore our comprehensive cryptocurrency analysis, expert insights, and market trends to enhance your understanding and decision-making in the crypto space." 
        />
        <meta name="keywords" content="cryptocurrency analysis, blockchain technology, bitcoin, ethereum, defi, nft markets, crypto trading strategies, market insights" />
        <link rel="canonical" href="https://handywriterz.com/services/cryptocurrency-analysis" />
      </Helmet>
      
      {/* Fixed Header for navigation */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="mr-6">
                <div className="h-8 w-8 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center text-white font-bold">
                  H
                </div>
              </Link>
              
              <nav className="hidden md:flex space-x-6">
                <Link to="/" className="text-gray-600 hover:text-gray-900 font-medium">Home</Link>
                <Link to="/services" className="text-gray-600 hover:text-gray-900 font-medium">Services</Link>
                <Link to="/services/cryptocurrency-analysis" className="text-red-600 font-medium">Crypto Analysis</Link>
                <Link to="/contact" className="text-gray-600 hover:text-gray-900 font-medium">Contact</Link>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </button>
              
              {user ? (
                <div className="flex items-center">
                  <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
                    <Bell className="h-5 w-5" />
                  </button>
                  <img
                    className="h-8 w-8 rounded-full ml-2 border border-gray-200"
                    src={user.imageUrl || `https://ui-avatars.com/api/?name=${user.fullName || 'User'}&background=2563eb&color=fff`}
                    alt={user.fullName || 'User'}
                  />
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setShowLoginPrompt(true)}
                  className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {/* Header Banner */}
        <section className="relative py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-red-600/90 to-red-700/90"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Cryptocurrency Analysis</h1>
              <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
                Explore our comprehensive cryptocurrency analysis, blockchain insights, and market trends to enhance your understanding and decision-making in the crypto space.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <button 
                  onClick={() => setIsSearchOpen(true)}
                  className="px-5 py-2.5 bg-white/20 backdrop-blur-sm text-white rounded-lg font-medium hover:bg-white/30 transition-colors"
                >
                  <Search className="h-4 w-4 mr-2 inline" />
                  Search
                </button>
                <button 
                  onClick={() => setShowCategories(!showCategories)}
                  className="px-5 py-2.5 bg-white/20 backdrop-blur-sm text-white rounded-lg font-medium hover:bg-white/30 transition-colors"
                >
                  Browse Categories
                </button>
              </div>
            </div>
          </div>
        </section>
        
        {selectedPost ? (
          // Single Post View
          <section className="py-12">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                {/* Breadcrumb */}
                <div className="mb-6 flex items-center text-sm text-gray-500">
                  <button onClick={() => setSelectedPost(null)} className="hover:text-gray-700 transition-colors flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>Back to all articles</span>
                  </button>
                  <span className="mx-2">•</span>
                  <span className="text-gray-600">{selectedPost.category}</span>
                </div>
                
                {/* Post Header */}
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 text-xs font-medium bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full">
                      {selectedPost.category}
                    </span>
                    <div className="flex items-center text-gray-500 text-sm">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(selectedPost.publishedAt)}
                    </div>
                  </div>
                  
                  <h1 className="text-3xl md:text-4xl font-bold mb-6">
                    {selectedPost.title}
                  </h1>
                  
                  <div className="flex items-center gap-4 mb-6">
                    <img 
                      src={selectedPost.author.avatar} 
                      alt={selectedPost.author.name} 
                      className="h-12 w-12 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-medium">{selectedPost.author.name}</div>
                      <div className="text-sm text-gray-500">{selectedPost.author.role}</div>
                    </div>
                  </div>
                </div>
                
                {/* Featured Image */}
                <div className="mb-10 rounded-xl overflow-hidden shadow-lg">
                  <img 
                    src={selectedPost.featuredImage} 
                    alt={selectedPost.title} 
                    className="w-full h-96 object-cover"
                  />
                </div>
                
                {/* Post Content */}
                <div className="prose prose-lg max-w-none mb-10" dangerouslySetInnerHTML={{ __html: selectedPost.content }}></div>
                
                {/* Engagement */}
                <div className="flex justify-between items-center border-t border-gray-200 pt-6 mb-10">
                  <div className="flex items-center gap-6">
                    <button 
                      onClick={() => handleLikePost(selectedPost.id, selectedPost.likes, selectedPost.userHasLiked)}
                      className={`flex items-center gap-2 transition-all duration-200 ${
                        selectedPost.userHasLiked ? 'text-red-600' : 'text-gray-500 hover:text-red-600'
                      }`}
                    >
                      <Heart className={`h-5 w-5 ${selectedPost.userHasLiked ? 'fill-current' : ''}`} />
                      <span>{selectedPost.likes}</span>
                    </button>
                    <button 
                      onClick={() => {
                        if (!user) {
                          setShowLoginPrompt(true);
                          return;
                        }
                        navigator.clipboard.writeText(window.location.href);
                        toast.success('Link copied to clipboard');
                      }}
                      className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      <Share2 className="h-5 w-5" />
                      <span>Share</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Eye className="h-4 w-4 mr-1" />
                      <span>{selectedPost.views}</span>
                    </div>
                    <div className="flex items-center">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      <span>{selectedPost.comments}</span>
                    </div>
                  </div>
                </div>
                
                {/* Related Posts */}
                <div id="related-posts">
                  <h2 className="text-2xl font-bold mb-6">Related Posts</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {relatedPosts.slice(0, 3).map((post, index) => (
                      <motion.div
                        key={post.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
                        onClick={() => handlePostSelect(post)}
                      >
                        <div className="h-48 overflow-hidden">
                          <img 
                            src={post.featuredImage} 
                            alt={post.title} 
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="px-2 py-1 text-xs font-medium bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full">
                              {post.category}
                            </span>
                          </div>
                          <h3 className="font-semibold mb-2 line-clamp-2 hover:text-red-600 transition-colors">
                            {post.title}
                          </h3>
                          <p className="text-gray-600 text-sm line-clamp-2 mb-4">{post.excerpt}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Clock className="h-3 w-3 mr-1" />
                              <span>{post.readTime} min read</span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLikePost(post.id, post.likes, post.userHasLiked);
                              }}
                              className={`flex items-center gap-1 text-sm transition-all duration-200 ${
                                post.userHasLiked ? 'text-red-600' : 'text-gray-500 hover:text-red-600'
                              }`}
                            >
                              <Heart className={`h-4 w-4 ${post.userHasLiked ? 'fill-current' : ''}`} />
                              <span>{post.likes}</span>
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Comments Section */}
                <div id="comments-section" className="mt-12">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">Comments ({comments.length})</h2>
                    <button
                      onClick={() => setShowLoginPrompt(true)}
                      disabled={user}
                      className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${
                        user ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      <Send size={16} />
                      <span>{user ? 'Add Comment' : 'Log in to comment'}</span>
                    </button>
                  </div>
                  
                  {showLoginPrompt && !user && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6"
                    >
                      <div className="flex items-center gap-3">
                        <AlertCircle className="h-5 w-5 text-yellow-600" />
                        <div>
                          <p className="font-medium text-yellow-800">Please log in to comment</p>
                          <Link to="/login" className="text-yellow-600 hover:underline">
                            Sign in
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Comment Form */}
                  {user && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="bg-white border border-gray-200 rounded-lg p-4 mb-6"
                    >
                      <div className="flex gap-3">
                        <img
                          src={user.imageUrl || `https://ui-avatars.com/api/?name=${user.fullName}&background=2563eb&color=fff`}
                          alt={user.fullName}
                          className="h-10 w-10 rounded-full flex-shrink-0"
                        />
                        <div className="flex-1">
                          <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Write a comment..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none h-20"
                            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSubmitComment()}
                          />
                        </div>
                      </div>
                      <div className="flex justify-end mt-3">
                        <button
                          onClick={handleSubmitComment}
                          disabled={!newComment.trim() || isCommentLoading}
                          className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${
                            !newComment.trim() || isCommentLoading ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-red-600 text-white hover:bg-red-700'
                          }`}
                        >
                          <Send size={16} />
                          <span>{isCommentLoading ? 'Posting...' : 'Post Comment'}</span>
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* Comments List */}
                  <div className="space-y-4">
                    {comments.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <p>No comments yet. Be the first to comment!</p>
                      </div>
                    ) : (
                      comments.map((comment, index) => (
                        <motion.div
                          key={comment.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className="bg-white border border-gray-200 rounded-lg p-4"
                        >
                          <div className="flex items-start gap-3">
                            <img
                              src={comment.author.avatar}
                              alt={comment.author.name}
                              className="h-10 w-10 rounded-full flex-shrink-0 mt-1"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <div className="font-medium text-gray-900">{comment.author.name}</div>
                                <div className="text-xs text-gray-500">{formatDate(comment.createdAt)}</div>
                              </div>
                              <p className="text-gray-700 mb-2">{comment.content}</p>
                              <div className="flex items-center gap-4">
                                <button
                                  onClick={() => handleLikeComment(comment.id, comment.likes, comment.userHasLiked)}
                                  className={`flex items-center gap-1 text-sm transition-colors ${
                                    comment.userHasLiked ? 'text-red-600' : 'text-gray-500 hover:text-red-600'
                                  }`}
                                >
                                  <Heart className={`h-4 w-4 ${comment.userHasLiked ? 'fill-current' : ''}`} />
                                  <span>{comment.likes}</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </section>
        ) : (
          // Posts Listing View
          <>
            {/* Featured Articles Section */}
            <section id="featured-content" className="py-16 bg-white">
              <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold mb-10 text-center">Featured Articles</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {featuredPosts.length > 0 && (
                    <div className="lg:col-span-7 xl:col-span-8">
                      <div 
                        className="relative rounded-xl overflow-hidden h-96 cursor-pointer group"
                        onClick={() => handlePostSelect(featuredPosts[0])}
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10"></div>
                        <img 
                          src={featuredPosts[0].featuredImage} 
                          alt={featuredPosts[0].title} 
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        
                        <div className="absolute inset-x-0 bottom-0 p-6 z-20">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="px-3 py-1 text-xs font-medium bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full">
                              {featuredPosts[0].category}
                            </span>
                            <div className="text-white/90 text-sm flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {featuredPosts[0].readTime} min read
                            </div>
                          </div>
                          
                          <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 group-hover:text-red-200 transition-colors">
                            {featuredPosts[0].title}
                          </h3>
                          
                          <p className="text-white/90 mb-4 line-clamp-2">
                            {featuredPosts[0].excerpt}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <img 
                                src={featuredPosts[0].author.avatar} 
                                alt={featuredPosts[0].author.name} 
                                className="h-8 w-8 rounded-full object-cover"
                              />
                              <div className="text-white/90 text-sm">{featuredPosts[0].author.name}</div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleLikePost(featuredPosts[0].id, featuredPosts[0].likes, featuredPosts[0].userHasLiked);
                                }}
                                className="flex items-center gap-1 text-white/80 hover:text-white transition-colors text-sm"
                              >
                                <Heart className="h-4 w-4" fill={featuredPosts[0].userHasLiked ? 'currentColor' : 'none'} />
                                <span>{featuredPosts[0].likes}</span>
                              </button>
                              
                              <div className="flex items-center gap-1 text-white/80">
                                <MessageSquare className="h-4 w-4" />
                                <span>{featuredPosts[0].comments}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="lg:col-span-5 xl:col-span-4">
                    <div className="grid grid-cols-1 gap-6 h-full">
                      {featuredPosts.slice(1, 3).map((post, index) => (
                        <div 
                          key={post.id}
                          onClick={() => handlePostSelect(post)}
                          className="relative rounded-xl overflow-hidden h-44 cursor-pointer group"
                        >
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10"></div>
                          <img 
                            src={post.featuredImage} 
                            alt={post.title} 
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          
                          <div className="absolute inset-x-0 bottom-0 p-4 z-20">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="px-2 py-0.5 text-xs font-medium bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full">
                                {post.category}
                              </span>
                            </div>
                            
                            <h3 className="text-lg font-bold text-white group-hover:text-red-200 transition-colors line-clamp-2">
                              {post.title}
                            </h3>
                            
                            <div className="flex items-center justify-between mt-2">
                              <div className="text-white/90 text-xs flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {post.readTime} min read
                              </div>
                              
                              <div className="flex items-center gap-3">
                                <button 
                                  onClick={(e) => handleLikePost(post.id, post.likes, post.userHasLiked)}
                                  className="flex items-center gap-1 text-white/80 hover:text-white transition-colors text-xs"
                                >
                                  <Heart className="h-3 w-3" fill={post.userHasLiked ? 'currentColor' : 'none'} />
                                  <span>{post.likes}</span>
                                </button>
                                
                                <div className="flex items-center gap-1 text-white/80 text-xs">
                                  <MessageSquare className="h-3 w-3" />
                                  <span>{post.comments}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>
            
            {/* Main Content Section */}
            <section className="py-16">
              <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row gap-8">
                  {/* Main Content */}
                  <div className="lg:w-2/3">
                    {/* Filters and Controls */}
                    <div className="mb-8 flex flex-wrap justify-between gap-4">
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
                                className={`w-full text-left px
