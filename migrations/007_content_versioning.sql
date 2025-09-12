-- Create version tracking tables
CREATE TABLE IF NOT EXISTS content_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id UUID REFERENCES content(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    content_blocks JSONB,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_by TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(content_id, version_number)
);

-- Create content change log table
CREATE TABLE IF NOT EXISTS content_change_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id UUID REFERENCES content(id) ON DELETE CASCADE,
    changed_by TEXT NOT NULL,
    change_type TEXT NOT NULL,
    old_values JSONB,
    new_values JSONB,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add indexes
CREATE INDEX content_versions_content_id_idx ON content_versions(content_id);
CREATE INDEX content_versions_version_number_idx ON content_versions(version_number);
CREATE INDEX content_change_log_content_id_idx ON content_change_log(content_id);
CREATE INDEX content_change_log_changed_by_idx ON content_change_log(changed_by);
CREATE INDEX content_change_log_change_type_idx ON content_change_log(change_type);

-- Enable RLS
ALTER TABLE content_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_change_log ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Public can view published content versions"
ON content_versions FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM content
        WHERE content.id = content_id
        AND content.status = 'published'
    )
);

CREATE POLICY "Authors can view their content versions"
ON content_versions FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM content
        WHERE content.id = content_id
        AND content.author_id = auth.uid()
    )
);

CREATE POLICY "Admins can manage all versions"
ON content_versions FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM admin_users
        WHERE clerk_user_id = auth.uid()::text
    )
);

CREATE POLICY "Authors can view their content changes"
ON content_change_log FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM content
        WHERE content.id = content_id
        AND content.author_id = auth.uid()
    )
);

CREATE POLICY "Admins can view all changes"
ON content_change_log FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM admin_users
        WHERE clerk_user_id = auth.uid()::text
    )
);

-- Create versioning function
CREATE OR REPLACE FUNCTION create_content_version()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
    v_version_number INTEGER;
    v_changes JSONB;
BEGIN
    -- Get next version number
    SELECT COALESCE(MAX(version_number), 0) + 1
    INTO v_version_number
    FROM content_versions
    WHERE content_id = NEW.id;

    -- Create version record
    INSERT INTO content_versions (
        content_id,
        version_number,
        title,
        content,
        content_blocks,
        created_by,
        metadata
    ) VALUES (
        NEW.id,
        v_version_number,
        NEW.title,
        NEW.content,
        NEW.content_blocks,
        auth.uid()::text,
        jsonb_build_object(
            'status', NEW.status,
            'version_created_at', now()
        )
    );

    -- Calculate and log changes
    IF TG_OP = 'UPDATE' THEN
        v_changes := jsonb_build_object(
            'title', CASE WHEN NEW.title IS DISTINCT FROM OLD.title 
                         THEN jsonb_build_object('old', OLD.title, 'new', NEW.title)
                         ELSE NULL END,
            'content', CASE WHEN NEW.content IS DISTINCT FROM OLD.content 
                          THEN jsonb_build_object('changed', true)
                          ELSE NULL END,
            'content_blocks', CASE WHEN NEW.content_blocks IS DISTINCT FROM OLD.content_blocks 
                                THEN jsonb_build_object('changed', true)
                                ELSE NULL END,
            'status', CASE WHEN NEW.status IS DISTINCT FROM OLD.status 
                         THEN jsonb_build_object('old', OLD.status, 'new', NEW.status)
                         ELSE NULL END,
            'metadata', CASE WHEN NEW.metadata IS DISTINCT FROM OLD.metadata 
                          THEN jsonb_build_object('changed', true)
                          ELSE NULL END
        );

        -- Remove null values
        v_changes := v_changes - (
            SELECT array_agg(key)
            FROM jsonb_each(v_changes)
            WHERE value IS NULL
        );

        -- Only log if there are actual changes
        IF jsonb_typeof(v_changes) != 'null' AND v_changes != '{}' THEN
            INSERT INTO content_change_log (
                content_id,
                changed_by,
                change_type,
                old_values,
                new_values,
                metadata
            ) VALUES (
                NEW.id,
                auth.uid()::text,
                'update',
                jsonb_build_object(
                    'title', OLD.title,
                    'status', OLD.status,
                    'updated_at', OLD.updated_at
                ),
                jsonb_build_object(
                    'title', NEW.title,
                    'status', NEW.status,
                    'updated_at', NEW.updated_at
                ),
                jsonb_build_object(
                    'version_number', v_version_number,
                    'changes', v_changes
                )
            );
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

-- Create triggers
DROP TRIGGER IF EXISTS create_content_version_trigger ON content;
CREATE TRIGGER create_content_version_trigger
    AFTER INSERT OR UPDATE ON content
    FOR EACH ROW
    EXECUTE FUNCTION create_content_version();

-- Create version management functions
CREATE OR REPLACE FUNCTION get_content_version(
    p_content_id UUID,
    p_version_number INTEGER
)
RETURNS TABLE (
    version_id UUID,
    content_id UUID,
    version_number INTEGER,
    title TEXT,
    content TEXT,
    content_blocks JSONB,
    metadata JSONB,
    created_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cv.id,
        cv.content_id,
        cv.version_number,
        cv.title,
        cv.content,
        cv.content_blocks,
        cv.metadata,
        cv.created_by,
        cv.created_at
    FROM content_versions cv
    WHERE cv.content_id = p_content_id
    AND cv.version_number = p_version_number
    AND (
        EXISTS (
            SELECT 1 FROM content c
            WHERE c.id = cv.content_id
            AND (
                c.author_id = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM admin_users
                    WHERE clerk_user_id = auth.uid()::text
                )
            )
        )
    );
END;
$$;

CREATE OR REPLACE FUNCTION revert_to_version(
    p_content_id UUID,
    p_version_number INTEGER
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_version content_versions%ROWTYPE;
BEGIN
    -- Check permissions
    IF NOT EXISTS (
        SELECT 1 FROM content c
        WHERE c.id = p_content_id
        AND (
            c.author_id = auth.uid()
            OR EXISTS (
                SELECT 1 FROM admin_users
                WHERE clerk_user_id = auth.uid()::text
            )
        )
    ) THEN
        RAISE EXCEPTION 'Not authorized to revert this content';
    END IF;

    -- Get version data
    SELECT * INTO v_version
    FROM content_versions
    WHERE content_id = p_content_id
    AND version_number = p_version_number;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Version not found';
    END IF;

    -- Update content with version data
    UPDATE content
    SET 
        title = v_version.title,
        content = v_version.content,
        content_blocks = v_version.content_blocks,
        updated_at = now(),
        metadata = content.metadata || jsonb_build_object(
            'reverted_from_version', p_version_number,
            'reverted_at', now(),
            'reverted_by', auth.uid()
        )
    WHERE id = p_content_id;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_content_version TO authenticated;
GRANT EXECUTE ON FUNCTION revert_to_version TO authenticated;
