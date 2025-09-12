/**
 * Unified user type for the entire app, compatible with Clerk and Supabase Auth.
 * Always use this for user data passed through app layers.
 */
export interface AppUser {
  /** Unique user ID (Clerk/Supabase Auth) */
  id: string;
  /** User email (if available) */
  email: string;
  /** Display name (if available) */
  name?: string;
  /** Avatar URL (if available) */
  avatarUrl?: string;
  /** Role in the app */
  role?: UserRole;
  /** Account status */
  status?: 'active' | 'inactive' | 'suspended';
}

/**
 * User roles supported by the app. Extend as needed.
 */
export type UserRole = 'admin' | 'user' | 'moderator' | 'editor';

/**
 * Admin user type for admin_users table and admin logic.
 * Use this for admin management and RBAC.
 */
export interface AdminUser {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  permissions?: string[];
  avatarUrl?: string;
}

/**
 * Author type for posts/comments, for public display.
 */
export interface Author {
  id: string;
  name: string;
  role: string;
  avatar?: string;
}

/**
 * AuthUser: Used for session/auth context. Always extends AppUser.
 */
export interface AuthUser extends AppUser {
  /**
   * Indicates which auth provider is used for this user.
   * Only 'clerk' and 'supabase' are supported.
   */
  provider?: 'clerk' | 'supabase';
  /**
   * Raw provider object if needed for advanced integrations.
   * For Clerk, this may include Clerk user/session data.
   * For Supabase, this may include Supabase user/session data.
   */
  providerData?: unknown;
}

/**
 * User type with extended properties used in the application UI
 */
export interface User extends AppUser {
  photoURL?: string;
  displayName?: string;
  email: string;
  uid: string;
}

/**
 * Supabase User structure from Auth
 */
export interface SupabaseUser {
  id: string;
  email?: string;
  app_metadata: {
    provider?: string;
    [key: string]: any;
  };
  user_metadata: {
    avatar_url?: string;
    full_name?: string;
    name?: string;
    [key: string]: any;
  };
  aud: string;
  created_at: string;
}

/**
 * Supabase Profile from the profiles table
 */
export interface SupabaseProfile {
  id: string;
  name?: string | null;
  avatar_url?: string | null;
  email?: string | null;
  role?: string | null;
  status?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

/**
 * Supabase Post structure
 */
export interface SupabasePost {
  id: string;
  title: string;
  content: string;
  excerpt?: string | null;
  author_id: string;
  category_id?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  published_at?: string | null;
  slug: string;
  status: string;
  cover_image?: string | null;
  featured?: boolean | null;
  service_type?: string | null;
  // Additional fields needed in adult-health-nursing.tsx
  category?: string; // Category name for display
  tags?: string[]; // Post tags
  likes_count?: number; // Number of likes
  comments_count?: number; // Number of comments
}

/**
 * Supabase Like structure
 */
export interface SupabaseLike {
  id: string;
  user_id: string;
  post_id: string;
  created_at?: string | null;
}