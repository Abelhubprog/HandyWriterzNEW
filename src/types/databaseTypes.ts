// Service Page Type
export interface ServicePage {
  id: string;
  title: string;
  slug: string;
  content: string;
  meta_description: string;
  featured_image?: string;
  likes_count: number;
  shares_count: number;
  views_count: number;
  created_at: string;
  updated_at: string;
  published: boolean;
  author_id?: string;
  service_id?: string;
}

// Post Type
export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image?: string;
  author_id: string;
  status: 'draft' | 'published' | 'archived';
  published_at?: string;
  created_at: string;
  updated_at: string;
  likes_count: number;
  views_count: number;
  service_slug?: string;
  category_id?: string;
  tags?: string[];
}

// Comment Type
export interface Comment {
  id: string;
  content: string;
  user_id: string;
  post_id: string;
  created_at: string;
  updated_at: string;
  user_profiles?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

// User Profile Type
export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  role: 'user' | 'admin' | 'editor';
  created_at: string;
  updated_at: string;
}

// Service Type
export interface Service {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon?: string;
  featured_image?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}
