export interface Service {
  id: string;
  title: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  service: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface Author {
  id: string;
  name: string;
  avatar?: string | null;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  contentBlocks?: ContentBlock[];
  service: string;
  category?: string;
  status: 'draft' | 'review' | 'approved' | 'published' | 'archived' | 'scheduled';
  publishedAt?: string | null;
  scheduledFor?: string | null;
  createdAt: string;
  updatedAt: string;
  author: Author;
  featuredImage?: string;
  tags?: string[];
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  mediaType?: 'image' | 'video' | 'audio' | null;
  mediaUrl?: string;
  featured?: boolean;
  readTime: number;
}

export interface ContentBlock {
  id?: string;
  type: 'text' | 'image' | 'video' | 'code' | 'heading' | 'list' | 'quote' | 'divider';
  content: string;
  language?: string;
  level?: number;
  caption?: string;
  url?: string;
  metadata?: Record<string, any>;
}

export interface ServiceRequirement {
  id: string;
  serviceId: string;
  title: string;
  description?: string;
  isRequired: boolean;
  sortOrder?: number;
}

export interface ServiceMetaField {
  id: string;
  serviceId: string;
  name: string;
  label: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'date';
  options?: string[];
  defaultValue?: string | number | boolean;
  isRequired: boolean;
  sortOrder?: number;
  placeholder?: string;
  helpText?: string;
}

export interface FormErrors {
  title?: string;
  slug?: string;
  content?: string;
  category?: string;
  service?: string;
  [key: string]: string | undefined;
}

export interface ContentStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  pendingReview: number;
  views: number;
  likes: number;
  comments: number;
  shares: number;
}

export interface ContentReview {
  id: string;
  contentId: string;
  reviewerId: string;
  status: 'pending' | 'approved' | 'rejected' | 'needs_revision';
  comments?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  avatarUrl?: string; // For backward compatibility
  role: 'admin' | 'editor' | 'author' | 'subscriber';
  status: 'pending' | 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  last_login?: string;
  permissions?: string[];
}

export interface AdminUser extends User {
  is_super_admin?: boolean;
  granted_by?: string;
  permissions: string[];
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  parent_id?: string;
  created_at: string;
  updated_at: string;
  user?: User;
  replies?: Comment[];
}

export interface ContentMetrics {
  id: string;
  content_id: string;
  views: number;
  unique_views: number;
  time_spent: number;
  bounce_rate: number;
  engagement_score: number;
  created_at: string;
  updated_at: string;
}

export interface ContentInsights {
  id: string;
  content_id: string;
  metric_type: string;
  metric_value: number;
  date_recorded: string;
  created_at: string;
}

export interface ContentChangeLog {
  id: string;
  content_id: string;
  user_id: string;
  action: string;
  changes: Record<string, any>;
  created_at: string;
}

export interface ContentVersion {
  id: string;
  content_id: string;
  version_number: number;
  title: string;
  content: string;
  created_by: string;
  created_at: string;
}

// Helper function for creating URL-friendly slugs
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

// Service category interface
export interface ServiceCategory {
  id: string;
  name: string;
  description?: string;
  slug: string;
  service_id?: string;
  created_at?: string;
  updated_at?: string;
}

// Tag interface
export interface Tag {
  id: string;
  name: string;
  slug: string;
  color?: string;
  created_at?: string;
  updated_at?: string;
}

// Media interface
export interface Media {
  id: string;
  url: string;
  filename: string;
  mimetype: string;
  size: number;
  alt_text?: string;
  caption?: string;
  created_at?: string;
  updated_at?: string;
}

// Analytics interface
export interface Analytics {
  views: number;
  clicks: number;
  conversions: number;
  bounce_rate?: number;
  time_on_page?: number;
  sources?: Record<string, number>;
}

// Settings interfaces
export interface GeneralSettings {
  siteName: string;
  siteUrl: string;
  adminEmail: string;
  timezone?: string;
  dateFormat?: string;
  language?: string;
}

export interface SeoSettings {
  title: string;
  description: string;
  keywords: string[];
  ogImage?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  robots?: string;
}

export interface ApiSettings {
  apiKey: string;
  apiSecret: string;
  webhookUrl: string;
  rateLimitEnabled?: boolean;
  maxRequestsPerMinute?: number;
}
