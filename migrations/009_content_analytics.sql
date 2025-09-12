-- Create content analytics tables
CREATE TABLE IF NOT EXISTS content_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id UUID REFERENCES content(id) ON DELETE CASCADE,
    views_count INTEGER DEFAULT 0,
    unique_views_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    avg_time_spent INTERVAL,
    bounce_rate DECIMAL,
    metadata JSONB DEFAULT '{}'::jsonb,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS content_engagement_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id UUID REFERENCES content(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    user_id TEXT,
    session_id TEXT,
    device_info JSONB,
    referrer TEXT,
    duration INTERVAL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS content_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id UUID REFERENCES content(id) ON DELETE CASCADE,
    insight_type TEXT NOT NULL,
    insight_data JSONB NOT NULL,
    confidence_score DECIMAL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add indexes
CREATE INDEX content_metrics_content_id_idx ON content_metrics(content_id);
CREATE INDEX content_engagement_events_content_id_idx ON content_engagement_events(content_id);
CREATE INDEX content_engagement_events_event_type_idx ON content_engagement_events(event_type);
CREATE INDEX content_engagement_events_created_at_idx ON content_engagement_events(created_at);
CREATE INDEX content_insights_content_id_idx ON content_insights(content_id);
CREATE INDEX content_insights_insight_type_idx ON content_insights(insight_type);

-- Enable RLS
ALTER TABLE content_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_engagement_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_insights ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public can view published content metrics"
ON content_metrics FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM content
        WHERE content.id = content_id
        AND content.status = 'published'
    )
);

CREATE POLICY "Authors can view their content metrics"
ON content_metrics FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM content
        WHERE content.id = content_id
        AND content.author_id = auth.uid()
    )
);

CREATE POLICY "Admins can view all metrics"
ON content_metrics FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM admin_users
        WHERE clerk_user_id = auth.uid()::text
    )
);

CREATE POLICY "Authenticated users can create engagement events"
ON content_engagement_events FOR INSERT
WITH CHECK (
    auth.role() = 'authenticated'
    AND EXISTS (
        SELECT 1 FROM content
        WHERE content.id = content_id
        AND content.status = 'published'
    )
);

CREATE POLICY "Users can view their own engagement events"
ON content_engagement_events FOR SELECT
USING (user_id = auth.uid()::text);

CREATE POLICY "Authors can view their content engagement"
ON content_engagement_events FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM content
        WHERE content.id = content_id
        AND content.author_id = auth.uid()
    )
);

CREATE POLICY "Admins can view all engagement"
ON content_engagement_events FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM admin_users
        WHERE clerk_user_id = auth.uid()::text
    )
);

CREATE POLICY "Authors can view their content insights"
ON content_insights FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM content
        WHERE content.id = content_id
        AND content.author_id = auth.uid()
    )
);

CREATE POLICY "Admins can manage all insights"
ON content_insights FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM admin_users
        WHERE clerk_user_id = auth.uid()::text
    )
);

-- Create analytics functions
CREATE OR REPLACE FUNCTION track_content_engagement(
    p_content_id UUID,
    p_event_type TEXT,
    p_session_id TEXT,
    p_device_info JSONB DEFAULT NULL,
    p_referrer TEXT DEFAULT NULL,
    p_duration INTERVAL DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Record engagement event
    INSERT INTO content_engagement_events (
        content_id,
        event_type,
        user_id,
        session_id,
        device_info,
        referrer,
        duration,
        metadata
    ) VALUES (
        p_content_id,
        p_event_type,
        auth.uid()::text,
        p_session_id,
        p_device_info,
        p_referrer,
        p_duration,
        p_metadata
    );

    -- Update metrics
    INSERT INTO content_metrics (
        content_id,
        views_count,
        unique_views_count,
        likes_count,
        shares_count,
        metadata
    )
    VALUES (
        p_content_id,
        CASE WHEN p_event_type = 'view' THEN 1 ELSE 0 END,
        CASE WHEN p_event_type = 'view' THEN 1 ELSE 0 END,
        CASE WHEN p_event_type = 'like' THEN 1 ELSE 0 END,
        CASE WHEN p_event_type = 'share' THEN 1 ELSE 0 END,
        jsonb_build_object('last_event', p_event_type)
    )
    ON CONFLICT (content_id)
    DO UPDATE SET
        views_count = CASE 
            WHEN p_event_type = 'view' 
            THEN content_metrics.views_count + 1
            ELSE content_metrics.views_count
        END,
        unique_views_count = CASE 
            WHEN p_event_type = 'view' AND NOT EXISTS (
                SELECT 1 FROM content_engagement_events
                WHERE content_id = p_content_id
                AND event_type = 'view'
                AND (user_id = auth.uid()::text OR session_id = p_session_id)
                AND created_at > now() - interval '24 hours'
            )
            THEN content_metrics.unique_views_count + 1
            ELSE content_metrics.unique_views_count
        END,
        likes_count = CASE 
            WHEN p_event_type = 'like'
            THEN content_metrics.likes_count + 1
            ELSE content_metrics.likes_count
        END,
        shares_count = CASE 
            WHEN p_event_type = 'share'
            THEN content_metrics.shares_count + 1
            ELSE content_metrics.shares_count
        END,
        avg_time_spent = CASE 
            WHEN p_duration IS NOT NULL
            THEN (COALESCE(content_metrics.avg_time_spent, '0 seconds'::interval) * content_metrics.views_count + p_duration) / (content_metrics.views_count + 1)
            ELSE content_metrics.avg_time_spent
        END,
        metadata = content_metrics.metadata || jsonb_build_object(
            'last_event', p_event_type,
            'last_updated', now()
        ),
        last_updated = now();
END;
$$;

CREATE OR REPLACE FUNCTION generate_content_insights()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_content RECORD;
BEGIN
    -- Process each published content
    FOR v_content IN
        SELECT 
            c.id,
            c.title,
            c.created_at,
            m.views_count,
            m.unique_views_count,
            m.likes_count,
            m.shares_count,
            m.avg_time_spent,
            m.bounce_rate
        FROM content c
        LEFT JOIN content_metrics m ON m.content_id = c.id
        WHERE c.status = 'published'
    LOOP
        -- Generate engagement insight
        IF v_content.views_count > 0 THEN
            INSERT INTO content_insights (
                content_id,
                insight_type,
                insight_data,
                confidence_score
            )
            VALUES (
                v_content.id,
                'engagement_analysis',
                jsonb_build_object(
                    'total_views', v_content.views_count,
                    'unique_views', v_content.unique_views_count,
                    'likes', v_content.likes_count,
                    'shares', v_content.shares_count,
                    'avg_time_spent', v_content.avg_time_spent,
                    'engagement_rate', (v_content.likes_count + v_content.shares_count)::float / NULLIF(v_content.views_count, 0),
                    'analysis_date', now()
                ),
                0.95
            )
            ON CONFLICT (content_id, insight_type)
            DO UPDATE SET
                insight_data = EXCLUDED.insight_data,
                created_at = now();
        END IF;

        -- Generate performance trend insight
        INSERT INTO content_insights (
            content_id,
            insight_type,
            insight_data,
            confidence_score
        )
        SELECT
            v_content.id,
            'performance_trend',
            jsonb_build_object(
                'daily_views', jsonb_agg(
                    jsonb_build_object(
                        'date', date_trunc('day', created_at),
                        'views', count(*)
                    ) ORDER BY date_trunc('day', created_at)
                ),
                'analysis_date', now()
            ),
            0.90
        FROM content_engagement_events
        WHERE content_id = v_content.id
        AND event_type = 'view'
        GROUP BY content_id
        ON CONFLICT (content_id, insight_type)
        DO UPDATE SET
            insight_data = EXCLUDED.insight_data,
            created_at = now();
    END LOOP;
END;
$$;

-- Create a function to clean up old engagement events
CREATE OR REPLACE FUNCTION cleanup_old_engagement_events(p_days INTEGER DEFAULT 30)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    DELETE FROM content_engagement_events
    WHERE created_at < now() - (p_days || ' days')::interval;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION track_content_engagement TO authenticated;
GRANT EXECUTE ON FUNCTION generate_content_insights TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_engagement_events TO authenticated;
