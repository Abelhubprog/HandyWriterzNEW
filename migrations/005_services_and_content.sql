-- Create enum type for content status
DO $$ BEGIN
    CREATE TYPE content_status AS ENUM (
        'draft',
        'review',
        'scheduled',
        'published',
        'archived'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Drop existing tables in reverse order
DROP TABLE IF EXISTS content_shares CASCADE;
DROP TABLE IF EXISTS content_likes CASCADE;
DROP TABLE IF EXISTS content_views CASCADE;
DROP TABLE IF EXISTS content CASCADE;
DROP TABLE IF EXISTS services CASCADE;

-- Create services table
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    slug TEXT UNIQUE NOT NULL,
    icon TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create the content table
CREATE TABLE content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id UUID REFERENCES services(id),
    title TEXT NOT NULL,
    slug TEXT UNIQUE,
    content TEXT,
    content_blocks JSONB,
    excerpt TEXT,
    featured_image TEXT,
    seo_title TEXT,
    seo_description TEXT,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    categories TEXT[] DEFAULT ARRAY[]::TEXT[],
    author_id UUID NOT NULL,
    status content_status DEFAULT 'draft',
    published_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'::jsonb,
    search_vector tsvector,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create engagement tables
CREATE TABLE content_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id UUID REFERENCES content(id) ON DELETE CASCADE,
    viewer_id UUID,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE content_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id UUID REFERENCES content(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE content_shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id UUID REFERENCES content(id) ON DELETE CASCADE,
    shared_by UUID,
    share_platform TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes
CREATE INDEX content_service_id_idx ON content(service_id);
CREATE INDEX content_author_id_idx ON content(author_id);
CREATE INDEX content_status_idx ON content(status);
CREATE INDEX content_published_at_idx ON content(published_at);
CREATE INDEX content_slug_idx ON content(slug);
CREATE INDEX content_tags_idx ON content USING gin(tags);
CREATE INDEX content_categories_idx ON content USING gin(categories);
CREATE INDEX content_search_idx ON content USING gin(search_vector);

CREATE INDEX content_views_content_id_idx ON content_views(content_id);
CREATE INDEX content_views_viewer_id_idx ON content_views(viewer_id);
CREATE INDEX content_likes_content_id_idx ON content_likes(content_id);
CREATE INDEX content_shares_content_id_idx ON content_shares(content_id);

-- Enable RLS
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_shares ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Public can view services"
ON services FOR SELECT
USING (true);

CREATE POLICY "Admins can manage services"
ON services FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM admin_users
        WHERE clerk_user_id = auth.uid()::text
    )
);

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

-- Create helper functions
CREATE OR REPLACE FUNCTION update_content_search_vector()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.excerpt, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.content, '')), 'C');
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION generate_unique_slug()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
    base_slug TEXT;
    new_slug TEXT;
    counter INTEGER := 1;
BEGIN
    IF NEW.slug IS NULL THEN
        -- Convert to lowercase and replace spaces and special chars with hyphens
        base_slug := lower(regexp_replace(NEW.title, '[^a-zA-Z0-9]+', '-', 'g'));
        -- Remove leading/trailing hyphens
        base_slug := trim(both '-' from base_slug);
        
        new_slug := base_slug;
        
        -- Check if slug exists and append number if it does
        WHILE EXISTS (SELECT 1 FROM content WHERE slug = new_slug) LOOP
            new_slug := base_slug || '-' || counter;
            counter := counter + 1;
        END LOOP;
        
        NEW.slug := new_slug;
    END IF;
    RETURN NEW;
END;
$$;

-- Create triggers
DROP TRIGGER IF EXISTS update_content_search_vector_trigger ON content;
CREATE TRIGGER update_content_search_vector_trigger
    BEFORE INSERT OR UPDATE ON content
    FOR EACH ROW
    EXECUTE FUNCTION update_content_search_vector();

DROP TRIGGER IF EXISTS generate_content_slug_trigger ON content;
CREATE TRIGGER generate_content_slug_trigger
    BEFORE INSERT ON content
    FOR EACH ROW
    EXECUTE FUNCTION generate_unique_slug();

-- Grant permissions
GRANT EXECUTE ON FUNCTION generate_unique_slug TO authenticated;
GRANT EXECUTE ON FUNCTION update_content_search_vector TO authenticated;
