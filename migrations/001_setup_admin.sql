-- Drop existing policies first
DO $$ 
BEGIN
    EXECUTE (
        SELECT string_agg('DROP POLICY IF EXISTS "' || policyname || '" ON ' || tablename || ';', E'\n')
        FROM pg_policies 
        WHERE schemaname = 'public'
    );
END $$;

-- Ensure admin_users table exists with proper structure
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clerk_user_id TEXT NOT NULL UNIQUE,
    user_id UUID,
    metadata JSONB DEFAULT '{"role": "admin"}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create admin policies
CREATE POLICY "Admin users viewable by authenticated users"
ON admin_users FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable admin_users read for all"
ON admin_users FOR SELECT
USING (true);

CREATE POLICY "Allow insert from authenticated users"
ON admin_users FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admin users manageable by admins"
ON admin_users FOR ALL
USING (EXISTS (
    SELECT 1 FROM admin_users admin_users_1
    WHERE admin_users_1.clerk_user_id = auth.uid()::text
));

CREATE POLICY "Allow self-management"
ON admin_users FOR UPDATE
USING (
    clerk_user_id = auth.uid()::text
    OR EXISTS (
        SELECT 1 FROM admin_users au
        WHERE au.clerk_user_id = auth.uid()::text
        AND au.clerk_user_id <> admin_users.clerk_user_id
    )
);

CREATE POLICY "Allow deletion by admins"
ON admin_users FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM admin_users au
        WHERE au.clerk_user_id = auth.uid()::text
        AND au.clerk_user_id <> admin_users.clerk_user_id
    )
);

-- Create helper function for admin checks
CREATE OR REPLACE FUNCTION is_admin() 
RETURNS boolean 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE clerk_user_id = auth.uid()::text
  );
EXCEPTION
  WHEN undefined_table THEN
    RETURN FALSE;
END;
$$;

-- Insert the authenticated user as admin if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM admin_users 
        WHERE clerk_user_id = '73d744b2-5874-46e4-af4a-5dd20482a00e'
    ) THEN
        INSERT INTO admin_users (clerk_user_id, metadata)
        VALUES (
            '73d744b2-5874-46e4-af4a-5dd20482a00e',
            jsonb_build_object(
                'role', 'admin',
                'email', 'handywriterz@gmail.com',
                'created_at', NOW()
            )
        );
    END IF;
END $$;
