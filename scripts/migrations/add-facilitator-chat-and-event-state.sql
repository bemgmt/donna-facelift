-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Facilitator Chat Table for Live Simulation
CREATE TABLE IF NOT EXISTS donna_drive_facilitator_chats (
    id VARCHAR(255) PRIMARY KEY,
    org_id VARCHAR(255) NOT NULL REFERENCES donna_drive_organizations(id) ON DELETE CASCADE,
    member_id VARCHAR(255) NOT NULL REFERENCES donna_drive_members(id) ON DELETE CASCADE,
    sender VARCHAR(50) NOT NULL CHECK (sender IN ('attendee', 'facilitator')),
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_dd_facilitator_chats_org ON donna_drive_facilitator_chats(org_id);
CREATE INDEX IF NOT EXISTS idx_dd_facilitator_chats_member ON donna_drive_facilitator_chats(member_id);
CREATE INDEX IF NOT EXISTS idx_dd_facilitator_chats_created ON donna_drive_facilitator_chats(created_at ASC);
