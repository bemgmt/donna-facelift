-- Email Enhancements Migration Script
-- Adds new tables for enhanced email functionality including templates, metadata, and campaigns

-- Enable pgcrypto extension for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Email Templates Table
CREATE TABLE IF NOT EXISTS email_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    subject_template TEXT NOT NULL,
    body_template TEXT NOT NULL,
    template_type TEXT NOT NULL CHECK (template_type IN ('personal', 'campaign')),
    variables JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Message Metadata Table
CREATE TABLE IF NOT EXISTS message_metadata (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    gmail_message_id TEXT NOT NULL,
    category TEXT DEFAULT 'personal',
    priority_level TEXT DEFAULT 'medium' CHECK (priority_level IN ('high', 'medium', 'low', 'none')),
    custom_tags JSONB DEFAULT '[]',
    campaign_id UUID REFERENCES email_campaigns(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, gmail_message_id)
);

-- Email Campaigns Table
CREATE TABLE IF NOT EXISTS email_campaigns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
    target_label TEXT,
    email_sequence JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Campaign Email Steps Table
CREATE TABLE IF NOT EXISTS campaign_email_steps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_id UUID NOT NULL REFERENCES email_campaigns(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    delay_days INTEGER DEFAULT 0,
    subject_template TEXT NOT NULL,
    body_template TEXT NOT NULL,
    trigger_type TEXT DEFAULT 'time' CHECK (trigger_type IN ('time', 'action', 'condition')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(campaign_id, step_number)
);

-- Add autopilot_enabled column to users table if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'autopilot_enabled') THEN
        ALTER TABLE users ADD COLUMN autopilot_enabled BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_templates_user_id ON email_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_email_templates_type ON email_templates(template_type);
CREATE INDEX IF NOT EXISTS idx_message_metadata_user_id ON message_metadata(user_id);
CREATE INDEX IF NOT EXISTS idx_message_metadata_gmail_id ON message_metadata(gmail_message_id);
CREATE INDEX IF NOT EXISTS idx_message_metadata_category ON message_metadata(category);
CREATE INDEX IF NOT EXISTS idx_message_metadata_priority ON message_metadata(priority_level);
CREATE INDEX IF NOT EXISTS idx_message_metadata_campaign ON message_metadata(campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_user_id ON email_campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaign_steps_campaign_id ON campaign_email_steps(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_steps_step_number ON campaign_email_steps(step_number);

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
DROP TRIGGER IF EXISTS update_email_templates_updated_at ON email_templates;
CREATE TRIGGER update_email_templates_updated_at
    BEFORE UPDATE ON email_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_message_metadata_updated_at ON message_metadata;
CREATE TRIGGER update_message_metadata_updated_at
    BEFORE UPDATE ON message_metadata
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_email_campaigns_updated_at ON email_campaigns;
CREATE TRIGGER update_email_campaigns_updated_at
    BEFORE UPDATE ON email_campaigns
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_campaign_email_steps_updated_at ON campaign_email_steps;
CREATE TRIGGER update_campaign_email_steps_updated_at
    BEFORE UPDATE ON campaign_email_steps
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies for security
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_email_steps ENABLE ROW LEVEL SECURITY;

-- Email Templates RLS Policies
CREATE POLICY "Users can view their own templates" ON email_templates
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own templates" ON email_templates
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own templates" ON email_templates
    FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own templates" ON email_templates
    FOR DELETE USING (auth.uid()::text = user_id);

-- Message Metadata RLS Policies
CREATE POLICY "Users can view their own message metadata" ON message_metadata
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own message metadata" ON message_metadata
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own message metadata" ON message_metadata
    FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own message metadata" ON message_metadata
    FOR DELETE USING (auth.uid()::text = user_id);

-- Email Campaigns RLS Policies
CREATE POLICY "Users can view their own campaigns" ON email_campaigns
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own campaigns" ON email_campaigns
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own campaigns" ON email_campaigns
    FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own campaigns" ON email_campaigns
    FOR DELETE USING (auth.uid()::text = user_id);

-- Campaign Email Steps RLS Policies
CREATE POLICY "Users can view their own campaign steps" ON campaign_email_steps
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM email_campaigns 
            WHERE email_campaigns.id = campaign_email_steps.campaign_id 
            AND email_campaigns.user_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can insert their own campaign steps" ON campaign_email_steps
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM email_campaigns 
            WHERE email_campaigns.id = campaign_email_steps.campaign_id 
            AND email_campaigns.user_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can update their own campaign steps" ON campaign_email_steps
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM email_campaigns 
            WHERE email_campaigns.id = campaign_email_steps.campaign_id 
            AND email_campaigns.user_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can delete their own campaign steps" ON campaign_email_steps
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM email_campaigns 
            WHERE email_campaigns.id = campaign_email_steps.campaign_id 
            AND email_campaigns.user_id = auth.uid()::text
        )
    );
