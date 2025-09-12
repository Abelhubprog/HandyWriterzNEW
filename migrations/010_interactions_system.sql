-- Create interactions system for likes, comments, and other user engagement

-- Create user_interactions table for likes, bookmarks, shares
CREATE TABLE IF NOT EXISTS user_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    interaction_type TEXT NOT NULL CHECK (interaction_type IN ('like', 'bookmark', 'share', 'view')),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, content_id, interaction_type)
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'hidden', 'flagged')),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create comment_likes table
CREATE TABLE IF NOT EXISTS comment_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(comment_id, user_id)
);

-- Create user_profiles table for display information
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    website TEXT,
    social_links JSONB DEFAULT '{}'::jsonb,
    preferences JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_interactions_user_id ON user_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_content_id ON user_interactions(content_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_type ON user_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON comments(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_status ON comments(status);
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_id ON comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_user_id ON comment_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

-- Enable RLS
ALTER TABLE user_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_interactions
CREATE POLICY "Users can view public interactions"
    ON user_interactions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM posts p
            WHERE p.id = content_id
            AND p.status = 'published'
        )
    );

CREATE POLICY "Users can manage their own interactions"
    ON user_interactions FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- RLS Policies for comments
CREATE POLICY "Comments viewable on published posts"
    ON comments FOR SELECT
    USING (
        status = 'published'
        AND EXISTS (
            SELECT 1 FROM posts p
            WHERE p.id = post_id
            AND p.status = 'published'
        )
    );

CREATE POLICY "Users can create comments on published posts"
    ON comments FOR INSERT
    WITH CHECK (
        auth.uid() = author_id
        AND EXISTS (
            SELECT 1 FROM posts p
            WHERE p.id = post_id
            AND p.status = 'published'
        )
    );

CREATE POLICY "Users can edit their own comments"
    ON comments FOR UPDATE
    USING (auth.uid() = author_id)
    WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can delete their own comments"
    ON comments FOR DELETE
    USING (auth.uid() = author_id);

CREATE POLICY "Admins can manage all comments"
    ON comments FOR ALL
    USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

-- RLS Policies for comment_likes
CREATE POLICY "Comment likes viewable by everyone"
    ON comment_likes FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM comments c
            JOIN posts p ON p.id = c.post_id
            WHERE c.id = comment_id
            AND c.status = 'published'
            AND p.status = 'published'
        )
    );

CREATE POLICY "Users can manage their own comment likes"
    ON comment_likes FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_profiles
CREATE POLICY "User profiles viewable by everyone"
    ON user_profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can manage their own profile"
    ON user_profiles FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create trigger for updated_at columns
CREATE TRIGGER tr_user_interactions_updated_at
    BEFORE UPDATE ON user_interactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_comments_updated_at
    BEFORE UPDATE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create functions for common operations

-- Toggle like function
CREATE OR REPLACE FUNCTION toggle_post_like(p_post_id UUID, p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_exists BOOLEAN;
    v_like_count INTEGER;
BEGIN
    -- Check if like exists
    SELECT EXISTS (
        SELECT 1 FROM user_interactions
        WHERE user_id = p_user_id
        AND content_id = p_post_id
        AND interaction_type = 'like'
    ) INTO v_exists;

    IF v_exists THEN
        -- Remove like
        DELETE FROM user_interactions
        WHERE user_id = p_user_id
        AND content_id = p_post_id
        AND interaction_type = 'like';
    ELSE
        -- Add like
        INSERT INTO user_interactions (user_id, content_id, interaction_type)
        VALUES (p_user_id, p_post_id, 'like');
    END IF;

    -- Get updated like count
    SELECT COUNT(*)::INTEGER INTO v_like_count
    FROM user_interactions
    WHERE content_id = p_post_id
    AND interaction_type = 'like';

    RETURN jsonb_build_object(
        'liked', NOT v_exists,
        'like_count', v_like_count
    );
END;
$$;

-- Toggle comment like function
CREATE OR REPLACE FUNCTION toggle_comment_like(p_comment_id UUID, p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_exists BOOLEAN;
    v_like_count INTEGER;
BEGIN
    -- Check if like exists
    SELECT EXISTS (
        SELECT 1 FROM comment_likes
        WHERE user_id = p_user_id
        AND comment_id = p_comment_id
    ) INTO v_exists;

    IF v_exists THEN
        -- Remove like
        DELETE FROM comment_likes
        WHERE user_id = p_user_id
        AND comment_id = p_comment_id;
    ELSE
        -- Add like
        INSERT INTO comment_likes (user_id, comment_id)
        VALUES (p_user_id, p_comment_id);
    END IF;

    -- Get updated like count
    SELECT COUNT(*)::INTEGER INTO v_like_count
    FROM comment_likes
    WHERE comment_id = p_comment_id;

    RETURN jsonb_build_object(
        'liked', NOT v_exists,
        'like_count', v_like_count
    );
END;
$$;

-- Get post with interaction counts
CREATE OR REPLACE FUNCTION get_post_with_interactions(p_post_id UUID, p_user_id UUID DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'id', p.id,
        'title', p.title,
        'content', p.content,
        'excerpt', p.excerpt,
        'status', p.status,
        'service_type', p.service_type,
        'category', p.category,
        'tags', p.tags,
        'published_at', p.published_at,
        'created_at', p.created_at,
        'author', jsonb_build_object(
            'id', up.user_id,
            'name', COALESCE(up.display_name, 'Anonymous'),
            'avatar_url', up.avatar_url
        ),
        'interactions', jsonb_build_object(
            'likes', COALESCE(like_stats.count, 0),
            'comments', COALESCE(comment_stats.count, 0),
            'shares', COALESCE(share_stats.count, 0),
            'user_liked', CASE WHEN p_user_id IS NOT NULL THEN user_liked.exists ELSE false END,
            'user_bookmarked', CASE WHEN p_user_id IS NOT NULL THEN user_bookmarked.exists ELSE false END
        )
    ) INTO v_result
    FROM posts p
    LEFT JOIN user_profiles up ON up.user_id = p.author_id
    LEFT JOIN (
        SELECT content_id, COUNT(*) as count
        FROM user_interactions
        WHERE interaction_type = 'like'
        GROUP BY content_id
    ) like_stats ON like_stats.content_id = p.id
    LEFT JOIN (
        SELECT post_id, COUNT(*) as count
        FROM comments
        WHERE status = 'published'
        GROUP BY post_id
    ) comment_stats ON comment_stats.post_id = p.id
    LEFT JOIN (
        SELECT content_id, COUNT(*) as count
        FROM user_interactions
        WHERE interaction_type = 'share'
        GROUP BY content_id
    ) share_stats ON share_stats.content_id = p.id
    LEFT JOIN (
        SELECT true as exists
        FROM user_interactions
        WHERE user_id = p_user_id
        AND content_id = p.id
        AND interaction_type = 'like'
    ) user_liked ON true
    LEFT JOIN (
        SELECT true as exists
        FROM user_interactions
        WHERE user_id = p_user_id
        AND content_id = p.id
        AND interaction_type = 'bookmark'
    ) user_bookmarked ON true
    WHERE p.id = p_post_id;

    RETURN v_result;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION toggle_post_like TO authenticated;
GRANT EXECUTE ON FUNCTION toggle_comment_like TO authenticated;
GRANT EXECUTE ON FUNCTION get_post_with_interactions TO authenticated, anon;