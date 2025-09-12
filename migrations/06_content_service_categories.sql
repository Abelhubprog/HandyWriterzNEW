-- Create services table
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT valid_service_slug CHECK (slug ~ '^[a-z0-9-]+$')
);

-- Create categories table with proper service relationship
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES categories(id),
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(service_id, slug),
    CONSTRAINT valid_category_slug CHECK (slug ~ '^[a-z0-9-]+$')
);

-- Create service requirements table
CREATE TABLE IF NOT EXISTS service_requirements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    is_required BOOLEAN DEFAULT false,
    validation_rules JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add service-specific meta fields
CREATE TABLE IF NOT EXISTS service_meta_fields (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    field_type VARCHAR(50) NOT NULL,
    label VARCHAR(255) NOT NULL,
    placeholder TEXT,
    help_text TEXT,
    validation_rules JSONB DEFAULT '{}'::jsonb,
    options JSONB DEFAULT '[]'::jsonb,
    is_required BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_categories_service_id ON categories(service_id);
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_service_requirements_service_id ON service_requirements(service_id);
CREATE INDEX IF NOT EXISTS idx_service_meta_fields_service_id ON service_meta_fields(service_id);

-- Insert default services
INSERT INTO services (name, slug, description, settings) VALUES
    ('Adult Health Nursing', 'adult-health-nursing', 'Content related to adult health nursing', '{"requireReview": true, "allowComments": true}'),
    ('Mental Health Nursing', 'mental-health-nursing', 'Content related to mental health nursing', '{"requireReview": true, "allowComments": true}'),
    ('Child Nursing', 'child-nursing', 'Content related to child nursing', '{"requireReview": true, "allowComments": true}'),
    ('Cryptocurrency', 'crypto', 'Content related to cryptocurrency and blockchain', '{"requireReview": true, "allowComments": true}'),
    ('Artificial Intelligence', 'ai', 'Content related to artificial intelligence and machine learning', '{"requireReview": true, "allowComments": true}')
ON CONFLICT (slug) DO NOTHING;

-- Insert default categories for each service
DO $$
DECLARE
    service_id UUID;
BEGIN
    -- Adult Health Nursing categories
    SELECT id INTO service_id FROM services WHERE slug = 'adult-health-nursing';
    IF FOUND THEN
        INSERT INTO categories (service_id, name, slug, description) VALUES
            (service_id, 'Clinical Practice', 'clinical-practice', 'Clinical practice guidelines and procedures'),
            (service_id, 'Patient Care', 'patient-care', 'Patient care and management'),
            (service_id, 'Medical Conditions', 'medical-conditions', 'Various medical conditions and treatments'),
            (service_id, 'Healthcare Management', 'healthcare-management', 'Healthcare management and administration')
        ON CONFLICT (service_id, slug) DO NOTHING;
    END IF;

    -- Mental Health Nursing categories
    SELECT id INTO service_id FROM services WHERE slug = 'mental-health-nursing';
    IF FOUND THEN
        INSERT INTO categories (service_id, name, slug, description) VALUES
            (service_id, 'Psychiatric Disorders', 'psychiatric-disorders', 'Information about psychiatric disorders'),
            (service_id, 'Therapeutic Approaches', 'therapeutic-approaches', 'Different therapeutic approaches'),
            (service_id, 'Mental Health Assessment', 'mental-health-assessment', 'Mental health assessment techniques'),
            (service_id, 'Crisis Intervention', 'crisis-intervention', 'Crisis intervention strategies')
        ON CONFLICT (service_id, slug) DO NOTHING;
    END IF;

    -- Child Nursing categories
    SELECT id INTO service_id FROM services WHERE slug = 'child-nursing';
    IF FOUND THEN
        INSERT INTO categories (service_id, name, slug, description) VALUES
            (service_id, 'Pediatric Care', 'pediatric-care', 'Pediatric care fundamentals'),
            (service_id, 'Child Development', 'child-development', 'Child development stages'),
            (service_id, 'Childhood Diseases', 'childhood-diseases', 'Common childhood diseases'),
            (service_id, 'Neonatal Care', 'neonatal-care', 'Neonatal care practices')
        ON CONFLICT (service_id, slug) DO NOTHING;
    END IF;

    -- Cryptocurrency categories
    SELECT id INTO service_id FROM services WHERE slug = 'crypto';
    IF FOUND THEN
        INSERT INTO categories (service_id, name, slug, description) VALUES
            (service_id, 'Blockchain Technology', 'blockchain', 'Blockchain technology fundamentals'),
            (service_id, 'Cryptocurrency Trading', 'trading', 'Cryptocurrency trading strategies'),
            (service_id, 'DeFi', 'defi', 'Decentralized Finance'),
            (service_id, 'NFTs', 'nfts', 'Non-Fungible Tokens')
        ON CONFLICT (service_id, slug) DO NOTHING;
    END IF;

    -- AI categories
    SELECT id INTO service_id FROM services WHERE slug = 'ai';
    IF FOUND THEN
        INSERT INTO categories (service_id, name, slug, description) VALUES
            (service_id, 'Machine Learning', 'machine-learning', 'Machine learning concepts and applications'),
            (service_id, 'Deep Learning', 'deep-learning', 'Deep learning and neural networks'),
            (service_id, 'Natural Language Processing', 'nlp', 'Natural Language Processing'),
            (service_id, 'Computer Vision', 'computer-vision', 'Computer Vision applications')
        ON CONFLICT (service_id, slug) DO NOTHING;
    END IF;
END $$;

-- Add service requirements
INSERT INTO service_requirements (service_id, name, type, is_required, validation_rules)
SELECT 
    s.id,
    'Content Quality',
    'validation',
    true,
    '{
        "minWordCount": 500,
        "requireImages": true,
        "requireReferences": true
    }'::jsonb
FROM services s;

-- Enable RLS
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_meta_fields ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Services are viewable by everyone" 
    ON services FOR SELECT 
    USING (true);

CREATE POLICY "Services are manageable by admins" 
    ON services FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM admin_users WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Categories are viewable by everyone" 
    ON categories FOR SELECT 
    USING (true);

CREATE POLICY "Categories are manageable by admins" 
    ON categories FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM admin_users WHERE user_id = auth.uid()
        )
    );

-- Update posts table to reference services table
ALTER TABLE posts 
    ADD COLUMN IF NOT EXISTS service_id UUID REFERENCES services(id),
    ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id);

-- Create trigger to update posts service_id and category_id
CREATE OR REPLACE FUNCTION update_post_references()
RETURNS TRIGGER AS $$
BEGIN
    -- Update service_id based on service_type
    IF NEW.service_type IS NOT NULL THEN
        SELECT id INTO NEW.service_id
        FROM services
        WHERE slug = NEW.service_type;
    END IF;

    -- Update category_id based on category and service_id
    IF NEW.category IS NOT NULL AND NEW.service_id IS NOT NULL THEN
        SELECT id INTO NEW.category_id
        FROM categories
        WHERE service_id = NEW.service_id
        AND (name = NEW.category OR slug = NEW.category);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_update_post_references
    BEFORE INSERT OR UPDATE ON posts
    FOR EACH ROW
    EXECUTE FUNCTION update_post_references();
