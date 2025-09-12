-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT,
    content_blocks JSONB,
    excerpt TEXT,
    status TEXT NOT NULL DEFAULT 'draft',
    author_id UUID REFERENCES auth.users(id),
    service_type TEXT,
    category TEXT,
    tags TEXT[],
    seo_title TEXT,
    seo_description TEXT,
    featured_image TEXT,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT valid_status CHECK (status IN ('draft', 'review', 'approved', 'published', 'archived'))
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_service ON posts(service_type);
CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at);

-- Enable RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Create basic policies
CREATE POLICY "Posts are viewable by everyone when published"
    ON posts FOR SELECT
    USING (status = 'published');

CREATE POLICY "Posts are editable by authors"
    ON posts FOR ALL
    USING (auth.uid() = author_id);

CREATE POLICY "Posts are manageable by admins"
    ON posts FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM admin_users WHERE user_id = auth.uid()
        )
    );

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_posts_updated_at
    BEFORE UPDATE ON posts
    FOR EACH ROW
    EXECUTE FUNCTION update_posts_updated_at();
