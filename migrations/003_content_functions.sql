-- Create content analytics functions
CREATE OR REPLACE FUNCTION process_content_metrics()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    word_count INTEGER;
    seo_score INTEGER := 0;
    readability_score INTEGER := 0;
BEGIN
    -- Calculate word count
    SELECT array_length(regexp_split_to_array(regexp_replace(NEW.content, '<[^>]*>', '', 'g'), '\s+'), 1)
    INTO word_count;

    -- Calculate SEO score
    seo_score := 0;
    -- Title length (50-60 chars ideal)
    IF length(NEW.title) BETWEEN 50 AND 60 THEN
        seo_score := seo_score + 20;
    ELSIF length(NEW.title) BETWEEN 40 AND 70 THEN
        seo_score := seo_score + 10;
    END IF;

    -- Has featured image
    IF NEW.featured_image IS NOT NULL THEN
        seo_score := seo_score + 20;
    END IF;

    -- Has meta description
    IF NEW.seo_description IS NOT NULL AND length(NEW.seo_description) BETWEEN 150 AND 160 THEN
        seo_score := seo_score + 20;
    END IF;

    -- Has tags
    IF NEW.tags IS NOT NULL AND array_length(NEW.tags, 1) > 0 THEN
        seo_score := seo_score + 20;
    END IF;

    -- Minimum content length
    IF word_count >= 300 THEN
        seo_score := seo_score + 20;
    ELSIF word_count >= 200 THEN
        seo_score := seo_score + 10;
    END IF;

    -- Calculate basic readability score
    readability_score := CASE
        WHEN word_count < 100 THEN 50
        WHEN word_count BETWEEN 100 AND 300 THEN 70
        WHEN word_count BETWEEN 301 AND 600 THEN 85
        ELSE 100
    END;

    -- Update content metadata
    NEW.metadata := jsonb_build_object(
        'word_count', word_count,
        'seo_score', seo_score,
        'readability_score', readability_score,
        'last_analyzed', now()
    );

    -- If status changed to 'review', notify admins
    IF NEW.status = 'review' AND (OLD.status IS NULL OR OLD.status <> 'review') THEN
        INSERT INTO admin_notifications (
            type,
            user_id,
            content,
            created_at
        )
        SELECT 
            'content_review',
            clerk_user_id,
            jsonb_build_object(
                'content_id', NEW.id,
                'title', NEW.title,
                'author_id', NEW.author_id
            ),
            now()
        FROM admin_users;
    END IF;

    RETURN NEW;
END;
$$;

-- Create trigger for content metrics
DROP TRIGGER IF EXISTS content_metrics_trigger ON content;
CREATE TRIGGER content_metrics_trigger
    BEFORE INSERT OR UPDATE ON content
    FOR EACH ROW
    EXECUTE FUNCTION process_content_metrics();

-- Create function to get content stats
CREATE OR REPLACE FUNCTION get_content_stats(content_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result jsonb;
BEGIN
    SELECT jsonb_build_object(
        'views', (SELECT COUNT(*) FROM content_views WHERE content_views.content_id = $1),
        'likes', (SELECT COUNT(*) FROM content_likes WHERE content_likes.content_id = $1),
        'comments', (SELECT COUNT(*) FROM comments WHERE comments.content_id = $1),
        'shares', (SELECT COUNT(*) FROM content_shares WHERE content_shares.content_id = $1),
        'metrics', c.metadata
    ) INTO result
    FROM content c
    WHERE c.id = $1;
    
    RETURN result;
END;
$$;

-- Create function to get trending content
CREATE OR REPLACE FUNCTION get_trending_content(time_period interval DEFAULT interval '7 days')
RETURNS TABLE (
    content_id UUID,
    title TEXT,
    views BIGINT,
    likes BIGINT,
    comments BIGINT,
    shares BIGINT,
    engagement_score NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH metrics AS (
        SELECT 
            c.id,
            c.title,
            COUNT(DISTINCT cv.id) as view_count,
            COUNT(DISTINCT cl.id) as like_count,
            COUNT(DISTINCT cm.id) as comment_count,
            COUNT(DISTINCT cs.id) as share_count
        FROM content c
        LEFT JOIN content_views cv ON cv.content_id = c.id 
            AND cv.viewed_at >= now() - time_period
        LEFT JOIN content_likes cl ON cl.content_id = c.id 
            AND cl.created_at >= now() - time_period
        LEFT JOIN comments cm ON cm.content_id = c.id 
            AND cm.created_at >= now() - time_period
        LEFT JOIN content_shares cs ON cs.content_id = c.id 
            AND cs.created_at >= now() - time_period
        WHERE c.status = 'published'
        GROUP BY c.id, c.title
    )
    SELECT 
        id as content_id,
        title,
        view_count as views,
        like_count as likes,
        comment_count as comments,
        share_count as shares,
        (view_count * 1 + like_count * 2 + comment_count * 3 + share_count * 4)::numeric as engagement_score
    FROM metrics
    WHERE view_count > 0 OR like_count > 0 OR comment_count > 0 OR share_count > 0
    ORDER BY engagement_score DESC;
END;
$$;

-- Create function to get content recommendations
CREATE OR REPLACE FUNCTION get_content_recommendations(user_id UUID, limit_count INTEGER DEFAULT 5)
RETURNS TABLE (
    content_id UUID,
    title TEXT,
    relevance_score NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH user_interests AS (
        -- Get content the user has interacted with
        SELECT DISTINCT c.service_id, c.tags
        FROM content c
        LEFT JOIN content_views cv ON cv.content_id = c.id
        LEFT JOIN content_likes cl ON cl.content_id = c.id
        WHERE cv.viewer_id = user_id
        OR cl.user_id = user_id::text
    ),
    recommendations AS (
        SELECT 
            c.id,
            c.title,
            -- Calculate relevance score based on service and tag matches
            (
                CASE WHEN c.service_id IN (SELECT service_id FROM user_interests) THEN 50 ELSE 0 END +
                CASE WHEN c.tags && (SELECT array_agg(DISTINCT tag) FROM user_interests, unnest(tags) tag) THEN 30 ELSE 0 END +
                CASE WHEN c.metadata->>'seo_score' IS NOT NULL THEN (c.metadata->>'seo_score')::integer / 2 ELSE 0 END
            )::numeric as relevance
        FROM content c
        WHERE c.status = 'published'
        AND c.id NOT IN (
            SELECT content_id FROM content_views WHERE viewer_id = user_id
        )
    )
    SELECT 
        id,
        title,
        relevance as relevance_score
    FROM recommendations
    WHERE relevance > 0
    ORDER BY relevance DESC, created_at DESC
    LIMIT limit_count;
END;
$$;

-- Create function to generate content report
CREATE OR REPLACE FUNCTION generate_content_report(start_date timestamp, end_date timestamp)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result jsonb;
BEGIN
    SELECT jsonb_build_object(
        'period', jsonb_build_object(
            'start_date', start_date,
            'end_date', end_date
        ),
        'total_content', (
            SELECT COUNT(*)
            FROM content
            WHERE created_at BETWEEN start_date AND end_date
        ),
        'published_content', (
            SELECT COUNT(*)
            FROM content
            WHERE status = 'published'
            AND created_at BETWEEN start_date AND end_date
        ),
        'total_views', (
            SELECT COUNT(*)
            FROM content_views
            WHERE viewed_at BETWEEN start_date AND end_date
        ),
        'total_likes', (
            SELECT COUNT(*)
            FROM content_likes
            WHERE created_at BETWEEN start_date AND end_date
        ),
        'total_comments', (
            SELECT COUNT(*)
            FROM comments
            WHERE created_at BETWEEN start_date AND end_date
        ),
        'service_breakdown', (
            SELECT jsonb_object_agg(
                s.title,
                jsonb_build_object(
                    'total', COUNT(c.*),
                    'published', COUNT(c.*) FILTER (WHERE c.status = 'published'),
                    'views', COUNT(cv.*),
                    'likes', COUNT(cl.*)
                )
            )
            FROM services s
            LEFT JOIN content c ON c.service_id = s.id
            AND c.created_at BETWEEN start_date AND end_date
            LEFT JOIN content_views cv ON cv.content_id = c.id
            AND cv.viewed_at BETWEEN start_date AND end_date
            LEFT JOIN content_likes cl ON cl.content_id = c.id
            AND cl.created_at BETWEEN start_date AND end_date
            GROUP BY s.id, s.title
        )
    ) INTO result;

    RETURN result;
END;
$$;

-- Grant necessary permissions to authenticated users
GRANT EXECUTE ON FUNCTION process_content_metrics TO authenticated;
GRANT EXECUTE ON FUNCTION get_content_stats TO authenticated;
GRANT EXECUTE ON FUNCTION get_trending_content TO authenticated;
GRANT EXECUTE ON FUNCTION get_content_recommendations TO authenticated;
GRANT EXECUTE ON FUNCTION generate_content_report TO authenticated;
