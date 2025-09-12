-- Create content workflows table
CREATE TABLE IF NOT EXISTS content_workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES content(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'draft',
    assigned_to TEXT,
    reviewed_by TEXT,
    next_review_date TIMESTAMP WITH TIME ZONE,
    review_notes TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create content revisions table
CREATE TABLE IF NOT EXISTS content_revisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id UUID REFERENCES content(id) ON DELETE CASCADE,
    version INTEGER NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    content_blocks JSONB,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_by TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create content reviews table
CREATE TABLE IF NOT EXISTS content_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id UUID REFERENCES content(id) ON DELETE CASCADE,
    reviewer_id TEXT NOT NULL,
    status TEXT NOT NULL,
    feedback TEXT,
    checklist_items JSONB DEFAULT '{}'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create content schedules table
CREATE TABLE IF NOT EXISTS content_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id UUID REFERENCES content(id) ON DELETE CASCADE,
    publish_at TIMESTAMP WITH TIME ZONE NOT NULL,
    unpublish_at TIMESTAMP WITH TIME ZONE,
    timezone TEXT DEFAULT 'UTC',
    recurrence JSONB DEFAULT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies
ALTER TABLE content_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_schedules ENABLE ROW LEVEL SECURITY;

-- Workflow policies
CREATE POLICY "Admins can manage all workflows"
ON content_workflows FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM admin_users
        WHERE clerk_user_id = auth.uid()::text
    )
);

CREATE POLICY "Authors can view their content workflows"
ON content_workflows FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM content
        WHERE content.id = post_id
        AND content.author_id = auth.uid()
    )
);

-- Revision policies
CREATE POLICY "Admins can manage all revisions"
ON content_revisions FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM admin_users
        WHERE clerk_user_id = auth.uid()::text
    )
);

CREATE POLICY "Authors can view their content revisions"
ON content_revisions FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM content
        WHERE content.id = content_id
        AND content.author_id = auth.uid()
    )
);

-- Review policies
CREATE POLICY "Admins can manage all reviews"
ON content_reviews FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM admin_users
        WHERE clerk_user_id = auth.uid()::text
    )
);

CREATE POLICY "Authors can view reviews of their content"
ON content_reviews FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM content
        WHERE content.id = content_id
        AND content.author_id = auth.uid()
    )
);

-- Schedule policies
CREATE POLICY "Admins can manage all schedules"
ON content_schedules FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM admin_users
        WHERE clerk_user_id = auth.uid()::text
    )
);

CREATE POLICY "Authors can view their content schedules"
ON content_schedules FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM content
        WHERE content.id = content_id
        AND content.author_id = auth.uid()
    )
);

-- Create function to handle scheduled content publishing
CREATE OR REPLACE FUNCTION process_content_schedules()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Publish scheduled content
    UPDATE content c
    SET 
        status = 'published',
        updated_at = now()
    FROM content_schedules cs
    WHERE c.id = cs.content_id
    AND c.status = 'scheduled'
    AND cs.publish_at <= now()
    AND (cs.unpublish_at IS NULL OR cs.unpublish_at > now());

    -- Unpublish expired content
    UPDATE content c
    SET 
        status = 'archived',
        updated_at = now()
    FROM content_schedules cs
    WHERE c.id = cs.content_id
    AND c.status = 'published'
    AND cs.unpublish_at <= now();

    -- Handle recurring schedules
    INSERT INTO content_schedules (
        content_id,
        publish_at,
        unpublish_at,
        timezone,
        recurrence,
        metadata
    )
    SELECT
        content_id,
        -- Calculate next publish date based on recurrence pattern
        CASE recurrence->>'frequency'
            WHEN 'daily' THEN publish_at + interval '1 day'
            WHEN 'weekly' THEN publish_at + interval '1 week'
            WHEN 'monthly' THEN publish_at + interval '1 month'
            ELSE NULL
        END as next_publish_at,
        CASE recurrence->>'frequency'
            WHEN 'daily' THEN unpublish_at + interval '1 day'
            WHEN 'weekly' THEN unpublish_at + interval '1 week'
            WHEN 'monthly' THEN unpublish_at + interval '1 month'
            ELSE NULL
        END as next_unpublish_at,
        timezone,
        recurrence,
        metadata
    FROM content_schedules
    WHERE publish_at <= now()
    AND recurrence IS NOT NULL
    AND (recurrence->>'end_date')::timestamp > now();
END;
$$;

-- Create helper function to schedule content
CREATE OR REPLACE FUNCTION schedule_content(
    p_content_id UUID,
    p_publish_at TIMESTAMP WITH TIME ZONE,
    p_unpublish_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    p_timezone TEXT DEFAULT 'UTC',
    p_recurrence JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_schedule_id UUID;
BEGIN
    -- Validate inputs
    IF p_publish_at <= now() THEN
        RAISE EXCEPTION 'Publish date must be in the future';
    END IF;

    IF p_unpublish_at IS NOT NULL AND p_unpublish_at <= p_publish_at THEN
        RAISE EXCEPTION 'Unpublish date must be after publish date';
    END IF;

    -- Insert schedule
    INSERT INTO content_schedules (
        content_id,
        publish_at,
        unpublish_at,
        timezone,
        recurrence
    )
    VALUES (
        p_content_id,
        p_publish_at,
        p_unpublish_at,
        p_timezone,
        p_recurrence
    )
    RETURNING id INTO v_schedule_id;

    -- Update content status
    UPDATE content
    SET status = 'scheduled',
        updated_at = now()
    WHERE id = p_content_id;

    RETURN v_schedule_id;
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION process_content_schedules TO authenticated;
GRANT EXECUTE ON FUNCTION schedule_content TO authenticated;
