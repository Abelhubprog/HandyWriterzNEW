-- Migration 011: Document Submissions Table
-- Handles document submissions from users to admin with full workflow support

-- Create document_submissions table
CREATE TABLE IF NOT EXISTS document_submissions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  order_id TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  
  -- Order details
  service_type TEXT NOT NULL,
  subject_area TEXT NOT NULL,
  word_count INTEGER NOT NULL DEFAULT 0,
  study_level TEXT NOT NULL,
  due_date TEXT NOT NULL,
  module TEXT,
  instructions TEXT,
  price REAL DEFAULT 0,
  
  -- File information (JSON array)
  files TEXT NOT NULL, -- JSON array of file objects
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'submitted', -- submitted, assigned, in_progress, completed, rejected
  assigned_writer_id TEXT,
  assigned_at TEXT,
  
  -- Email tracking
  admin_notified BOOLEAN DEFAULT FALSE,
  admin_email_id TEXT,
  customer_email_id TEXT,
  
  -- Timestamps
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  
  -- Admin response
  admin_response TEXT,
  admin_responded_at TEXT,
  
  -- Completion details
  completed_at TEXT,
  completion_files TEXT, -- JSON array of completed files
  
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (assigned_writer_id) REFERENCES admin_users(user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_document_submissions_user_id ON document_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_document_submissions_order_id ON document_submissions(order_id);
CREATE INDEX IF NOT EXISTS idx_document_submissions_status ON document_submissions(status);
CREATE INDEX IF NOT EXISTS idx_document_submissions_created_at ON document_submissions(created_at);
CREATE INDEX IF NOT EXISTS idx_document_submissions_assigned_writer ON document_submissions(assigned_writer_id);
CREATE INDEX IF NOT EXISTS idx_document_submissions_due_date ON document_submissions(due_date);

-- Create status_updates table for tracking order status changes
CREATE TABLE IF NOT EXISTS status_updates (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  status TEXT NOT NULL,
  previous_status TEXT,
  updated_by TEXT, -- admin user who made the change
  notes TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  email_sent BOOLEAN DEFAULT FALSE,
  email_id TEXT,
  
  FOREIGN KEY (order_id) REFERENCES document_submissions(order_id),
  FOREIGN KEY (updated_by) REFERENCES admin_users(user_id)
);

-- Create indexes for status_updates
CREATE INDEX IF NOT EXISTS idx_status_updates_order_id ON status_updates(order_id);
CREATE INDEX IF NOT EXISTS idx_status_updates_status ON status_updates(status);
CREATE INDEX IF NOT EXISTS idx_status_updates_updated_at ON status_updates(updated_at);

-- Create document_downloads table for tracking file downloads by admin
CREATE TABLE IF NOT EXISTS document_downloads (
  id TEXT PRIMARY KEY,
  submission_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  downloaded_by TEXT NOT NULL, -- admin user ID
  downloaded_at TEXT NOT NULL DEFAULT (datetime('now')),
  download_ip TEXT,
  
  FOREIGN KEY (submission_id) REFERENCES document_submissions(id),
  FOREIGN KEY (downloaded_by) REFERENCES admin_users(user_id)
);

-- Create indexes for document_downloads
CREATE INDEX IF NOT EXISTS idx_document_downloads_submission_id ON document_downloads(submission_id);
CREATE INDEX IF NOT EXISTS idx_document_downloads_downloaded_by ON document_downloads(downloaded_by);
CREATE INDEX IF NOT EXISTS idx_document_downloads_downloaded_at ON document_downloads(downloaded_at);

-- Create admin_responses table for admin messages to users
CREATE TABLE IF NOT EXISTS admin_responses (
  id TEXT PRIMARY KEY,
  submission_id TEXT NOT NULL,
  admin_user_id TEXT NOT NULL,
  message TEXT NOT NULL,
  response_type TEXT NOT NULL DEFAULT 'message', -- message, file_request, status_update
  attachment_files TEXT, -- JSON array of file objects
  sent_at TEXT NOT NULL DEFAULT (datetime('now')),
  read_by_customer BOOLEAN DEFAULT FALSE,
  read_at TEXT,
  email_sent BOOLEAN DEFAULT FALSE,
  email_id TEXT,
  
  FOREIGN KEY (submission_id) REFERENCES document_submissions(id),
  FOREIGN KEY (admin_user_id) REFERENCES admin_users(user_id)
);

-- Create indexes for admin_responses
CREATE INDEX IF NOT EXISTS idx_admin_responses_submission_id ON admin_responses(submission_id);
CREATE INDEX IF NOT EXISTS idx_admin_responses_admin_user_id ON admin_responses(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_responses_sent_at ON admin_responses(sent_at);
CREATE INDEX IF NOT EXISTS idx_admin_responses_read_by_customer ON admin_responses(read_by_customer);

-- Create triggers to update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS update_document_submissions_updated_at
  AFTER UPDATE ON document_submissions
  BEGIN
    UPDATE document_submissions 
    SET updated_at = datetime('now') 
    WHERE id = NEW.id;
  END;

-- Create a view for admin dashboard to easily see pending submissions
CREATE VIEW IF NOT EXISTS pending_submissions AS
SELECT 
  ds.*,
  au.name AS assigned_writer_name,
  COUNT(dr.id) AS download_count,
  COUNT(ar.id) AS response_count
FROM document_submissions ds
LEFT JOIN admin_users au ON ds.assigned_writer_id = au.user_id
LEFT JOIN document_downloads dr ON ds.id = dr.submission_id
LEFT JOIN admin_responses ar ON ds.id = ar.submission_id
WHERE ds.status IN ('submitted', 'assigned', 'in_progress')
GROUP BY ds.id, au.name;

-- Create a view for user dashboard to see their submission history
CREATE VIEW IF NOT EXISTS user_submission_history AS
SELECT 
  ds.id,
  ds.order_id,
  ds.service_type,
  ds.subject_area,
  ds.word_count,
  ds.study_level,
  ds.due_date,
  ds.status,
  ds.created_at,
  ds.updated_at,
  COUNT(ar.id) AS admin_responses_count,
  MAX(ar.sent_at) AS last_admin_response,
  COUNT(CASE WHEN ar.read_by_customer = FALSE THEN 1 END) AS unread_responses
FROM document_submissions ds
LEFT JOIN admin_responses ar ON ds.id = ar.submission_id
GROUP BY ds.id;

-- Insert sample data for development/testing (optional)
-- This will be populated by the application in production
INSERT OR IGNORE INTO document_submissions (
  id, user_id, order_id, customer_name, customer_email,
  service_type, subject_area, word_count, study_level, due_date,
  module, instructions, files, status
) VALUES (
  'sample_submission_1',
  'user_123',
  'ORD-' || strftime('%s', 'now') || '-001',
  'John Doe',
  'john.doe@example.com',
  'Essay Writing',
  'Adult Health Nursing',
  2500,
  'Level 6',
  date('now', '+7 days'),
  'NUR301',
  'Please write an essay on evidence-based practice in adult health nursing.',
  '[]',
  'submitted'
);