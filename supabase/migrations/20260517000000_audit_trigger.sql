-- Audit Trigger for timesheet manager edits
-- This trigger replicates the logic that was previously in the Express Node.js backend.

CREATE OR REPLACE FUNCTION handle_timesheet_audit()
RETURNS trigger AS $$
BEGIN
    -- Only run this logic if it is an UPDATE and the auth.uid() is not the owner of the timesheet
    IF TG_OP = 'UPDATE' THEN
        IF auth.uid() IS NOT NULL AND auth.uid() != NEW.user_id THEN
            -- It's a manager/admin editing the timesheet
            NEW.is_flagged = true;
            NEW.last_edited_by = auth.uid();
            
            -- If original_data is not set yet, take a snapshot of the old data
            IF OLD.original_data IS NULL THEN
                NEW.original_data = jsonb_build_object(
                    'title', OLD.title,
                    'details', OLD.details,
                    'notes', OLD.notes,
                    'start_time', OLD.start_time,
                    'end_time', OLD.end_time,
                    'total_duration_seconds', OLD.total_duration_seconds
                );
            END IF;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS tr_timesheet_audit ON timesheet_entries;

-- Create the trigger
CREATE TRIGGER tr_timesheet_audit
    BEFORE UPDATE ON timesheet_entries
    FOR EACH ROW
    EXECUTE FUNCTION handle_timesheet_audit();
