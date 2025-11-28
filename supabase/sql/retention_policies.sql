-- Database-based retention and cleanup policies
-- Replaces file-based cleanup scripts with database functions and scheduled jobs

-- Function to cleanup expired user memory entries
CREATE OR REPLACE FUNCTION cleanup_expired_memory()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM user_memory 
    WHERE expires_at IS NOT NULL AND expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Log cleanup activity
    INSERT INTO system_logs (log_level, message, metadata, created_at)
    VALUES ('info', 'Cleaned up expired user memory entries', 
            json_build_object('deleted_count', deleted_count), NOW());
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup old chat sessions (inactive for more than 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_chat_sessions(retention_days INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
    cutoff_date TIMESTAMP WITH TIME ZONE;
BEGIN
    cutoff_date := NOW() - INTERVAL '1 day' * retention_days;
    
    -- Delete messages first (cascade)
    DELETE FROM messages 
    WHERE chat_session_id IN (
        SELECT id FROM chat_sessions 
        WHERE last_message_at < cutoff_date OR 
              (last_message_at IS NULL AND created_at < cutoff_date)
    );
    
    -- Delete old chat sessions
    DELETE FROM chat_sessions 
    WHERE last_message_at < cutoff_date OR 
          (last_message_at IS NULL AND created_at < cutoff_date);
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Log cleanup activity
    INSERT INTO system_logs (log_level, message, metadata, created_at)
    VALUES ('info', 'Cleaned up old chat sessions', 
            json_build_object('deleted_count', deleted_count, 'retention_days', retention_days), NOW());
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup orphaned messages (messages without valid chat sessions)
CREATE OR REPLACE FUNCTION cleanup_orphaned_messages()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM messages 
    WHERE chat_session_id NOT IN (SELECT id FROM chat_sessions);
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Log cleanup activity
    INSERT INTO system_logs (log_level, message, metadata, created_at)
    VALUES ('info', 'Cleaned up orphaned messages', 
            json_build_object('deleted_count', deleted_count), NOW());
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup old system logs (older than 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_logs(retention_days INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
    cutoff_date TIMESTAMP WITH TIME ZONE;
BEGIN
    cutoff_date := NOW() - INTERVAL '1 day' * retention_days;
    
    DELETE FROM system_logs 
    WHERE created_at < cutoff_date;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Log cleanup activity (but don't create infinite loop)
    IF deleted_count > 0 THEN
        INSERT INTO system_logs (log_level, message, metadata, created_at)
        VALUES ('info', 'Cleaned up old system logs', 
                json_build_object('deleted_count', deleted_count, 'retention_days', retention_days), NOW());
    END IF;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to archive old data before deletion
CREATE OR REPLACE FUNCTION archive_old_data(retention_days INTEGER DEFAULT 365)
RETURNS INTEGER AS $$
DECLARE
    archived_count INTEGER := 0;
    cutoff_date TIMESTAMP WITH TIME ZONE;
BEGIN
    cutoff_date := NOW() - INTERVAL '1 day' * retention_days;
    
    -- Create archive tables if they don't exist
    CREATE TABLE IF NOT EXISTS archived_chat_sessions (LIKE chat_sessions INCLUDING ALL);
    CREATE TABLE IF NOT EXISTS archived_messages (LIKE messages INCLUDING ALL);
    CREATE TABLE IF NOT EXISTS archived_user_memory (LIKE user_memory INCLUDING ALL);
    
    -- Archive old chat sessions
    INSERT INTO archived_chat_sessions 
    SELECT * FROM chat_sessions 
    WHERE created_at < cutoff_date;
    
    GET DIAGNOSTICS archived_count = ROW_COUNT;
    
    -- Archive old messages
    INSERT INTO archived_messages 
    SELECT * FROM messages 
    WHERE created_at < cutoff_date;
    
    -- Archive old user memory
    INSERT INTO archived_user_memory 
    SELECT * FROM user_memory 
    WHERE created_at < cutoff_date;
    
    -- Log archival activity
    INSERT INTO system_logs (log_level, message, metadata, created_at)
    VALUES ('info', 'Archived old data', 
            json_build_object('archived_sessions', archived_count, 'retention_days', retention_days), NOW());
    
    RETURN archived_count;
END;
$$ LANGUAGE plpgsql;

-- Function to perform comprehensive cleanup
CREATE OR REPLACE FUNCTION perform_maintenance_cleanup()
RETURNS JSON AS $$
DECLARE
    result JSON;
    expired_memory_count INTEGER;
    old_sessions_count INTEGER;
    orphaned_messages_count INTEGER;
    old_logs_count INTEGER;
BEGIN
    -- Cleanup expired memory
    SELECT cleanup_expired_memory() INTO expired_memory_count;
    
    -- Cleanup old chat sessions (90 days)
    SELECT cleanup_old_chat_sessions(90) INTO old_sessions_count;
    
    -- Cleanup orphaned messages
    SELECT cleanup_orphaned_messages() INTO orphaned_messages_count;
    
    -- Cleanup old logs (30 days)
    SELECT cleanup_old_logs(30) INTO old_logs_count;
    
    -- Build result JSON
    result := json_build_object(
        'expired_memory_cleaned', expired_memory_count,
        'old_sessions_cleaned', old_sessions_count,
        'orphaned_messages_cleaned', orphaned_messages_count,
        'old_logs_cleaned', old_logs_count,
        'cleanup_timestamp', NOW()
    );
    
    -- Log comprehensive cleanup
    INSERT INTO system_logs (log_level, message, metadata, created_at)
    VALUES ('info', 'Performed comprehensive maintenance cleanup', result, NOW());
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to get cleanup statistics
CREATE OR REPLACE FUNCTION get_cleanup_stats()
RETURNS JSON AS $$
DECLARE
    stats JSON;
BEGIN
    SELECT json_build_object(
        'total_users', (SELECT COUNT(*) FROM users),
        'total_chat_sessions', (SELECT COUNT(*) FROM chat_sessions),
        'total_messages', (SELECT COUNT(*) FROM messages),
        'total_user_memory', (SELECT COUNT(*) FROM user_memory),
        'expired_memory_entries', (SELECT COUNT(*) FROM user_memory WHERE expires_at IS NOT NULL AND expires_at < NOW()),
        'old_chat_sessions_90d', (SELECT COUNT(*) FROM chat_sessions WHERE last_message_at < NOW() - INTERVAL '90 days'),
        'orphaned_messages', (SELECT COUNT(*) FROM messages WHERE chat_session_id NOT IN (SELECT id FROM chat_sessions)),
        'old_logs_30d', (SELECT COUNT(*) FROM system_logs WHERE created_at < NOW() - INTERVAL '30 days'),
        'stats_timestamp', NOW()
    ) INTO stats;
    
    RETURN stats;
END;
$$ LANGUAGE plpgsql;

-- Create system_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS system_logs (
    id BIGSERIAL PRIMARY KEY,
    log_level VARCHAR(20) NOT NULL DEFAULT 'info',
    message TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for system_logs
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON system_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_system_logs_level ON system_logs(log_level);

-- Grant permissions to authenticated users
GRANT EXECUTE ON FUNCTION cleanup_expired_memory() TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_chat_sessions(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_orphaned_messages() TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_logs(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION archive_old_data(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION perform_maintenance_cleanup() TO authenticated;
GRANT EXECUTE ON FUNCTION get_cleanup_stats() TO authenticated;

-- Grant table permissions
GRANT SELECT, INSERT ON system_logs TO authenticated;

-- Create a scheduled job using pg_cron (if available)
-- Note: This requires the pg_cron extension to be enabled
-- SELECT cron.schedule('cleanup-expired-memory', '0 2 * * *', 'SELECT cleanup_expired_memory();');
-- SELECT cron.schedule('cleanup-old-sessions', '0 3 * * 0', 'SELECT cleanup_old_chat_sessions(90);');
-- SELECT cron.schedule('cleanup-orphaned-messages', '0 4 * * 0', 'SELECT cleanup_orphaned_messages();');
-- SELECT cron.schedule('cleanup-old-logs', '0 5 * * 0', 'SELECT cleanup_old_logs(30);');

-- Alternative: Create a trigger to automatically cleanup expired memory on insert
CREATE OR REPLACE FUNCTION trigger_cleanup_expired_memory()
RETURNS TRIGGER AS $$
BEGIN
    -- Randomly cleanup expired memory (1% chance on each insert)
    IF random() < 0.01 THEN
        PERFORM cleanup_expired_memory();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on user_memory table
DROP TRIGGER IF EXISTS auto_cleanup_expired_memory ON user_memory;
CREATE TRIGGER auto_cleanup_expired_memory
    AFTER INSERT ON user_memory
    FOR EACH ROW
    EXECUTE FUNCTION trigger_cleanup_expired_memory();

-- Comments for documentation
COMMENT ON FUNCTION cleanup_expired_memory() IS 'Removes expired user memory entries and returns count';
COMMENT ON FUNCTION cleanup_old_chat_sessions(INTEGER) IS 'Removes chat sessions older than specified days (default 90)';
COMMENT ON FUNCTION cleanup_orphaned_messages() IS 'Removes messages without valid chat sessions';
COMMENT ON FUNCTION cleanup_old_logs(INTEGER) IS 'Removes system logs older than specified days (default 30)';
COMMENT ON FUNCTION archive_old_data(INTEGER) IS 'Archives data older than specified days before cleanup';
COMMENT ON FUNCTION perform_maintenance_cleanup() IS 'Performs comprehensive cleanup and returns statistics';
COMMENT ON FUNCTION get_cleanup_stats() IS 'Returns current database cleanup statistics';
COMMENT ON TABLE system_logs IS 'System logs for tracking cleanup and maintenance activities';
