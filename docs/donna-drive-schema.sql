-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- DONNA Drive Organizations
CREATE TABLE IF NOT EXISTS donna_drive_organizations (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    property_name VARCHAR(255),
    property_value VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- DONNA Drive Roles
CREATE TABLE IF NOT EXISTS donna_drive_roles (
    id VARCHAR(255) PRIMARY KEY,
    slug VARCHAR(100) NOT NULL,
    label VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    color VARCHAR(50),
    org_id VARCHAR(255) REFERENCES donna_drive_organizations(id) ON DELETE CASCADE,
    UNIQUE(org_id, slug)
);

-- DONNA Drive Members
CREATE TABLE IF NOT EXISTS donna_drive_members (
    id VARCHAR(255) PRIMARY KEY,
    org_id VARCHAR(255) REFERENCES donna_drive_organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    role_id VARCHAR(255) REFERENCES donna_drive_roles(id) ON DELETE CASCADE,
    display_name VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    industry VARCHAR(100),
    is_facilitator BOOLEAN DEFAULT FALSE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- DONNA Drive Contacts
CREATE TABLE IF NOT EXISTS donna_drive_contacts (
    id VARCHAR(255) PRIMARY KEY,
    org_id VARCHAR(255) REFERENCES donna_drive_organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    title VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    company VARCHAR(255),
    role_slug VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- DONNA Drive Emails
CREATE TABLE IF NOT EXISTS donna_drive_emails (
    id VARCHAR(255) PRIMARY KEY,
    org_id VARCHAR(255) REFERENCES donna_drive_organizations(id) ON DELETE CASCADE,
    from_role VARCHAR(100),
    to_role VARCHAR(100),
    subject VARCHAR(255),
    body TEXT,
    read BOOLEAN DEFAULT FALSE,
    starred BOOLEAN DEFAULT FALSE,
    thread_id VARCHAR(255),
    in_reply_to VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- DONNA Drive Tasks
CREATE TABLE IF NOT EXISTS donna_drive_tasks (
    id VARCHAR(255) PRIMARY KEY,
    org_id VARCHAR(255) REFERENCES donna_drive_organizations(id) ON DELETE CASCADE,
    assigned_to VARCHAR(100),
    title VARCHAR(255),
    description TEXT,
    status VARCHAR(50),
    priority VARCHAR(50),
    due_date TIMESTAMP WITH TIME ZONE,
    dependency_task_ids JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- DONNA Drive Documents
CREATE TABLE IF NOT EXISTS donna_drive_documents (
    id VARCHAR(255) PRIMARY KEY,
    org_id VARCHAR(255) REFERENCES donna_drive_organizations(id) ON DELETE CASCADE,
    name VARCHAR(255),
    type VARCHAR(50),
    size_kb INTEGER,
    uploaded_by VARCHAR(100),
    status VARCHAR(50),
    version VARCHAR(50),
    version_history JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- DONNA Drive Calendar Events
CREATE TABLE IF NOT EXISTS donna_drive_calendar_events (
    id VARCHAR(255) PRIMARY KEY,
    org_id VARCHAR(255) REFERENCES donna_drive_organizations(id) ON DELETE CASCADE,
    title VARCHAR(255),
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    location VARCHAR(255),
    attendees JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- DONNA Drive Notifications
CREATE TABLE IF NOT EXISTS donna_drive_notifications (
    id VARCHAR(255) PRIMARY KEY,
    org_id VARCHAR(255) REFERENCES donna_drive_organizations(id) ON DELETE CASCADE,
    target_role VARCHAR(100),
    title VARCHAR(255),
    body TEXT,
    type VARCHAR(50),
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- DONNA Drive DIN Bid Requests
CREATE TABLE IF NOT EXISTS donna_drive_din_bid_requests (
    id VARCHAR(255) PRIMARY KEY,
    org_id VARCHAR(255) REFERENCES donna_drive_organizations(id) ON DELETE CASCADE,
    requested_by VARCHAR(100),
    service_type VARCHAR(100),
    title VARCHAR(255),
    description TEXT,
    status VARCHAR(50),
    due_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- DONNA Drive DIN Bid Responses
CREATE TABLE IF NOT EXISTS donna_drive_din_bid_responses (
    id VARCHAR(255) PRIMARY KEY,
    org_id VARCHAR(255) REFERENCES donna_drive_organizations(id) ON DELETE CASCADE,
    request_id VARCHAR(255) REFERENCES donna_drive_din_bid_requests(id) ON DELETE CASCADE,
    vendor_role VARCHAR(100),
    amount NUMERIC,
    proposal_notes TEXT,
    status VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
