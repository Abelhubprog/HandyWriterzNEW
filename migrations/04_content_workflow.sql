-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create content_revisions table
CREATE TABLE content_revisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    content TEXT,
    content_blocks JSONB,
    changed_by UUID NOT NULL REFERENCES auth.users(id),
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    version INTEGER NOT NULL,
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (post_id, version)
);

-- Create content_workflows table
CREATE TABLE content_workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('draft', 'in_review', 'approved', 'rejected', 'published', 'scheduled', 'archived')),
    assigned_to UUID REFERENCES auth.users(id),
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    comments TEXT,
    next_review_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (post_id)
);

-- Create workflow_templates table
CREATE TABLE workflow_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    steps JSONB NOT NULL,
    applies_to JSONB,
    auto_assign_reviewers BOOLEAN DEFAULT false,
    require_approval BOOLEAN DEFAULT true,
    notify_admin BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workflow_assignments table
CREATE TABLE workflow_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID NOT NULL REFERENCES content_workflows(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    step_id TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped')),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create media_library table
CREATE TABLE media_assets (
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
    uploaded_by UUID NOT NULL REFERENCES auth.users(id),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create media_folders table
CREATE TABLE media_folders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    parent_id UUID REFERENCES media_folders(id) ON DELETE CASCADE,
    path TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (path)
);

-- Create seo_templates table
CREATE TABLE seo_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    title_pattern TEXT NOT NULL,
    description_pattern TEXT NOT NULL,
    keywords_pattern TEXT,
    og_image_pattern TEXT,
    structured_data_template JSONB,
    applies_to JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create content_analytics table
CREATE TABLE content_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    period TEXT NOT NULL CHECK (period IN ('day', 'week', 'month', 'year')),
    date DATE NOT NULL,
    metrics JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (post_id, period, date)
);

-- Add new columns to posts table
ALTER TABLE posts
    ADD COLUMN IF NOT EXISTS seo_meta JSONB,
    ADD COLUMN IF NOT EXISTS last_autosave_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS workflow_id UUID REFERENCES content_workflows(id);

-- Create indexes for better query performance
CREATE INDEX idx_content_revisions_post_id ON content_revisions(post_id);
CREATE INDEX idx_content_workflows_post_id ON content_workflows(post_id);
CREATE INDEX idx_workflow_assignments_workflow_id ON workflow_assignments(workflow_id);
CREATE INDEX idx_media_assets_folder ON media_assets(folder);
CREATE INDEX idx_media_assets_type ON media_assets(type);
CREATE INDEX idx_content_analytics_post_id_date ON content_analytics(post_id, date);

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_media_assets_updated_at
    BEFORE UPDATE ON media_assets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_media_folders_updated_at
    BEFORE UPDATE ON media_folders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflow_templates_updated_at
    BEFORE UPDATE ON workflow_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflow_assignments_updated_at
    BEFORE UPDATE ON workflow_assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create RLS policies
ALTER TABLE content_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_analytics ENABLE ROW LEVEL SECURITY;

-- Create policies for content_revisions
CREATE POLICY "Enable read access for authenticated users" ON content_revisions
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON content_revisions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create policies for content_workflows
CREATE POLICY "Enable read access for authenticated users" ON content_workflows
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable write access for editors and admins" ON content_workflows
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM auth.users
            WHERE raw_user_meta_data->>'role' IN ('editor', 'admin')
        )
    );

-- Similar policies for other tables...
