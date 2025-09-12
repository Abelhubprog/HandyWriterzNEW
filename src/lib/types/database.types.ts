// Type definitions for our Cloudflare D1 database schema
// These are used throughout the application for type safety

export interface Profile {
  id: string;
  created_at: string;
  updated_at: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  role: 'user' | 'admin' | 'super_admin';
  status: 'active' | 'suspended' | 'inactive';
  last_sign_in: string | null;
  metadata: any;
}

export interface AdminUser {
  id: string;
  user_id: string;
  role: 'admin' | 'super_admin';
  permissions: string[];
  created_at: string;
  granted_by: string | null;
}

export interface Post {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  author_id: string;
  category_id: string | null;
  featured_image: string | null;
  status: 'draft' | 'published' | 'archived';
  published_at: string | null;
  view_count: number;
  comment_count: number;
  like_count: number;
  share_count: number;
  metadata: any;
}

export interface Category {
  id: string;
  created_at: string;
  name: string;
  slug: string;
  description: string | null;
  post_count: number;
  service_type: string | null;
}

export interface Tag {
  id: string;
  created_at: string;
  name: string;
  slug: string;
  post_count: number;
}

export interface Comment {
  id: string;
  created_at: string;
  updated_at: string;
  post_id: string;
  author_id: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  parent_id: string | null;
}

export interface Service {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  slug: string;
  description: string;
  service_type: string;
  base_price: number;
  featured_image: string | null;
  icon: string | null;
  is_active: boolean;
  display_order: number;
  metadata: any;
}

export interface Order {
  id: string;
  created_at: string;
  updated_at: string;
  order_number: string;
  user_id: string;
  service_id: string;
  title: string;
  description: string;
  requirements: string;
  deadline: string | null;
  price: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'revision';
  payment_status: 'unpaid' | 'paid' | 'refunded';
  file_url: string | null;
  delivery_date: string | null;
  metadata: any;
}

export interface PostLike {
  id: string;
  created_at: string;
  post_id: string;
  user_id: string | null;
  ip_address: string | null;
}

export interface PostShare {
  id: string;
  created_at: string;
  post_id: string;
  platform: string;
  user_id: string | null;
  ip_address: string | null;
}

export interface PostView {
  id: string;
  created_at: string;
  post_id: string;
  user_id: string | null;
  ip_address: string | null;
  device_info: string | null;
}

export interface Media {
  id: string;
  created_at: string;
  updated_at: string;
  original_name: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  alt_text: string | null;
  caption: string | null;
  uploaded_by: string;
}

export interface Conversation {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  admin_id: string | null;
  subject: string;
  status: 'active' | 'closed';
  last_message: string | null;
  last_message_time: string | null;
  unread_count: number;
  order_id: string | null;
  order_number: string | null;
}

export interface Message {
  id: string;
  created_at: string;
  user_id: string | null;
  admin_id: string | null;
  conversation_id: string;
  content: string;
  is_read: boolean;
  sender_type: 'user' | 'admin' | 'system';
  attachments: string[] | null;
}

// Types with joined relations
export interface PostWithRelations extends Post {
  author?: Profile;
  category?: Category;
  tags?: Tag[];
  comments?: Comment[];
}

export interface CommentWithRelations extends Comment {
  author?: Profile;
  post?: {
    id: string;
    title: string;
    slug: string;
  };
}

export interface OrderWithRelations extends Order {
  user?: Profile;
  service?: Service;
}

export interface ConversationWithRelations extends Conversation {
  user?: Profile;
  admin?: Profile;
  messages?: Message[];
}

export interface MessageWithRelations extends Message {
  sender_user?: Profile;
  sender_admin?: Profile;
}
