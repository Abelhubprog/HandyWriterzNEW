-- Create document uploads table
CREATE TABLE IF NOT EXISTS document_uploads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  filename TEXT NOT NULL,
  filesize INTEGER NOT NULL,
  filetype TEXT NOT NULL,
  upload_path TEXT NOT NULL,
  file_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_email TEXT NOT NULL,
  destination_email TEXT NOT NULL,
  notes TEXT,
  telegram_sent BOOLEAN DEFAULT FALSE,
  result_url TEXT,
  result_received_at TIMESTAMP WITH TIME ZONE
);

-- Create email notifications table
CREATE TABLE IF NOT EXISTS email_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID REFERENCES document_uploads(id),
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT
);

-- Create row level security policies
ALTER TABLE document_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for document_uploads
CREATE POLICY "Allow all users to insert documents" ON document_uploads
  FOR INSERT WITH CHECK (true);
  
CREATE POLICY "Allow users to view their own documents" ON document_uploads
  FOR SELECT USING (auth.email() = user_email);
  
CREATE POLICY "Allow admin to view all documents" ON document_uploads
  FOR SELECT USING (auth.email() IN (SELECT email FROM admin_users));

-- Create policies for email_notifications
CREATE POLICY "Allow all for email_notifications" ON email_notifications
  FOR ALL USING (true);

-- Create function to process email notifications
CREATE OR REPLACE FUNCTION process_pending_emails()
RETURNS TRIGGER AS $$
BEGIN
  -- This function would be expanded to integrate with your email service
  -- For now, it just marks the status as 'processing'
  UPDATE email_notifications
  SET status = 'processing'
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call this function on new email notifications
CREATE TRIGGER process_email_after_insert
AFTER INSERT ON email_notifications
FOR EACH ROW
EXECUTE FUNCTION process_pending_emails();

-- Create an index for faster queries
CREATE INDEX IF NOT EXISTS document_uploads_user_email_idx ON document_uploads(user_email);
CREATE INDEX IF NOT EXISTS document_uploads_status_idx ON document_uploads(status);
CREATE INDEX IF NOT EXISTS email_notifications_status_idx ON email_notifications(status);
