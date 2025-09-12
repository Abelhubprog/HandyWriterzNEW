-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create base tables
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clerk_user_id TEXT NOT NULL UNIQUE,
    user_id UUID,
    metadata JSONB DEFAULT '{"role": "admin"}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clerk_id TEXT UNIQUE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT DEFAULT 'user',
    avatar_url TEXT,
    status TEXT DEFAULT 'active',
    last_login TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clerk_user_id TEXT NOT NULL UNIQUE,
    display_name TEXT,
    bio TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT,
    excerpt TEXT,
    status TEXT DEFAULT 'draft',
    author_id UUID REFERENCES auth.users(id),
    featured_image TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    published_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT valid_status CHECK (status IN ('draft', 'review', 'published', 'archived'))
);

CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    content TEXT,
    featured_image TEXT,
    is_published BOOLEAN DEFAULT false,
    created_by TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    type TEXT NOT NULL,
    size BIGINT,
    metadata JSONB DEFAULT '{}'::jsonb,
    uploaded_by TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id UUID REFERENCES content(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    comment TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS content_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id UUID REFERENCES content(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(content_id, user_id)
);

CREATE TABLE IF NOT EXISTS content_anonymous_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL,
    ip_address TEXT,
    count INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS content_shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id UUID REFERENCES content(id) ON DELETE CASCADE,
    user_id TEXT,
    share_type TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create helper function for admin checks
CREATE OR REPLACE FUNCTION is_admin() 
RETURNS boolean 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE clerk_user_id = auth.uid()::text
  );
EXCEPTION
  WHEN undefined_table THEN
    RETURN FALSE;
END;
$$;

-- Enable RLS on all tables
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_anonymous_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_shares ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Admin Users policies
CREATE POLICY "Admin users viewable by authenticated users"
ON admin_users FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable admin_users read for all"
ON admin_users FOR SELECT
USING (true);

CREATE POLICY "Allow insert from authenticated users"
ON admin_users FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admin users manageable by admins"
ON admin_users FOR ALL
USING (EXISTS (
    SELECT 1 FROM admin_users admin_users_1
    WHERE admin_users_1.clerk_user_id = auth.uid()::text
));

CREATE POLICY "Allow self-management"
ON admin_users FOR UPDATE
USING (
    clerk_user_id = auth.uid()::text
    OR EXISTS (
        SELECT 1 FROM admin_users au
        WHERE au.clerk_user_id = auth.uid()::text
        AND au.clerk_user_id <> admin_users.clerk_user_id
    )
);

CREATE POLICY "Allow deletion by admins"
ON admin_users FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM admin_users au
        WHERE au.clerk_user_id = auth.uid()::text
        AND au.clerk_user_id <> admin_users.clerk_user_id
    )
);

-- Services policies
CREATE POLICY "Public can read published services"
ON services FOR SELECT
USING (is_published = true);

CREATE POLICY "Admins can manage all services"
ON services FOR ALL
USING (EXISTS (
    SELECT 1 FROM admin_users
    WHERE clerk_user_id = auth.uid()::text
));

-- Content policies
CREATE POLICY "Public can view published content"
ON content FOR SELECT
USING (status = 'published');

CREATE POLICY "Users can view their own content"
ON content FOR SELECT
USING (author_id = auth.uid());

CREATE POLICY "Users can update their own content"
ON content FOR UPDATE
USING (author_id = auth.uid());

CREATE POLICY "Users can delete their own content"
ON content FOR DELETE
USING (author_id = auth.uid());

CREATE POLICY "Admin users can manage all content"
ON content FOR ALL
USING (is_admin());

-- Comments policies
CREATE POLICY "Public can read approved comments"
ON comments FOR SELECT
USING (is_approved = true);

CREATE POLICY "Authenticated users can create comments"
ON comments FOR INSERT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can manage their own comments"
ON comments FOR UPDATE
USING (user_id = auth.uid()::text);

CREATE POLICY "Users can delete their own comments"
ON comments FOR DELETE
USING (user_id = auth.uid()::text);

CREATE POLICY "Admins can manage all comments"
ON comments FOR ALL
USING (EXISTS (
    SELECT 1 FROM admin_users
    WHERE clerk_user_id = auth.uid()::text
));

-- Likes policies
CREATE POLICY "Public can read likes count"
ON content_likes FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can like content"
ON content_likes FOR INSERT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can remove their own likes"
ON content_likes FOR DELETE
USING (user_id = auth.uid()::text);

-- Anonymous likes policies
CREATE POLICY "Public can view anonymous likes"
ON content_anonymous_likes FOR SELECT
USING (true);

CREATE POLICY "Anyone can add anonymous likes"
ON content_anonymous_likes FOR INSERT
USING (true);

-- Shares policies
CREATE POLICY "Public can view content shares"
ON content_shares FOR SELECT
USING (true);

CREATE POLICY "Anyone can share content"
ON content_shares FOR INSERT
USING (true);

-- Media policies
CREATE POLICY "Public can view media"
ON media FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can upload media"
ON media FOR INSERT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage all media"
ON media FOR ALL
USING (EXISTS (
    SELECT 1 FROM admin_users
    WHERE clerk_user_id = auth.uid()::text
));

-- Profile policies
CREATE POLICY "Public can view profiles"
ON profiles FOR SELECT
USING (true);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (clerk_user_id = auth.uid()::text);

CREATE POLICY "Admins can manage all profiles"
ON profiles FOR ALL
USING (EXISTS (
    SELECT 1 FROM admin_users
    WHERE clerk_user_id = auth.uid()::text
));

-- Create functions for content interactions
CREATE OR REPLACE FUNCTION increment_anonymous_likes(
    p_service_id UUID,
    p_session_id TEXT,
    p_ip_address TEXT
) RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO content_anonymous_likes (service_id, session_id, ip_address)
  VALUES (p_service_id, p_session_id, p_ip_address)
  ON CONFLICT (id) DO UPDATE
  SET count = content_anonymous_likes.count + 1,
      updated_at = NOW();
END;
$$;

CREATE OR REPLACE FUNCTION get_content_interactions(p_service_id UUID)
RETURNS TABLE (
    authenticated_likes BIGINT,
    anonymous_likes BIGINT,
    total_shares BIGINT,
    total_comments BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM content_likes WHERE service_id = p_service_id) AS authenticated_likes,
    (SELECT COALESCE(SUM(count), 0) FROM content_anonymous_likes WHERE service_id = p_service_id) AS anonymous_likes,
    (SELECT COUNT(*) FROM content_shares WHERE service_id = p_service_id) AS total_shares,
    (SELECT COUNT(*) FROM comments WHERE service_id = p_service_id AND is_approved = TRUE) AS total_comments;
END;
$$;
