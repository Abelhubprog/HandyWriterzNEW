import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ServiceContentService, ServicePost } from '../services/serviceContentService';
import { Post, Category, ServiceType } from '../types/content';
import { toast } from 'react-hot-toast';

interface UseServiceContentOptions {
  serviceType: ServiceType;
  category?: string;
  featured?: boolean;
  status?: 'all' | 'published' | 'draft' | 'archived';
  search?: string;
  limit?: number;
}

export const useServiceContent = (options: UseServiceContentOptions) => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  // Query key for caching
  const queryKey = ['service-content', options.serviceType, {
    category: options.category,
    featured: options.featured,
    status: options.status,
    search: options.search,
    page,
    limit: options.limit
  }];

  // Fetch service posts
  const {
    data: postsData,
    isLoading: isLoadingPosts,
    error: postsError,
    refetch: refetchPosts
  } = useQuery({
    queryKey,
    queryFn: async () => {
      const result = await ServiceContentService.getServicePosts(options.serviceType, {
        category: options.category,
        featured: options.featured,
        status: options.status,
        search: options.search,
        limit: options.limit || 10,
        offset: (page - 1) * (options.limit || 10)
      });
      return result;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });

  // Fetch featured posts separately
  const {
    data: featuredPosts,
    isLoading: isLoadingFeatured
  } = useQuery({
    queryKey: ['featured-posts', options.serviceType],
    queryFn: () => ServiceContentService.getFeaturedPosts(options.serviceType, 3),
    staleTime: 5 * 60 * 1000,
    enabled: !options.featured, // Only fetch if we're not already filtering for featured
  });

  // Fetch categories
  const {
    data: categories,
    isLoading: isLoadingCategories
  } = useQuery({
    queryKey: ['service-categories', options.serviceType],
    queryFn: () => ServiceContentService.getServiceCategories(options.serviceType),
    staleTime: 10 * 60 * 1000,
  });

  // Fetch tags
  const {
    data: tags,
    isLoading: isLoadingTags
  } = useQuery({
    queryKey: ['service-tags', options.serviceType],
    queryFn: () => ServiceContentService.getServiceTags(options.serviceType),
    staleTime: 10 * 60 * 1000,
  });

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (postData: Omit<ServicePost, 'id' | 'createdAt' | 'updatedAt' | 'viewCount' | 'shareCount'>) => {
      return ServiceContentService.createServicePost(options.serviceType, postData);
    },
    onSuccess: (newPost) => {
      queryClient.invalidateQueries({ queryKey: ['service-content', options.serviceType] });
      queryClient.invalidateQueries({ queryKey: ['featured-posts', options.serviceType] });
      queryClient.invalidateQueries({ queryKey: ['service-categories', options.serviceType] });
      toast.success('Post created successfully');
      return newPost;
    },
    onError: (error) => {
      toast.error('Failed to create post');
    }
  });

  // Update post mutation
  const updatePostMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<ServicePost> }) => {
      return ServiceContentService.updateServicePost(id, updates);
    },
    onSuccess: (updatedPost) => {
      queryClient.invalidateQueries({ queryKey: ['service-content', options.serviceType] });
      queryClient.invalidateQueries({ queryKey: ['featured-posts', options.serviceType] });
      toast.success('Post updated successfully');
      return updatedPost;
    },
    onError: (error) => {
      toast.error('Failed to update post');
    }
  });

  // Delete post mutation
  const deletePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      return ServiceContentService.deleteServicePost(postId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-content', options.serviceType] });
      queryClient.invalidateQueries({ queryKey: ['featured-posts', options.serviceType] });
      queryClient.invalidateQueries({ queryKey: ['service-categories', options.serviceType] });
      toast.success('Post deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete post');
    }
  });

  // Publish post mutation
  const publishPostMutation = useMutation({
    mutationFn: async (postId: string) => {
      return ServiceContentService.publishPost(postId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-content', options.serviceType] });
      queryClient.invalidateQueries({ queryKey: ['featured-posts', options.serviceType] });
      toast.success('Post published successfully');
    },
    onError: (error) => {
      toast.error('Failed to publish post');
    }
  });

  // Toggle like mutation
  const toggleLikeMutation = useMutation({
    mutationFn: async ({ postId, userId }: { postId: string; userId: string }) => {
      return ServiceContentService.togglePostLike(postId, userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-content', options.serviceType] });
    },
    onError: (error) => {
      toast.error('Failed to update like');
    }
  });

  return {
    // Data
    posts: (postsData as any)?.posts || [],
    totalPosts: (postsData as any)?.total || 0,
    featuredPosts: featuredPosts || [],
    categories: categories || [],
    tags: tags || [],
    
    // Loading states
    isLoading: isLoadingPosts,
    isLoadingFeatured,
    isLoadingCategories,
    isLoadingTags,
    
    // Error states
    error: postsError,
    
    // Pagination
    page,
    setPage,
    hasNextPage: postsData ? (page * (options.limit || 10)) < ((postsData as any)?.total || 0) : false,
    
    // Actions
    createPost: createPostMutation.mutateAsync,
    updatePost: updatePostMutation.mutateAsync,
    deletePost: deletePostMutation.mutateAsync,
    publishPost: publishPostMutation.mutateAsync,
    toggleLike: toggleLikeMutation.mutateAsync,
    refetch: refetchPosts,
    
    // Loading states for mutations
    isCreating: createPostMutation.isPending,
    isUpdating: updatePostMutation.isPending,
    isDeleting: deletePostMutation.isPending,
    isPublishing: publishPostMutation.isPending,
    isTogglingLike: toggleLikeMutation.isPending,
  };
};

// Hook for service content statistics
export const useServiceStats = (serviceType: ServiceType) => {
  return useQuery({
    queryKey: ['service-stats', serviceType],
    queryFn: () => ServiceContentService.getServiceStats(serviceType),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
  });
};

// Hook for content search across services
export const useContentSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [serviceType, setServiceType] = useState<ServiceType | undefined>();
  const [isSearching, setIsSearching] = useState(false);

  const searchMutation = useMutation({
    mutationFn: async ({ query, serviceType: service, options }: {
      query: string;
      serviceType?: ServiceType;
      options?: { limit?: number; offset?: number };
    }) => {
      setIsSearching(true);
      return ServiceContentService.searchPosts(query, service, options);
    },
    onSuccess: () => {
      setIsSearching(false);
    },
    onError: (error) => {
      setIsSearching(false);
      toast.error('Search failed');
    }
  });

  const search = async (query: string, service?: ServiceType, options?: { limit?: number; offset?: number }) => {
    if (!query.trim()) return { posts: [], total: 0 };
    
    setSearchQuery(query);
    setServiceType(service);
    return searchMutation.mutateAsync({ query, serviceType: service, options });
  };

  return {
    search,
    searchQuery,
    serviceType,
    isSearching,
    results: searchMutation.data || { posts: [], total: 0 },
    error: searchMutation.error,
  };
};

// Hook for managing content workflow
export const useContentWorkflow = (serviceType: ServiceType) => {
  const queryClient = useQueryClient();

  const moveToNextStageMutation = useMutation({
    mutationFn: async ({ postId, stage }: { postId: string; stage: 'review' | 'approved' | 'published' }) => {
      // TODO: Implement workflow stage progression
      // For now, just update the post status
      return ServiceContentService.updateServicePost(postId, { status: stage as any });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-content', serviceType] });
      toast.success('Content moved to next stage');
    },
    onError: (error) => {
      toast.error('Failed to update workflow stage');
    }
  });

  return {
    moveToNextStage: moveToNextStageMutation.mutateAsync,
    isMoving: moveToNextStageMutation.isPending,
  };
};