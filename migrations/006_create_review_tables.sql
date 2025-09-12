-- First verify the content table exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'content'
    ) THEN
        RAISE EXCEPTION 'Content table must exist before creating review tables';
    END IF;
END $$;

-- Drop existing policies if they exist
DO $$ 
BEGIN
    EXECUTE (
        SELECT string_agg(
            format('DROP POLICY IF EXISTS %I ON %I', policyname, tablename),
            '; '
        )
        FROM pg_policies
        WHERE tablename IN ('content_reviews', 'review_comments', 'review_checklist_items')
    );
EXCEPTION WHEN undefined_table THEN
    NULL;
END $$;

-- Drop existing tables if they exist
DROP TABLE IF EXISTS review_checklist_items CASCADE;
DROP TABLE IF EXISTS review_comments CASCADE;
DROP TABLE IF EXISTS content_reviews CASCADE;

-- Create basic review tables
CREATE TABLE content_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id UUID REFERENCES content(id) ON DELETE CASCADE,
    reviewer_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    feedback TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE review_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    review_id UUID REFERENCES content_reviews(id) ON DELETE CASCADE,
    commenter_id TEXT NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE review_checklist_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    review_id UUID REFERENCES content_reviews(id) ON DELETE CASCADE,
    item_name TEXT NOT NULL,
    is_completed BOOLEAN DEFAULT false,
    notes TEXT,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add indexes
CREATE INDEX content_reviews_content_id_idx ON content_reviews(content_id);
CREATE INDEX content_reviews_reviewer_id_idx ON content_reviews(reviewer_id);
CREATE INDEX content_reviews_status_idx ON content_reviews(status);
CREATE INDEX review_comments_review_id_idx ON review_comments(review_id);
CREATE INDEX review_checklist_items_review_id_idx ON review_checklist_items(review_id);

-- Enable RLS
ALTER TABLE content_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_checklist_items ENABLE ROW LEVEL SECURITY;

-- Create policies
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

CREATE POLICY "Assigned reviewers can manage their reviews"
ON content_reviews FOR ALL
USING (reviewer_id = auth.uid()::text);

CREATE POLICY "Admins can manage all comments"
ON review_comments FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM admin_users
        WHERE clerk_user_id = auth.uid()::text
    )
);

CREATE POLICY "Review participants can view comments"
ON review_comments FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM content_reviews cr
        JOIN content c ON c.id = cr.content_id
        WHERE cr.id = review_id
        AND (
            cr.reviewer_id = auth.uid()::text
            OR c.author_id = auth.uid()
        )
    )
);

CREATE POLICY "Admins can manage checklist items"
ON review_checklist_items FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM admin_users
        WHERE clerk_user_id = auth.uid()::text
    )
);

CREATE POLICY "Reviewers can manage their checklist items"
ON review_checklist_items FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM content_reviews
        WHERE id = review_id
        AND reviewer_id = auth.uid()::text
    )
);

-- Helper functions
CREATE OR REPLACE FUNCTION start_content_review(
    p_content_id UUID,
    p_reviewer_id TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_review_id UUID;
    v_reviewer_id TEXT;
BEGIN
    -- If no reviewer specified, assign to random admin
    IF p_reviewer_id IS NULL THEN
        SELECT clerk_user_id INTO v_reviewer_id
        FROM admin_users
        ORDER BY random()
        LIMIT 1;
    ELSE
        v_reviewer_id := p_reviewer_id;
    END IF;

    -- Create review
    INSERT INTO content_reviews (
        content_id,
        reviewer_id,
        status,
        metadata
    ) VALUES (
        p_content_id,
        v_reviewer_id,
        'pending',
        jsonb_build_object(
            'assigned_by', auth.uid(),
            'assigned_at', now()
        )
    )
    RETURNING id INTO v_review_id;

    -- Create standard checklist items
    INSERT INTO review_checklist_items (
        review_id,
        item_name
    )
    VALUES
        (v_review_id, 'Grammar and spelling check'),
        (v_review_id, 'Content accuracy verification'),
        (v_review_id, 'SEO optimization review'),
        (v_review_id, 'Metadata completeness check'),
        (v_review_id, 'Editorial guidelines compliance');

    RETURN v_review_id;
END;
$$;

CREATE OR REPLACE FUNCTION complete_review_item(
    p_review_id UUID,
    p_item_name TEXT,
    p_notes TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE review_checklist_items
    SET 
        is_completed = true,
        completed_at = now(),
        notes = p_notes,
        updated_at = now()
    WHERE review_id = p_review_id
    AND item_name = p_item_name
    AND (
        EXISTS (
            SELECT 1 FROM content_reviews cr
            WHERE cr.id = p_review_id
            AND cr.reviewer_id = auth.uid()::text
        )
        OR EXISTS (
            SELECT 1 FROM admin_users
            WHERE clerk_user_id = auth.uid()::text
        )
    );
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION start_content_review TO authenticated;
GRANT EXECUTE ON FUNCTION complete_review_item TO authenticated;
