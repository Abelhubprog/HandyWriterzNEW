-- Create scheduled content table
CREATE TABLE IF NOT EXISTS content_schedule (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id UUID REFERENCES content(id) ON DELETE CASCADE,
    scheduled_by TEXT NOT NULL,
    publish_at TIMESTAMP WITH TIME ZONE NOT NULL,
    unpublish_at TIMESTAMP WITH TIME ZONE,
    timezone TEXT DEFAULT 'UTC',
    recurring_pattern JSONB,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(content_id, publish_at)
);

-- Create content publishing log
CREATE TABLE IF NOT EXISTS content_publishing_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id UUID REFERENCES content(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    performed_by TEXT NOT NULL,
    version_number INTEGER,
    schedule_id UUID REFERENCES content_schedule(id),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add indexes
CREATE INDEX content_schedule_content_id_idx ON content_schedule(content_id);
CREATE INDEX content_schedule_publish_at_idx ON content_schedule(publish_at);
CREATE INDEX content_schedule_unpublish_at_idx ON content_schedule(unpublish_at);
CREATE INDEX content_publishing_log_content_id_idx ON content_publishing_log(content_id);
CREATE INDEX content_publishing_log_action_idx ON content_publishing_log(action);

-- Enable RLS
ALTER TABLE content_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_publishing_log ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage all schedules"
ON content_schedule FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM admin_users
        WHERE clerk_user_id = auth.uid()::text
    )
);

CREATE POLICY "Authors can view their content schedules"
ON content_schedule FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM content
        WHERE content.id = content_id
        AND content.author_id = auth.uid()
    )
);

CREATE POLICY "Authors can view their publishing logs"
ON content_publishing_log FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM content
        WHERE content.id = content_id
        AND content.author_id = auth.uid()
    )
);

CREATE POLICY "Admins can view all publishing logs"
ON content_publishing_log FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM admin_users
        WHERE clerk_user_id = auth.uid()::text
    )
);

-- Create scheduling functions
CREATE OR REPLACE FUNCTION schedule_content_publishing(
    p_content_id UUID,
    p_publish_at TIMESTAMP WITH TIME ZONE,
    p_unpublish_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    p_timezone TEXT DEFAULT 'UTC',
    p_recurring_pattern JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_schedule_id UUID;
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
        RAISE EXCEPTION 'Not authorized to schedule this content';
    END IF;

    -- Validate scheduling
    IF p_publish_at <= now() THEN
        RAISE EXCEPTION 'Publish time must be in the future';
    END IF;

    IF p_unpublish_at IS NOT NULL AND p_unpublish_at <= p_publish_at THEN
        RAISE EXCEPTION 'Unpublish time must be after publish time';
    END IF;

    -- Create schedule
    INSERT INTO content_schedule (
        content_id,
        scheduled_by,
        publish_at,
        unpublish_at,
        timezone,
        recurring_pattern,
        metadata
    ) VALUES (
        p_content_id,
        auth.uid()::text,
        p_publish_at,
        p_unpublish_at,
        p_timezone,
        p_recurring_pattern,
        jsonb_build_object(
            'scheduled_at', now(),
            'original_status', (SELECT status FROM content WHERE id = p_content_id)
        )
    )
    RETURNING id INTO v_schedule_id;

    -- Update content status to scheduled
    UPDATE content
    SET 
        status = 'scheduled',
        updated_at = now(),
        metadata = content.metadata || jsonb_build_object(
            'scheduled_at', now(),
            'schedule_id', v_schedule_id
        )
    WHERE id = p_content_id;

    -- Log scheduling
    INSERT INTO content_publishing_log (
        content_id,
        action,
        performed_by,
        schedule_id,
        metadata
    ) VALUES (
        p_content_id,
        'scheduled',
        auth.uid()::text,
        v_schedule_id,
        jsonb_build_object(
            'publish_at', p_publish_at,
            'unpublish_at', p_unpublish_at,
            'timezone', p_timezone,
            'recurring_pattern', p_recurring_pattern
        )
    );

    RETURN v_schedule_id;
END;
$$;

CREATE OR REPLACE FUNCTION process_scheduled_content()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_schedule RECORD;
BEGIN
    -- Process publishing
    FOR v_schedule IN
        SELECT cs.*, c.status as current_status, c.metadata as content_metadata
        FROM content_schedule cs
        JOIN content c ON c.id = cs.content_id
        WHERE cs.publish_at <= now()
        AND (c.status = 'scheduled' OR c.status = 'draft')
    LOOP
        -- Publish content
        UPDATE content
        SET 
            status = 'published',
            published_at = now(),
            updated_at = now(),
            metadata = content_metadata || jsonb_build_object(
                'auto_published', true,
                'published_at', now(),
                'schedule_id', v_schedule.id
            )
        WHERE id = v_schedule.content_id;

        -- Log publishing
        INSERT INTO content_publishing_log (
            content_id,
            action,
            performed_by,
            schedule_id,
            metadata
        ) VALUES (
            v_schedule.content_id,
            'published',
            'system',
            v_schedule.id,
            jsonb_build_object(
                'previous_status', v_schedule.current_status,
                'auto_published', true
            )
        );

        -- Handle recurring schedules
        IF v_schedule.recurring_pattern IS NOT NULL THEN
            -- Calculate next occurrence based on pattern
            -- This is a simplified version - you'd want to implement proper recurring logic
            INSERT INTO content_schedule (
                content_id,
                scheduled_by,
                publish_at,
                unpublish_at,
                timezone,
                recurring_pattern,
                metadata
            )
            SELECT
                v_schedule.content_id,
                v_schedule.scheduled_by,
                -- Example: if weekly, add 7 days
                v_schedule.publish_at + INTERVAL '7 days',
                CASE WHEN v_schedule.unpublish_at IS NOT NULL
                     THEN v_schedule.unpublish_at + INTERVAL '7 days'
                     ELSE NULL
                END,
                v_schedule.timezone,
                v_schedule.recurring_pattern,
                v_schedule.metadata || jsonb_build_object(
                    'recurring_from', v_schedule.id
                );
        END IF;
    END LOOP;

    -- Process unpublishing
    FOR v_schedule IN
        SELECT cs.*, c.status as current_status, c.metadata as content_metadata
        FROM content_schedule cs
        JOIN content c ON c.id = cs.content_id
        WHERE cs.unpublish_at IS NOT NULL
        AND cs.unpublish_at <= now()
        AND c.status = 'published'
    LOOP
        -- Unpublish content
        UPDATE content
        SET 
            status = 'archived',
            updated_at = now(),
            metadata = content_metadata || jsonb_build_object(
                'auto_unpublished', true,
                'unpublished_at', now(),
                'schedule_id', v_schedule.id
            )
        WHERE id = v_schedule.content_id;

        -- Log unpublishing
        INSERT INTO content_publishing_log (
            content_id,
            action,
            performed_by,
            schedule_id,
            metadata
        ) VALUES (
            v_schedule.content_id,
            'unpublished',
            'system',
            v_schedule.id,
            jsonb_build_object(
                'previous_status', v_schedule.current_status,
                'auto_unpublished', true
            )
        );
    END LOOP;
END;
$$;

-- Create a cron job function that can be called every minute
CREATE OR REPLACE FUNCTION cron_process_scheduled_content()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Only process if not already running
    IF NOT EXISTS (
        SELECT 1
        FROM pg_stat_activity
        WHERE query LIKE '%process_scheduled_content%'
        AND pid != pg_backend_pid()
    ) THEN
        PERFORM process_scheduled_content();
    END IF;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION schedule_content_publishing TO authenticated;
GRANT EXECUTE ON FUNCTION process_scheduled_content TO authenticated;
GRANT EXECUTE ON FUNCTION cron_process_scheduled_content TO authenticated;
