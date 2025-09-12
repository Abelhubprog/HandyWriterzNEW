-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create tables first
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clerk_user_id text NOT NULL,
    metadata JSONB DEFAULT '{"role": "admin"}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(clerk_user_id)
);

CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT,
    content_blocks JSONB,
    excerpt TEXT,
    status TEXT NOT NULL DEFAULT 'draft',
    author_id TEXT NOT NULL,
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

CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT valid_service_slug CHECK (slug ~ '^[a-z0-9-]+$')
);

CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES categories(id),
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(service_id, slug),
    CONSTRAINT valid_category_slug CHECK (slug ~ '^[a-z0-9-]+$')
);

CREATE TABLE IF NOT EXISTS content_revisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    version INTEGER NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    content_blocks JSONB,
    metadata JSONB,
    created_by TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(content_id, version)
);

CREATE TABLE IF NOT EXISTS content_workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('draft', 'in_review', 'approved', 'rejected', 'published', 'scheduled', 'archived')),
    assigned_to TEXT,
    reviewed_by TEXT,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    comments TEXT,
    next_review_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (post_id)
);

CREATE TABLE IF NOT EXISTS workflow_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    steps JSONB NOT NULL,
    applies_to JSONB,
    auto_assign_reviewers BOOLEAN DEFAULT false,
    require_approval BOOLEAN DEFAULT true,
    notify_admin BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS workflow_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID NOT NULL REFERENCES content_workflows(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    step_id TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped')),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    completed_at TIMESTAMP WITH TIME ZONE,
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS media_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('image', 'video', 'audio', 'document')),
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    file_size BIGINT NOT NULL,
    dimensions JSONB,
    duration INTEGER,
    format TEXT NOT NULL,
    alt TEXT,
    caption TEXT,
    tags TEXT[],
    folder TEXT,
    metadata JSONB,
    optimized_versions JSONB,
    uploaded_by TEXT NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_admin_users_clerk_user_id ON admin_users(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_service ON posts(service_type);
CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at);
CREATE INDEX IF NOT EXISTS idx_content_revisions_post_id ON content_revisions(content_id);
CREATE INDEX IF NOT EXISTS idx_content_workflows_post_id ON content_workflows(post_id);
CREATE INDEX IF NOT EXISTS idx_workflow_assignments_workflow_id ON workflow_assignments(workflow_id);
CREATE INDEX IF NOT EXISTS idx_media_assets_type ON media_assets(type);
CREATE INDEX IF NOT EXISTS idx_categories_service_id ON categories(service_id);
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);

-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Admin users viewable by authenticated users" ON admin_users;
DROP POLICY IF EXISTS "Admin users manageable by admins" ON admin_users;
DROP POLICY IF EXISTS "Posts are viewable by everyone when published" ON posts;
DROP POLICY IF EXISTS "Posts are editable by authors" ON posts;
DROP POLICY IF EXISTS "Posts are manageable by admins" ON posts;
DROP POLICY IF EXISTS "Content revisions viewable by content owners and admins" ON content_revisions;
DROP POLICY IF EXISTS "Content workflows manageable by admins" ON content_workflows;
DROP POLICY IF EXISTS "Services viewable by everyone" ON services;
DROP POLICY IF EXISTS "Services manageable by admins" ON services;
DROP POLICY IF EXISTS "Categories viewable by everyone" ON categories;
DROP POLICY IF EXISTS "Categories manageable by admins" ON categories;
DROP POLICY IF EXISTS "Media assets viewable by everyone" ON media_assets;
DROP POLICY IF EXISTS "Media assets manageable by owners and admins" ON media_assets;
DROP POLICY IF EXISTS "Workflow templates viewable by authenticated" ON workflow_templates;
DROP POLICY IF EXISTS "Workflow templates manageable by admins" ON workflow_templates;
DROP POLICY IF EXISTS "Workflow assignments viewable by assigned users" ON workflow_assignments;
DROP POLICY IF EXISTS "Workflow assignments manageable by admins" ON workflow_assignments;

-- Enable RLS on all tables
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Admin users policies
CREATE POLICY "Admin users viewable by authenticated users"
ON admin_users FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admin users manageable by admins"
ON admin_users FOR ALL
USING (clerk_user_id::text = auth.uid()::text);

-- Posts policies
CREATE POLICY "Posts are viewable by everyone when published"
ON posts FOR SELECT
USING (status = 'published');

CREATE POLICY "Posts are editable by authors"
ON posts FOR ALL
USING (author_id = auth.uid()::text);

CREATE POLICY "Posts are manageable by admins"
ON posts FOR ALL
USING (EXISTS (
    SELECT 1 FROM admin_users 
    WHERE clerk_user_id::text = auth.uid()::text
));

-- Content revisions policies
CREATE POLICY "Content revisions viewable by content owners and admins"
ON content_revisions FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM posts p
        WHERE p.id = content_id
        AND (
            p.author_id = auth.uid()::text
            OR EXISTS (
                SELECT 1 FROM admin_users 
                WHERE clerk_user_id::text = auth.uid()::text
            )
        )
    )
);

-- Content workflows policies
CREATE POLICY "Content workflows viewable by participants"
ON content_workflows FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM posts p
        WHERE p.id = post_id
        AND (
            p.author_id = auth.uid()::text
            OR assigned_to = auth.uid()::text
            OR reviewed_by = auth.uid()::text
            OR EXISTS (
                SELECT 1 FROM admin_users 
                WHERE clerk_user_id::text = auth.uid()::text
            )
        )
    )
);

CREATE POLICY "Content workflows manageable by admins"
ON content_workflows FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM admin_users 
        WHERE clerk_user_id::text = auth.uid()::text
    )
);

-- Services and categories policies
CREATE POLICY "Services viewable by everyone"
ON services FOR SELECT
USING (true);

CREATE POLICY "Services manageable by admins"
ON services FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM admin_users 
        WHERE clerk_user_id::text = auth.uid()::text
    )
);

CREATE POLICY "Categories viewable by everyone"
ON categories FOR SELECT
USING (true);

CREATE POLICY "Categories manageable by admins"
ON categories FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM admin_users 
        WHERE clerk_user_id::text = auth.uid()::text
    )
);

-- Media assets policies
CREATE POLICY "Media assets viewable by everyone"
ON media_assets FOR SELECT
USING (true);

CREATE POLICY "Media assets manageable by owners and admins"
ON media_assets FOR ALL
USING (
    uploaded_by = auth.uid()::text
    OR EXISTS (
        SELECT 1 FROM admin_users 
        WHERE clerk_user_id::text = auth.uid()::text
    )
);

-- Workflow templates policies
CREATE POLICY "Workflow templates viewable by authenticated"
ON workflow_templates FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Workflow templates manageable by admins"
ON workflow_templates FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM admin_users 
        WHERE clerk_user_id::text = auth.uid()::text
    )
);

-- Workflow assignments policies
CREATE POLICY "Workflow assignments viewable by assigned users"
ON workflow_assignments FOR SELECT
USING (
    user_id = auth.uid()::text
    OR EXISTS (
        SELECT 1 FROM admin_users 
        WHERE clerk_user_id::text = auth.uid()::text
    )
);

CREATE POLICY "Workflow assignments manageable by admins"
ON workflow_assignments FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM admin_users 
        WHERE clerk_user_id::text = auth.uid()::text
    )
);

-- Create timestamp update trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER tr_posts_updated_at
    BEFORE UPDATE ON posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_content_workflows_updated_at
    BEFORE UPDATE ON content_workflows
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_workflow_assignments_updated_at
    BEFORE UPDATE ON workflow_assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default services
INSERT INTO services (name, slug, description, settings) VALUES
    ('Adult Health Nursing', 'adult-health-nursing', 'Content related to adult health nursing', '{"requireReview": true, "allowComments": true}'),
    ('Mental Health Nursing', 'mental-health-nursing', 'Content related to mental health nursing', '{"requireReview": true, "allowComments": true}'),
    ('Child Nursing', 'child-nursing', 'Content related to child nursing', '{"requireReview": true, "allowComments": true}'),
    ('Cryptocurrency', 'crypto', 'Content related to cryptocurrency and blockchain', '{"requireReview": true, "allowComments": true}'),
    ('Artificial Intelligence', 'ai', 'Content related to artificial intelligence and machine learning', '{"requireReview": true, "allowComments": true}')
ON CONFLICT (slug) DO NOTHING;

-- Insert default workflow template
INSERT INTO workflow_templates (name, description, steps) VALUES
(
    'Standard Content Review',
    'Standard workflow for content review and publishing',
    '[
        {
            "id": "draft",
            "name": "Draft",
            "description": "Initial content creation",
            "roles": ["author"],
            "next_steps": ["review"]
        },
        {
            "id": "review",
            "name": "Review",
            "description": "Content review by editors",
            "roles": ["editor"],
            "next_steps": ["approved", "revision"]
        },
        {
            "id": "revision",
            "name": "Revision",
            "description": "Content needs revision",
            "roles": ["author"],
            "next_steps": ["review"]
        },
        {
            "id": "approved",
            "name": "Approved",
            "description": "Content approved for publishing",
            "roles": ["editor", "admin"],
            "next_steps": ["published"]
        },
        {
            "id": "published",
            "name": "Published",
            "description": "Content is live",
            "roles": ["editor", "admin"],
            "next_steps": ["archived"]
        }
    ]'::jsonb
) ON CONFLICT DO NOTHING;
