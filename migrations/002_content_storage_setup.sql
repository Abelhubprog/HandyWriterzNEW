-- Create storage triggers and functions
CREATE OR REPLACE FUNCTION handle_storage_public_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Automatically set public access for content images
    IF NEW.bucket_id = 'content-images' THEN
        NEW.is_public = true;
    END IF;
    RETURN NEW;
END;
$$;

-- Create tables for tracking content assets
CREATE TABLE IF NOT EXISTS content_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id UUID REFERENCES content(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    mime_type TEXT,
    size BIGINT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_by TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies for content assets
ALTER TABLE content_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view content assets"
ON content_assets FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM content c
        WHERE c.id = content_id
        AND c.status = 'published'
    )
);

CREATE POLICY "Content owners can manage their assets"
ON content_assets FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM content c
        WHERE c.id = content_id
        AND (
            c.author_id = auth.uid()
            OR EXISTS (
                SELECT 1 FROM admin_users
                WHERE clerk_user_id = auth.uid()::text
            )
        )
    )
);

-- Create function to handle content versioning
CREATE OR REPLACE FUNCTION create_content_version()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO content_revisions (
        content_id,
        version,
        title,
        content,
        content_blocks,
        metadata,
        created_by
    )
    SELECT
        NEW.id,
        COALESCE((
            SELECT MAX(version) + 1
            FROM content_revisions
            WHERE content_id = NEW.id
        ), 1),
        NEW.title,
        NEW.content,
        NEW.content_blocks,
        jsonb_build_object(
            'status', NEW.status,
            'updated_at', NEW.updated_at,
            'updated_by', auth.uid()
        ),
        auth.uid()::text;
    RETURN NEW;
END;
$$;

-- Create trigger for content versioning
DROP TRIGGER IF EXISTS content_version_trigger ON content;
CREATE TRIGGER content_version_trigger
    AFTER UPDATE ON content
    FOR EACH ROW
    WHEN (OLD.* IS DISTINCT FROM NEW.*)
    EXECUTE FUNCTION create_content_version();

-- Create function to handle content workflow
CREATE OR REPLACE FUNCTION handle_content_workflow()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Create or update workflow entry
    INSERT INTO content_workflows (
        post_id,
        status,
        assigned_to,
        reviewed_by,
        next_review_date
    )
    VALUES (
        NEW.id,
        NEW.status,
        CASE 
            WHEN NEW.status = 'review' THEN (
                -- Assign to random admin for review
                SELECT clerk_user_id 
                FROM admin_users 
                ORDER BY random() 
                LIMIT 1
            )
            ELSE NULL
        END,
        CASE
            WHEN NEW.status IN ('published', 'archived') THEN auth.uid()::text
            ELSE NULL
        END,
        CASE
            WHEN NEW.status = 'review' THEN NOW() + INTERVAL '3 days'
            ELSE NULL
        END
    )
    ON CONFLICT (post_id) 
    DO UPDATE SET
        status = EXCLUDED.status,
        assigned_to = EXCLUDED.assigned_to,
        reviewed_by = EXCLUDED.reviewed_by,
        next_review_date = EXCLUDED.next_review_date,
        updated_at = NOW();

    RETURN NEW;
END;
$$;

-- Create trigger for content workflow
DROP TRIGGER IF EXISTS content_workflow_trigger ON content;
CREATE TRIGGER content_workflow_trigger
    AFTER INSERT OR UPDATE OF status ON content
    FOR EACH ROW
    EXECUTE FUNCTION handle_content_workflow();

-- Create function to handle content analytics
CREATE OR REPLACE FUNCTION log_content_view(content_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO content_views (
        content_id,
        viewer_id,
        viewed_at
    )
    VALUES (
        content_id,
        auth.uid(),
        NOW()
    );
END;
$$;

-- Create function to check content access
CREATE OR REPLACE FUNCTION check_content_access(content_id UUID)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM content c
        WHERE c.id = content_id
        AND (
            c.status = 'published'
            OR c.author_id = auth.uid()
            OR EXISTS (
                SELECT 1 FROM admin_users
                WHERE clerk_user_id = auth.uid()::text
            )
        )
    );
END;
$$;

-- Create function to get content permissions
CREATE OR REPLACE FUNCTION get_content_permissions(content_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result jsonb;
BEGIN
    SELECT jsonb_build_object(
        'can_edit', (
            c.author_id = auth.uid()
            OR EXISTS (
                SELECT 1 FROM admin_users
                WHERE clerk_user_id = auth.uid()::text
            )
        ),
        'can_delete', (
            c.author_id = auth.uid()
            OR EXISTS (
                SELECT 1 FROM admin_users
                WHERE clerk_user_id = auth.uid()::text
            )
        ),
        'can_publish', (
            EXISTS (
                SELECT 1 FROM admin_users
                WHERE clerk_user_id = auth.uid()::text
            )
        ),
        'can_comment', (
            auth.role() = 'authenticated'
        )
    )
    INTO result
    FROM content c
    WHERE c.id = content_id;
    
    RETURN result;
END;
$$;

-- Add policies for main content table
CREATE POLICY "Public can view published content"
ON content FOR SELECT
USING (status = 'published');

CREATE POLICY "Authors can manage their own content"
ON content FOR ALL
USING (author_id = auth.uid());

CREATE POLICY "Admins can manage all content"
ON content FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM admin_users
        WHERE clerk_user_id = auth.uid()::text
    )
);
