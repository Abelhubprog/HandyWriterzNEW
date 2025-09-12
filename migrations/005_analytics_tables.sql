-- Create content views table
CREATE TABLE IF NOT EXISTS content_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id UUID REFERENCES content(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    session_id TEXT NOT NULL,
    time_spent INTEGER,
    referrer TEXT,
    user_agent TEXT,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create content engagement table
CREATE TABLE IF NOT EXISTS content_engagement (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id UUID REFERENCES content(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN ('like', 'comment', 'share')),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create content conversions table
CREATE TABLE IF NOT EXISTS content_conversions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id UUID REFERENCES content(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    session_id TEXT NOT NULL,
    conversion_type TEXT NOT NULL,
    conversion_value DECIMAL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create daily stats materialized view
CREATE MATERIALIZED VIEW IF NOT EXISTS content_daily_stats AS
WITH daily_metrics AS (
    SELECT
        c.id AS content_id,
        s.slug AS service_type,
        DATE_TRUNC('day', COALESCE(cv.viewed_at, ce.created_at, c.created_at)) AS date,
        COUNT(DISTINCT cv.id) AS daily_views,
        COUNT(DISTINCT ce.id) AS daily_engagement
    FROM
        content c
        INNER JOIN services s ON c.service_id = s.id
        LEFT JOIN content_views cv ON c.id = cv.content_id
        LEFT JOIN content_engagement ce ON c.id = ce.content_id
    GROUP BY
        c.id,
        s.slug,
        DATE_TRUNC('day', COALESCE(cv.viewed_at, ce.created_at, c.created_at))
)
SELECT
    date::date,
    service_type,
    SUM(daily_views) AS views,
    SUM(daily_engagement) AS engagement
FROM
    daily_metrics
GROUP BY
    date,
    service_type;

-- Create index for daily stats refresh
CREATE UNIQUE INDEX IF NOT EXISTS content_daily_stats_date_service_idx 
ON content_daily_stats (date, service_type);

-- Function to refresh daily stats
CREATE OR REPLACE FUNCTION refresh_content_daily_stats()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY content_daily_stats;
END;
$$;

-- Add RLS policies
ALTER TABLE content_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_engagement ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_conversions ENABLE ROW LEVEL SECURITY;

-- Views policies
CREATE POLICY "Public read access to content views"
ON content_views FOR SELECT
USING (true);

CREATE POLICY "Admins can manage content views"
ON content_views FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM admin_users
        WHERE clerk_user_id = auth.uid()::text
    )
);

-- Engagement policies
CREATE POLICY "Public read access to content engagement"
ON content_engagement FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create engagement"
ON content_engagement FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can manage their own engagement"
ON content_engagement FOR ALL
USING (
    auth.uid()::text = user_id::text
);

CREATE POLICY "Admins can manage all engagement"
ON content_engagement FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM admin_users
        WHERE clerk_user_id = auth.uid()::text
    )
);

-- Conversion policies
CREATE POLICY "Admins can manage conversions"
ON content_conversions FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM admin_users
        WHERE clerk_user_id = auth.uid()::text
    )
);

CREATE POLICY "Users can view their own conversions"
ON content_conversions FOR SELECT
USING (
    auth.uid()::text = user_id::text
);

-- Create notification triggers
CREATE OR REPLACE FUNCTION notify_on_high_engagement()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    engagement_count INTEGER;
    author_id UUID;
BEGIN
    -- Get engagement count for last hour
    SELECT COUNT(*)
    INTO engagement_count
    FROM content_engagement
    WHERE content_id = NEW.content_id
    AND created_at > NOW() - INTERVAL '1 hour';

    -- If high engagement, notify author
    IF engagement_count >= 100 THEN
        SELECT author_id INTO author_id
        FROM content
        WHERE id = NEW.content_id;

        INSERT INTO notifications (
            user_id,
            type,
            content,
            created_at
        ) VALUES (
            author_id,
            'high_engagement',
            jsonb_build_object(
                'contentId', NEW.content_id,
                'engagementCount', engagement_count
            ),
            NOW()
        );
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER notify_high_engagement
AFTER INSERT ON content_engagement
FOR EACH ROW
EXECUTE FUNCTION notify_on_high_engagement();

-- Attempt to create cron job if extension is available
DO $$
BEGIN
    -- Check if pg_cron extension exists
    IF EXISTS (
        SELECT 1 FROM pg_available_extensions WHERE name = 'pg_cron'
    ) THEN
        -- Create the extension if not exists
        CREATE EXTENSION IF NOT EXISTS pg_cron;
        
        -- Schedule the refresh job
        PERFORM cron.schedule(
            'refresh-content-stats',
            '0 * * * *',
            'SELECT refresh_content_daily_stats()'
        );
    ELSE
        -- Log that manual refresh will be needed
        RAISE NOTICE 'pg_cron extension not available. Stats refresh will need to be handled externally.';
    END IF;
END
$$;
