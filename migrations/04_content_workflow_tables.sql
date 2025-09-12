-- Create content workflow table
CREATE TABLE IF NOT EXISTS content_workflow (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    stage VARCHAR(50) NOT NULL DEFAULT 'draft',
    assigned_to UUID REFERENCES auth.users(id),
    due_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT valid_stage CHECK (stage IN ('draft', 'review', 'revision', 'approved', 'published', 'archived'))
);

-- Create content analytics table
CREATE TABLE IF NOT EXISTS content_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    views INTEGER DEFAULT 0,
    unique_visitors INTEGER DEFAULT 0,
    avg_time_on_page INTERVAL,
    bounce_rate DECIMAL,
    likes INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    click_through_rate DECIMAL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create content analytics daily stats table for trends
CREATE TABLE IF NOT EXISTS content_analytics_daily (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    views INTEGER DEFAULT 0,
    unique_visitors INTEGER DEFAULT 0,
    avg_time_on_page INTERVAL,
    bounce_rate DECIMAL,
    UNIQUE(post_id, date)
);

-- Create referrer stats table
CREATE TABLE IF NOT EXISTS content_referrers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    source VARCHAR(255) NOT NULL,
    count INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create device stats table
CREATE TABLE IF NOT EXISTS content_devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    device_type VARCHAR(50) NOT NULL,
    count INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create audit log table
CREATE TABLE IF NOT EXISTS content_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    actor_id UUID REFERENCES auth.users(id),
    changes JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_content_workflow_post_id ON content_workflow(post_id);
CREATE INDEX IF NOT EXISTS idx_content_analytics_post_id ON content_analytics(post_id);
CREATE INDEX IF NOT EXISTS idx_content_analytics_daily_post_date ON content_analytics_daily(post_id, date);
CREATE INDEX IF NOT EXISTS idx_content_referrers_post_source ON content_referrers(post_id, source);
CREATE INDEX IF NOT EXISTS idx_content_devices_post_type ON content_devices(post_id, device_type);
CREATE INDEX IF NOT EXISTS idx_content_audit_log_post_id ON content_audit_log(post_id);

-- Create trigger to update workflow when post is created
CREATE OR REPLACE FUNCTION create_workflow_on_post_insert()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO content_workflow (post_id, stage)
    VALUES (NEW.id, 'draft');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_create_workflow_on_post_insert
    AFTER INSERT ON posts
    FOR EACH ROW
    EXECUTE FUNCTION create_workflow_on_post_insert();

-- Create trigger to update analytics when post is viewed
CREATE OR REPLACE FUNCTION update_analytics_on_view()
RETURNS TRIGGER AS $$
BEGIN
    -- Update daily stats
    INSERT INTO content_analytics_daily (post_id, date, views, unique_visitors)
    VALUES (NEW.post_id, CURRENT_DATE, 1, 1)
    ON CONFLICT (post_id, date)
    DO UPDATE SET
        views = content_analytics_daily.views + 1,
        unique_visitors = CASE 
            WHEN NOT EXISTS (
                SELECT 1 FROM content_analytics_daily 
                WHERE post_id = NEW.post_id 
                AND date = CURRENT_DATE 
                AND NEW.visitor_id = ANY(visitor_ids)
            )
            THEN content_analytics_daily.unique_visitors + 1
            ELSE content_analytics_daily.unique_visitors
        END;
        
    -- Update overall stats
    INSERT INTO content_analytics (post_id, views, unique_visitors)
    VALUES (NEW.post_id, 1, 1)
    ON CONFLICT (post_id)
    DO UPDATE SET
        views = content_analytics.views + 1,
        updated_at = now();
        
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create row level security policies
ALTER TABLE content_workflow ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_analytics_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_referrers ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_audit_log ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Authenticated users can view workflow"
    ON content_workflow FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admin users can modify workflow"
    ON content_workflow FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Authenticated users can view analytics"
    ON content_analytics FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admin users can modify analytics"
    ON content_analytics FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE user_id = auth.uid()
        )
    );

-- Repeat similar policies for other tables
-- Note: Add more specific policies based on user roles and permissions
