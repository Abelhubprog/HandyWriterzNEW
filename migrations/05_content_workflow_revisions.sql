-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create content revisions table
CREATE TABLE IF NOT EXISTS content_revisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id UUID NOT NULL,
    version INTEGER NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    content_blocks JSONB,
    metadata JSONB,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    FOREIGN KEY (content_id) REFERENCES posts(id) ON DELETE CASCADE,
    UNIQUE(content_id, version)
);

-- Create workflow transitions table
CREATE TABLE IF NOT EXISTS workflow_transitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_stage VARCHAR(50) NOT NULL,
    to_stage VARCHAR(50) NOT NULL,
    required_role VARCHAR(50) NOT NULL,
    validation_rules JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT valid_stages CHECK (
        from_stage IN ('draft', 'review', 'approved', 'scheduled', 'published', 'archived') AND
        to_stage IN ('draft', 'review', 'approved', 'scheduled', 'published', 'archived')
    )
);

-- Create role permissions table
CREATE TABLE IF NOT EXISTS role_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role VARCHAR(50) NOT NULL,
    resource VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    conditions JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create content templates table
CREATE TABLE IF NOT EXISTS content_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    service VARCHAR(50) NOT NULL,
    structure JSONB NOT NULL,
    validation_rules JSONB,
    seo_defaults JSONB,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_content_revisions_content_id ON content_revisions(content_id);
CREATE INDEX IF NOT EXISTS idx_content_revisions_created_at ON content_revisions(created_at);
CREATE INDEX IF NOT EXISTS idx_workflow_transitions_stages ON workflow_transitions(from_stage, to_stage);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON role_permissions(role);
CREATE INDEX IF NOT EXISTS idx_content_templates_service ON content_templates(service);

-- Add RLS policies
ALTER TABLE content_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_transitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_templates ENABLE ROW LEVEL SECURITY;

-- RLS policies for content_revisions
CREATE POLICY "Content revisions are viewable by users with access to the content"
    ON content_revisions FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM posts p
            WHERE p.id = content_revisions.content_id
            AND (
                p.author_id = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM admin_users WHERE user_id = auth.uid()
                )
            )
        )
    );

CREATE POLICY "Content revisions are insertable by content authors and admins"
    ON content_revisions FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM posts p
            WHERE p.id = content_revisions.content_id
            AND (
                p.author_id = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM admin_users WHERE user_id = auth.uid()
                )
            )
        )
    );

-- RLS policies for workflow_transitions
CREATE POLICY "Workflow transitions are viewable by authenticated users"
    ON workflow_transitions FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Workflow transitions are manageable by admins"
    ON workflow_transitions FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users WHERE user_id = auth.uid()
        )
    );

-- RLS policies for role_permissions
CREATE POLICY "Role permissions are viewable by authenticated users"
    ON role_permissions FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Role permissions are manageable by admins"
    ON role_permissions FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users WHERE user_id = auth.uid()
        )
    );

-- RLS policies for content_templates
CREATE POLICY "Content templates are viewable by authenticated users"
    ON content_templates FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Content templates are manageable by admins"
    ON content_templates FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users WHERE user_id = auth.uid()
        )
    );

-- Create trigger to automatically create initial revision when content is created
CREATE OR REPLACE FUNCTION create_initial_revision()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO content_revisions (
        content_id,
        version,
        title,
        content,
        content_blocks,
        metadata,
        created_by
    ) VALUES (
        NEW.id,
        1,
        NEW.title,
        NEW.content,
        NEW.content_blocks,
        jsonb_build_object(
            'service', NEW.service_type,
            'category', NEW.category,
            'tags', NEW.tags,
            'status', NEW.status
        ),
        auth.uid()
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_create_initial_revision
    AFTER INSERT ON posts
    FOR EACH ROW
    EXECUTE FUNCTION create_initial_revision();

-- Create trigger to increment version number for new revisions
CREATE OR REPLACE FUNCTION get_next_revision_version()
RETURNS TRIGGER AS $$
BEGIN
    SELECT COALESCE(MAX(version), 0) + 1
    INTO NEW.version
    FROM content_revisions
    WHERE content_id = NEW.content_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_get_next_revision_version
    BEFORE INSERT ON content_revisions
    FOR EACH ROW
    EXECUTE FUNCTION get_next_revision_version();

-- Insert default workflow transitions
INSERT INTO workflow_transitions (from_stage, to_stage, required_role, validation_rules)
VALUES
    ('draft', 'review', 'author', '{"requiredFields": ["title", "content", "excerpt"]}'),
    ('review', 'approved', 'editor', '{"requiredFields": ["seoTitle", "seoDescription"]}'),
    ('approved', 'published', 'editor', '{"requiredFields": ["featuredImage"]}'),
    ('published', 'archived', 'editor', '{}'),
    ('archived', 'draft', 'editor', '{}'),
    ('review', 'draft', 'editor', '{"requireComment": true}'),
    ('approved', 'review', 'editor', '{"requireComment": true}')
ON CONFLICT (id) DO NOTHING;

-- Insert default role permissions
INSERT INTO role_permissions (role, resource, action, conditions)
VALUES
    ('author', 'posts', 'create', '{}'),
    ('author', 'posts', 'update', '{"isOwner": true}'),
    ('author', 'posts', 'delete', '{"isOwner": true, "status": "draft"}'),
    ('editor', 'posts', 'update', '{}'),
    ('editor', 'posts', 'publish', '{}'),
    ('editor', 'posts', 'delete', '{}'),
    ('admin', 'posts', 'manage', '{}'),
    ('admin', 'templates', 'manage', '{}'),
    ('admin', 'workflow', 'manage', '{}')
ON CONFLICT (id) DO NOTHING;
