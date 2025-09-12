-- Service Content Management Tables
-- These tables support the admin-managed service content system

-- Service Posts Table
CREATE TABLE IF NOT EXISTS service_posts (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  service_type TEXT NOT NULL,
  category TEXT,
  tags TEXT, -- JSON array of tags
  featured_image TEXT,
  media_type TEXT CHECK (media_type IN ('image', 'video', 'audio')) DEFAULT 'image',
  media_url TEXT,
  status TEXT CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft',
  is_featured BOOLEAN DEFAULT FALSE,
  read_time INTEGER DEFAULT 5,
  view_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  author_id TEXT NOT NULL,
  published_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- Service Categories Table
CREATE TABLE IF NOT EXISTS service_categories (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  service_type TEXT NOT NULL,
  color TEXT,
  icon TEXT,
  post_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Service Tags Table
CREATE TABLE IF NOT EXISTS service_tags (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  service_type TEXT NOT NULL,
  usage_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Post Tags Junction Table
CREATE TABLE IF NOT EXISTS post_tags (
  post_id TEXT NOT NULL,
  tag_name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (post_id, tag_name),
  FOREIGN KEY (post_id) REFERENCES service_posts(id) ON DELETE CASCADE
);

-- Post Likes Table
CREATE TABLE IF NOT EXISTS post_likes (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  post_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(post_id, user_id),
  FOREIGN KEY (post_id) REFERENCES service_posts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- Post Comments Table
CREATE TABLE IF NOT EXISTS post_comments (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  post_id TEXT NOT NULL,
  author_id TEXT NOT NULL,
  content TEXT NOT NULL,
  parent_id TEXT, -- For nested comments/replies
  is_approved BOOLEAN DEFAULT FALSE,
  likes INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES service_posts(id) ON DELETE CASCADE,
  FOREIGN KEY (author_id) REFERENCES profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES post_comments(id) ON DELETE CASCADE
);

-- Comment Likes Table
CREATE TABLE IF NOT EXISTS comment_likes (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  comment_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(comment_id, user_id),
  FOREIGN KEY (comment_id) REFERENCES post_comments(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- Content Media Table
CREATE TABLE IF NOT EXISTS content_media (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_path TEXT NOT NULL,
  thumbnail_path TEXT,
  alt_text TEXT,
  caption TEXT,
  uploaded_by TEXT NOT NULL,
  service_type TEXT,
  tags TEXT, -- JSON array
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (uploaded_by) REFERENCES profiles(id) ON DELETE CASCADE
);

-- Post Revisions Table (for version control)
CREATE TABLE IF NOT EXISTS post_revisions (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  post_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  tags TEXT, -- JSON array
  category TEXT,
  revision_number INTEGER NOT NULL,
  change_description TEXT,
  created_by TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES service_posts(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE CASCADE
);

-- Content Templates Table
CREATE TABLE IF NOT EXISTS content_templates (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name TEXT NOT NULL,
  description TEXT,
  service_type TEXT NOT NULL,
  template_structure TEXT NOT NULL, -- JSON structure
  is_default BOOLEAN DEFAULT FALSE,
  created_by TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE CASCADE
);

-- Service Page Sections Table
CREATE TABLE IF NOT EXISTS service_page_sections (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  service_type TEXT NOT NULL,
  section_type TEXT NOT NULL CHECK (section_type IN ('hero', 'features', 'testimonials', 'pricing', 'faq', 'custom')),
  title TEXT NOT NULL,
  content TEXT NOT NULL, -- JSON content
  display_order INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Post Analytics Table
CREATE TABLE IF NOT EXISTS post_analytics (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  post_id TEXT NOT NULL,
  metric_date DATE NOT NULL,
  views INTEGER DEFAULT 0,
  unique_views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  average_read_time INTEGER DEFAULT 0, -- in seconds
  bounce_rate REAL DEFAULT 0.0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(post_id, metric_date),
  FOREIGN KEY (post_id) REFERENCES service_posts(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_service_posts_service_type ON service_posts(service_type);
CREATE INDEX IF NOT EXISTS idx_service_posts_status ON service_posts(status);
CREATE INDEX IF NOT EXISTS idx_service_posts_category ON service_posts(category);
CREATE INDEX IF NOT EXISTS idx_service_posts_published_at ON service_posts(published_at);
CREATE INDEX IF NOT EXISTS idx_service_posts_created_at ON service_posts(created_at);
CREATE INDEX IF NOT EXISTS idx_service_posts_author_id ON service_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_service_posts_featured ON service_posts(is_featured);

CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON post_likes(user_id);

CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_author_id ON post_comments(author_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_parent_id ON post_comments(parent_id);

CREATE INDEX IF NOT EXISTS idx_post_analytics_post_id ON post_analytics(post_id);
CREATE INDEX IF NOT EXISTS idx_post_analytics_date ON post_analytics(metric_date);

-- Create triggers for updating post counts
CREATE TRIGGER IF NOT EXISTS update_post_like_count 
AFTER INSERT ON post_likes
BEGIN
  UPDATE service_posts 
  SET likes = likes + 1 
  WHERE id = NEW.post_id;
END;

CREATE TRIGGER IF NOT EXISTS update_post_like_count_delete 
AFTER DELETE ON post_likes
BEGIN
  UPDATE service_posts 
  SET likes = likes - 1 
  WHERE id = OLD.post_id;
END;

CREATE TRIGGER IF NOT EXISTS update_post_comment_count 
AFTER INSERT ON post_comments
BEGIN
  UPDATE service_posts 
  SET comments = comments + 1 
  WHERE id = NEW.post_id;
END;

CREATE TRIGGER IF NOT EXISTS update_post_comment_count_delete 
AFTER DELETE ON post_comments
BEGIN
  UPDATE service_posts 
  SET comments = comments - 1 
  WHERE id = OLD.post_id;
END;

-- Create stored procedures (functions) for common operations
-- Note: SQLite doesn't support stored procedures, but we can create these as application-level functions

-- Seed some default categories for each service type
INSERT OR IGNORE INTO service_categories (name, slug, service_type, description) VALUES
-- Child Nursing Categories
('Clinical Practice', 'clinical-practice', 'child-nursing', 'Clinical practices and procedures in pediatric nursing'),
('Family-Centered Care', 'family-centered-care', 'child-nursing', 'Approaches to family-centered pediatric care'),
('Developmental Care', 'developmental-care', 'child-nursing', 'Child development and developmental milestones'),
('Pediatric Specialties', 'pediatric-specialties', 'child-nursing', 'Specialized areas of pediatric nursing'),
('Research & Evidence', 'research-evidence', 'child-nursing', 'Research and evidence-based practice'),

-- Adult Health Nursing Categories
('Medical-Surgical', 'medical-surgical', 'adult-health-nursing', 'Medical-surgical nursing practices'),
('Critical Care', 'critical-care', 'adult-health-nursing', 'Critical care and intensive care nursing'),
('Community Health', 'community-health', 'adult-health-nursing', 'Community and public health nursing'),
('Chronic Disease Management', 'chronic-disease', 'adult-health-nursing', 'Managing chronic conditions'),
('Patient Education', 'patient-education', 'adult-health-nursing', 'Patient and family education'),

-- Mental Health Nursing Categories
('Psychiatric Care', 'psychiatric-care', 'mental-health-nursing', 'Psychiatric nursing and interventions'),
('Crisis Intervention', 'crisis-intervention', 'mental-health-nursing', 'Mental health crisis management'),
('Therapeutic Communication', 'therapeutic-communication', 'mental-health-nursing', 'Communication techniques in mental health'),
('Addiction & Recovery', 'addiction-recovery', 'mental-health-nursing', 'Substance use disorders and recovery'),
('Mental Health Promotion', 'mental-health-promotion', 'mental-health-nursing', 'Promoting mental wellness'),

-- AI Categories
('Machine Learning', 'machine-learning', 'ai', 'Machine learning algorithms and applications'),
('Natural Language Processing', 'nlp', 'ai', 'NLP and language understanding'),
('Computer Vision', 'computer-vision', 'ai', 'Image and video analysis with AI'),
('AI Ethics', 'ai-ethics', 'ai', 'Ethical considerations in AI development'),
('AI Applications', 'ai-applications', 'ai', 'Real-world AI implementations'),

-- Crypto Categories
('Blockchain Technology', 'blockchain', 'crypto', 'Blockchain fundamentals and technology'),
('DeFi', 'defi', 'crypto', 'Decentralized finance protocols and applications'),
('Trading & Investment', 'trading-investment', 'crypto', 'Cryptocurrency trading and investment strategies'),
('NFTs & Digital Assets', 'nfts-digital-assets', 'crypto', 'Non-fungible tokens and digital collectibles'),
('Crypto Security', 'crypto-security', 'crypto', 'Security practices in cryptocurrency');

-- Seed some default tags
INSERT OR IGNORE INTO service_tags (name, slug, service_type) VALUES
-- Child Nursing Tags
('pediatric-assessment', 'pediatric-assessment', 'child-nursing'),
('immunizations', 'immunizations', 'child-nursing'),
('growth-development', 'growth-development', 'child-nursing'),
('family-support', 'family-support', 'child-nursing'),
('pain-management', 'pain-management', 'child-nursing'),

-- AI Tags  
('tensorflow', 'tensorflow', 'ai'),
('pytorch', 'pytorch', 'ai'),
('neural-networks', 'neural-networks', 'ai'),
('deep-learning', 'deep-learning', 'ai'),
('data-science', 'data-science', 'ai'),

-- Crypto Tags
('bitcoin', 'bitcoin', 'crypto'),
('ethereum', 'ethereum', 'crypto'),
('smart-contracts', 'smart-contracts', 'crypto'),
('defi-protocols', 'defi-protocols', 'crypto'),
('cryptocurrency-trading', 'cryptocurrency-trading', 'crypto');