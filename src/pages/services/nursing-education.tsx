import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useServiceContent } from '@/hooks/useServiceContent';
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
  ChevronRight,
  ArrowRight,
  X,
  ThumbsUp,
  Send,
  User,
  BookOpen,
  Tag,
  Bell,
  GraduationCap,
  Award,
  Users,
  Stethoscope,
  BookOpenCheck,
  Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SERVICE_CONFIGS } from '@/types/content';
import { Post, Category, Comment } from '@/types/content';

const NursingEducation: React.FC = () => {
  // States
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentView, setCurrentView] = useState<'grid' | 'list'>('grid');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [newComment, setNewComment] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [showCategories, setShowCategories] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);
  const [isCommentLoading, setIsCommentLoading] = useState<boolean>(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState<boolean>(false);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Set<string>>(new Set());

  // Refs
  const infiniteScrollRef = useRef<HTMLDivElement>(null);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  // Auth
  const { user } = useAuth();
  
  // Service details from config
  const serviceConfig = SERVICE_CONFIGS['nursing-education'] || {
    title: 'Nursing Education',
    serviceType: 'nursing-education',
    color: '#8B5FBF',
    colorClass: 'from-purple-600 to-purple-700',
    bgColor: 'bg-purple-50',
    description: 'Comprehensive nursing education resources, tutorials, and academic support for nursing students and professionals.'
  };
  
  const { title: serviceName, serviceType, color: serviceColor, colorClass: serviceColorClass, bgColor: serviceBgColor, description: serviceDescription } = serviceConfig;

  // Content management hook
  const {
    posts,
    featuredPosts,
    categories,
    tags: popularTags,
    isLoading,
    createPost,
    updatePost,
    deletePost,
    publishPost
  } = useServiceContent({
    serviceType: 'nursing-education',
    category: activeCategory,
    status: 'published',
    search: searchQuery
  });

  // Handle interactions
  const handleLike = async (postId: string) => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }

    try {
      const isLiked = likedPosts.has(postId);
      if (isLiked) {
        setLikedPosts(prev => new Set([...prev].filter(id => id !== postId)));
      } else {
        setLikedPosts(prev => new Set([...prev, postId]));
      }
      
      // Update post likes count in backend here
    } catch (error) {
    }
  };

  const handleBookmark = async (postId: string) => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }

    try {
      const isBookmarked = bookmarkedPosts.has(postId);
      if (isBookmarked) {
        setBookmarkedPosts(prev => new Set([...prev].filter(id => id !== postId)));
      } else {
        setBookmarkedPosts(prev => new Set([...prev, postId]));
      }
      
      // Update bookmarks in backend here
    } catch (error) {
    }
  };

  const handleShare = async (post: Post) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: window.location.href + '/' + post.slug,
        });
      } catch (error) {
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href + '/' + post.slug);
    }
  };

  const handleComment = async () => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }

    if (!newComment.trim() || !selectedPost) return;

    setIsCommentLoading(true);
    try {
      // Add comment logic here
      setNewComment('');
    } catch (error) {
    } finally {
      setIsCommentLoading(false);
    }
  };

  // Filter posts based on search and category
  const filteredPosts = posts.filter(post => {
    const matchesCategory = activeCategory === 'all' || post.category === activeCategory;
    const matchesSearch = searchQuery === '' || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.tags && post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
    
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      <Helmet>
        <title>{serviceName} - Professional Nursing Education Resources | HandyWriterz</title>
        <meta name="description" content={serviceDescription} />
        <meta name="keywords" content="nursing education, nursing tutorials, nursing school help, nursing degree, nursing certification, clinical practice, nursing skills, medical education, healthcare education, nursing students" />
        <meta property="og:title" content={`${serviceName} - Professional Nursing Education Resources`} />
        <meta property="og:description" content={serviceDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://handywriterz.com/services/nursing-education`} />
        <link rel="canonical" href="https://handywriterz.com/services/nursing-education" />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Header Section */}
        <div className={`${serviceBgColor} border-b`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className={`p-4 rounded-full bg-gradient-to-r ${serviceColorClass} text-white`}>
                  <GraduationCap size={48} />
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                {serviceName}
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                {serviceDescription}
              </p>
              
              {/* Key Features */}
              <div className="grid md:grid-cols-3 gap-6 mt-12">
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <Award className="h-8 w-8 text-purple-600 mb-3 mx-auto" />
                  <h3 className="font-semibold text-gray-900 mb-2">Professional Development</h3>
                  <p className="text-gray-600 text-sm">Continuing education and certification preparation</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <BookOpenCheck className="h-8 w-8 text-purple-600 mb-3 mx-auto" />
                  <h3 className="font-semibold text-gray-900 mb-2">Academic Support</h3>
                  <p className="text-gray-600 text-sm">Comprehensive learning resources and study guides</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <Target className="h-8 w-8 text-purple-600 mb-3 mx-auto" />
                  <h3 className="font-semibold text-gray-900 mb-2">Clinical Excellence</h3>
                  <p className="text-gray-600 text-sm">Evidence-based practice and clinical skills development</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="sticky top-0 bg-white border-b shadow-sm z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search nursing education resources..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Category Filter */}
              <div className="relative">
                <button
                  onClick={() => setShowCategories(!showCategories)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-purple-500"
                >
                  <Filter className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-700">
                    {activeCategory === 'all' ? 'All Categories' : 
                     categories.find(cat => cat.slug === activeCategory)?.name || 'Category'}
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </button>

                <AnimatePresence>
                  {showCategories && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full mt-2 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[200px]"
                    >
                      <button
                        onClick={() => {
                          setActiveCategory('all');
                          setShowCategories(false);
                        }}
                        className={`w-full text-left px-4 py-2 hover:bg-gray-50 first:rounded-t-lg ${
                          activeCategory === 'all' ? 'bg-purple-50 text-purple-700' : 'text-gray-700'
                        }`}
                      >
                        All Categories
                      </button>
                      {categories.map((category) => (
                        <button
                          key={category.id}
                          onClick={() => {
                            setActiveCategory(category.slug);
                            setShowCategories(false);
                          }}
                          className={`w-full text-left px-4 py-2 hover:bg-gray-50 last:rounded-b-lg ${
                            activeCategory === category.slug ? 'bg-purple-50 text-purple-700' : 'text-gray-700'
                          }`}
                        >
                          {category.name} ({category.post_count || 0})
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* View Toggle */}
              <div className="flex items-center gap-1 border border-gray-300 rounded-lg p-1">
                <button
                  onClick={() => setCurrentView('grid')}
                  className={`p-2 rounded ${currentView === 'grid' ? 'bg-purple-100 text-purple-700' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setCurrentView('list')}
                  className={`p-2 rounded ${currentView === 'list' ? 'bg-purple-100 text-purple-700' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Main Content Area */}
            <div className="lg:col-span-3">
              {/* Featured Posts */}
              {featuredPosts.length > 0 && (
                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Bell className="h-6 w-6 text-purple-600" />
                    Featured Resources
                  </h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {featuredPosts.slice(0, 3).map((post) => (
                      <motion.article
                        key={post.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow"
                      >
                        {post.featured_image && (
                          <div className="aspect-video bg-gray-200 overflow-hidden">
                            <img
                              src={post.featured_image}
                              alt={post.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="p-6">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              {post.category}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(post.published_at).toLocaleDateString()}
                            </span>
                          </div>
                          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                            {post.title}
                          </h3>
                          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                            {post.excerpt}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <button
                                onClick={() => handleLike(post.id)}
                                className={`flex items-center gap-1 hover:text-red-600 transition-colors ${
                                  likedPosts.has(post.id) ? 'text-red-600' : ''
                                }`}
                              >
                                <Heart className={`h-4 w-4 ${likedPosts.has(post.id) ? 'fill-current' : ''}`} />
                                {post.likes_count || 0}
                              </button>
                              <button className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                                <MessageSquare className="h-4 w-4" />
                                {post.comments_count || 0}
                              </button>
                            </div>
                            <button
                              onClick={() => handleBookmark(post.id)}
                              className={`hover:text-purple-600 transition-colors ${
                                bookmarkedPosts.has(post.id) ? 'text-purple-600' : 'text-gray-400'
                              }`}
                            >
                              <Bookmark className={`h-4 w-4 ${bookmarkedPosts.has(post.id) ? 'fill-current' : ''}`} />
                            </button>
                          </div>
                        </div>
                      </motion.article>
                    ))}
                  </div>
                </section>
              )}

              {/* All Posts */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Latest Resources
                    {filteredPosts.length > 0 && (
                      <span className="ml-2 text-sm font-normal text-gray-500">
                        ({filteredPosts.length} {filteredPosts.length === 1 ? 'resource' : 'resources'})
                      </span>
                    )}
                  </h2>
                </div>

                {isLoading ? (
                  <div className="grid gap-6">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="animate-pulse">
                          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                          <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredPosts.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No resources found</h3>
                    <p className="text-gray-600">
                      Try adjusting your search or filter criteria.
                    </p>
                  </div>
                ) : (
                  <div className={`grid gap-6 ${currentView === 'grid' ? 'md:grid-cols-2' : ''}`}>
                    {filteredPosts.map((post) => (
                      <motion.article
                        key={post.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow"
                      >
                        <div className={`${currentView === 'list' ? 'flex' : ''}`}>
                          {post.featured_image && (
                            <div className={`bg-gray-200 overflow-hidden ${
                              currentView === 'list' ? 'w-48 h-32' : 'aspect-video'
                            }`}>
                              <img
                                src={post.featured_image}
                                alt={post.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div className="p-6 flex-1">
                            <div className="flex items-center gap-2 mb-3">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                {post.category}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(post.published_at).toLocaleDateString()}
                              </span>
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                              {post.title}
                            </h3>
                            <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                              {post.excerpt}
                            </p>
                            
                            {/* Tags */}
                            {post.tags && post.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-4">
                                {post.tags.slice(0, 3).map((tag) => (
                                  <span
                                    key={tag}
                                    className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-600"
                                  >
                                    <Tag className="h-3 w-3 mr-1" />
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <button
                                  onClick={() => handleLike(post.id)}
                                  className={`flex items-center gap-1 hover:text-red-600 transition-colors ${
                                    likedPosts.has(post.id) ? 'text-red-600' : ''
                                  }`}
                                >
                                  <Heart className={`h-4 w-4 ${likedPosts.has(post.id) ? 'fill-current' : ''}`} />
                                  {post.likes_count || 0}
                                </button>
                                <button
                                  onClick={() => setSelectedPost(post)}
                                  className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                                >
                                  <MessageSquare className="h-4 w-4" />
                                  {post.comments_count || 0}
                                </button>
                                <button
                                  onClick={() => handleShare(post)}
                                  className="flex items-center gap-1 hover:text-green-600 transition-colors"
                                >
                                  <Share2 className="h-4 w-4" />
                                  Share
                                </button>
                              </div>
                              <button
                                onClick={() => handleBookmark(post.id)}
                                className={`hover:text-purple-600 transition-colors ${
                                  bookmarkedPosts.has(post.id) ? 'text-purple-600' : 'text-gray-400'
                                }`}
                              >
                                <Bookmark className={`h-4 w-4 ${bookmarkedPosts.has(post.id) ? 'fill-current' : ''}`} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.article>
                    ))}
                  </div>
                )}
              </section>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Quick Links */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Stethoscope className="h-5 w-5 text-purple-600" />
                    Quick Links
                  </h3>
                  <div className="space-y-2">
                    <Link
                      to="/services/nursing-education/study-guides"
                      className="block text-sm text-gray-600 hover:text-purple-600 transition-colors"
                    >
                      → Study Guides
                    </Link>
                    <Link
                      to="/services/nursing-education/practice-exams"
                      className="block text-sm text-gray-600 hover:text-purple-600 transition-colors"
                    >
                      → Practice Exams
                    </Link>
                    <Link
                      to="/services/nursing-education/clinical-skills"
                      className="block text-sm text-gray-600 hover:text-purple-600 transition-colors"
                    >
                      → Clinical Skills
                    </Link>
                    <Link
                      to="/services/nursing-education/certification"
                      className="block text-sm text-gray-600 hover:text-purple-600 transition-colors"
                    >
                      → Certification Prep
                    </Link>
                  </div>
                </div>

                {/* Popular Tags */}
                {popularTags.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Popular Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {popularTags.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => setSearchQuery(tag)}
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-600 hover:bg-purple-100 hover:text-purple-700 transition-colors"
                        >
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Need Help Section */}
                <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg p-6 text-white">
                  <h3 className="font-semibold mb-2">Need Personal Help?</h3>
                  <p className="text-purple-100 text-sm mb-4">
                    Get personalized nursing education support from our experts.
                  </p>
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-2 bg-white text-purple-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-50 transition-colors"
                  >
                    Get Started
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Login Prompt Modal */}
        <AnimatePresence>
          {showLoginPrompt && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={() => setShowLoginPrompt(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-lg p-6 max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-purple-100 mb-4">
                    <User className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Sign in to interact
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Please sign in to like posts, leave comments, and bookmark resources.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowLoginPrompt(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <Link
                      to="/auth/login"
                      className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      onClick={() => setShowLoginPrompt(false)}
                    >
                      Sign In
                    </Link>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default NursingEducation;