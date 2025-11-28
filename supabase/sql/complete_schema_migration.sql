-- Complete Schema Migration for Donna Interactive
-- This script extends the current mvp_schema.sql to include all columns expected by PostgreSQLDataAccess.php

-- Add missing columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS name VARCHAR(255),
ADD COLUMN IF NOT EXISTS profile JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';

-- Add missing columns to chat_sessions table
ALTER TABLE chat_sessions 
ADD COLUMN IF NOT EXISTS title VARCHAR(500),
ADD COLUMN IF NOT EXISTS profile VARCHAR(255),
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS last_message_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS message_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';

-- Add missing columns to messages table
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS sequence_number INTEGER,
ADD COLUMN IF NOT EXISTS token_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS abuse_flagged BOOLEAN DEFAULT FALSE;

-- Add missing columns to user_memory table
ALTER TABLE user_memory 
ADD COLUMN IF NOT EXISTS memory_type VARCHAR(100) DEFAULT 'general',
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

-- Create indexes for performance on new columns
CREATE INDEX IF NOT EXISTS idx_users_last_active ON users(last_active_at);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_last_message ON chat_sessions(last_message_at);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_status ON chat_sessions(status);
CREATE INDEX IF NOT EXISTS idx_messages_sequence ON messages(chat_session_id, sequence_number);
CREATE INDEX IF NOT EXISTS idx_messages_token_count ON messages(token_count);
CREATE INDEX IF NOT EXISTS idx_user_memory_type ON user_memory(memory_type);
CREATE INDEX IF NOT EXISTS idx_user_memory_expires ON user_memory(expires_at);

-- Create cleanup function for expired memory
CREATE OR REPLACE FUNCTION cleanup_expired_memory()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM user_memory 
    WHERE expires_at IS NOT NULL AND expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Add constraints for data integrity
ALTER TABLE messages 
ADD CONSTRAINT chk_messages_sequence_positive 
CHECK (sequence_number IS NULL OR sequence_number > 0);

ALTER TABLE messages 
ADD CONSTRAINT chk_messages_token_count_positive 
CHECK (token_count >= 0);

ALTER TABLE chat_sessions 
ADD CONSTRAINT chk_chat_sessions_message_count_positive 
CHECK (message_count >= 0);

-- Update existing records with default values where needed
UPDATE users SET 
    last_active_at = COALESCE(last_active_at, created_at),
    status = COALESCE(status, 'active')
WHERE last_active_at IS NULL OR status IS NULL;

UPDATE chat_sessions SET 
    last_message_at = COALESCE(last_message_at, created_at),
    message_count = COALESCE(message_count, 0),
    status = COALESCE(status, 'active')
WHERE last_message_at IS NULL OR message_count IS NULL OR status IS NULL;

UPDATE messages SET 
    token_count = COALESCE(token_count, 0),
    abuse_flagged = COALESCE(abuse_flagged, FALSE)
WHERE token_count IS NULL OR abuse_flagged IS NULL;

-- Create sequence for message ordering within chat sessions
CREATE SEQUENCE IF NOT EXISTS message_sequence_seq;

-- Function to auto-assign sequence numbers to new messages
CREATE OR REPLACE FUNCTION assign_message_sequence()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.sequence_number IS NULL THEN
        SELECT COALESCE(MAX(sequence_number), 0) + 1 
        INTO NEW.sequence_number 
        FROM messages 
        WHERE chat_session_id = NEW.chat_session_id;
    END IF;
    
    -- Update chat session message count and last message time
    UPDATE chat_sessions 
    SET message_count = message_count + 1,
        last_message_at = NEW.created_at
    WHERE id = NEW.chat_session_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-assigning sequence numbers
DROP TRIGGER IF EXISTS trigger_assign_message_sequence ON messages;
CREATE TRIGGER trigger_assign_message_sequence
    BEFORE INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION assign_message_sequence();

-- Create function to update user last_active_at
CREATE OR REPLACE FUNCTION update_user_last_active()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE users 
    SET last_active_at = NOW()
    WHERE id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update user activity on new messages
DROP TRIGGER IF EXISTS trigger_update_user_activity ON messages;
CREATE TRIGGER trigger_update_user_activity
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_user_last_active();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION cleanup_expired_memory() TO authenticated;
GRANT EXECUTE ON FUNCTION assign_message_sequence() TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_last_active() TO authenticated;

-- Create view for user statistics
CREATE OR REPLACE VIEW user_stats AS
SELECT 
    u.id,
    u.email,
    u.name,
    u.status,
    u.last_active_at,
    COUNT(DISTINCT cs.id) as total_chat_sessions,
    COUNT(DISTINCT m.id) as total_messages,
    COUNT(DISTINCT um.id) as total_memories
FROM users u
LEFT JOIN chat_sessions cs ON u.id = cs.user_id
LEFT JOIN messages m ON cs.id = m.chat_session_id
LEFT JOIN user_memory um ON u.id = um.user_id
GROUP BY u.id, u.email, u.name, u.status, u.last_active_at;

-- Grant access to the view
GRANT SELECT ON user_stats TO authenticated;

COMMENT ON TABLE users IS 'Extended user table with profile, preferences, and activity tracking';
COMMENT ON TABLE chat_sessions IS 'Extended chat sessions with metadata and statistics';
COMMENT ON TABLE messages IS 'Extended messages with sequence numbers and token counting';
COMMENT ON TABLE user_memory IS 'Extended user memory with types and expiration';
COMMENT ON FUNCTION cleanup_expired_memory() IS 'Removes expired user memory entries and returns count';
