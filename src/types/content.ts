export interface AuthorProfile {
  id: string;
  name: string;
  avatarUrl?: string;
  avatar?: string;
  role?: string;
  email?: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author?: AuthorProfile;
  category: string;
  tags: string[];
  publishedAt?: string;
  readTime?: number;
  featuredImage?: string;
  mediaType?: 'image' | 'video' | 'audio';
  mediaUrl?: string;
  likes: number;
  comments: number;
  userHasLiked?: boolean;
  status?: 'draft' | 'published' | 'archived';
  serviceType?: string;
  isFeatured?: boolean;
  viewCount?: number;
  shareCount?: number;
  createdAt?: string;
  updatedAt?: string;
  authorId?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  count: number;
  description?: string;
  color?: string;
}

export interface Comment {
  id: string;
  postId: string;
  author: AuthorProfile;
  content: string;
  createdAt: string;
  likes: number;
  userHasLiked?: boolean;
  replies?: Comment[];
  isApproved?: boolean;
}

export interface ServiceConfig {
  serviceName: string;
  serviceDescription: string;
  slug: string;
  icon?: string;
  color?: string;
  features?: string[];
  pricing?: {
    basic?: number;
    premium?: number;
    enterprise?: number;
  };
}

// Export service types
export type ServiceType = 
  | 'child-nursing'
  | 'adult-health-nursing' 
  | 'mental-health-nursing'
  | 'advanced-practice-nursing'
  | 'nursing-education'
  | 'social-work'
  | 'special-education'
  | 'ai'
  | 'crypto'
  | 'web-development'
  | 'academic-writing';

export const SERVICE_CONFIGS: Record<ServiceType, ServiceConfig> = {
  'child-nursing': {
    serviceName: 'Child Health Nursing',
    serviceDescription: 'Specialized nursing care for pediatric patients and families',
    slug: 'child-nursing',
    icon: 'Baby',
    color: '#10B981'
  },
  'adult-health-nursing': {
    serviceName: 'Adult Health Nursing',
    serviceDescription: 'Comprehensive nursing care for adult patients across healthcare settings',
    slug: 'adult-health-nursing',
    icon: 'Heart',
    color: '#3B82F6'
  },
  'mental-health-nursing': {
    serviceName: 'Mental Health Nursing',
    serviceDescription: 'Specialized care for patients with mental health conditions',
    slug: 'mental-health-nursing',
    icon: 'Brain',
    color: '#8B5CF6'
  },
  'advanced-practice-nursing': {
    serviceName: 'Advanced Practice Nursing',
    serviceDescription: 'Advanced nursing practice and leadership in healthcare',
    slug: 'advanced-practice-nursing',
    icon: 'Stethoscope',
    color: '#059669'
  },
  'nursing-education': {
    serviceName: 'Nursing Education',
    serviceDescription: 'Educational resources and training for nursing professionals',
    slug: 'nursing-education',
    icon: 'GraduationCap',
    color: '#DC2626'
  },
  'social-work': {
    serviceName: 'Social Work',
    serviceDescription: 'Professional social work practice and community intervention',
    slug: 'social-work',
    icon: 'Users',
    color: '#F59E0B'
  },
  'special-education': {
    serviceName: 'Special Education',
    serviceDescription: 'Specialized educational approaches for diverse learning needs',
    slug: 'special-education',
    icon: 'BookOpen',
    color: '#EF4444'
  },
  'ai': {
    serviceName: 'Artificial Intelligence',
    serviceDescription: 'AI technologies, machine learning, and intelligent systems',
    slug: 'ai',
    icon: 'Cpu',
    color: '#6366F1'
  },
  'crypto': {
    serviceName: 'Cryptocurrency',
    serviceDescription: 'Blockchain technology, digital currencies, and decentralized finance',
    slug: 'crypto',
    icon: 'Coins',
    color: '#F97316'
  },
  'web-development': {
    serviceName: 'Web Development',
    serviceDescription: 'Modern web technologies, frameworks, and development practices',
    slug: 'web-development',
    icon: 'Code',
    color: '#06B6D4'
  },
  'academic-writing': {
    serviceName: 'Academic Writing',
    serviceDescription: 'Scholarly writing, research methodology, and academic communication',
    slug: 'academic-writing',
    icon: 'PenTool',
    color: '#84CC16'
  }
};

// Legacy interfaces for backward compatibility
export interface PostWithRelations extends Omit<Post, 'author'> {
  author?: {
    id: string;
    name: string;
    avatarUrl?: string;
    role?: string;
  };
  content_workflow?: Array<{
    stage: string;
  }>;
}

export interface CreatePostPayload {
  title: string;
  content: string;
  authorId: string;
  serviceType?: string;
  category?: string;
  tags?: string[];
  excerpt?: string;
  isFeatured?: boolean;
}

export interface UpdatePostPayload {
  id: string;
  title?: string;
  content?: string;
  status?: string;
  serviceType?: string;
  category?: string;
  tags?: string[];
  excerpt?: string;
  isFeatured?: boolean;
}

export interface DeletePostPayload {
  id: string;
}

// Content analytics and engagement types
export interface ContentAnalytics {
  postId: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  engagementRate: number;
  averageTimeSpent?: number;
  topReferrers?: string[];
  demographicData?: Record<string, any>;
}

export interface UserInteraction {
  id: string;
  userId: string;
  contentId: string;
  interactionType: 'like' | 'bookmark' | 'share' | 'view';
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface ContentWorkflow {
  id: string;
  postId: string;
  status: 'draft' | 'in_review' | 'approved' | 'rejected' | 'published' | 'scheduled' | 'archived';
  assignedTo?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  comments?: string;
  nextReviewDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceContentStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  topCategories: Array<{ name: string; count: number }>;
  recentActivity: Array<{
    type: 'post_created' | 'post_published' | 'comment_added';
    timestamp: string;
    title: string;
    author: string;
  }>;
}

// Media management types
export interface MediaAsset {
  id: string;
  title: string;
  type: 'image' | 'video' | 'audio' | 'document';
  url: string;
  thumbnailUrl?: string;
  fileSize: number;
  dimensions?: { width: number; height: number };
  duration?: number;
  format: string;
  alt?: string;
  caption?: string;
  tags: string[];
  folder?: string;
  metadata?: Record<string, any>;
  uploadedBy: string;
  uploadedAt: string;
  createdAt: string;
  updatedAt: string;
}
