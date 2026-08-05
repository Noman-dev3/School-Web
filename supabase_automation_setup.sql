-- =================================================================================
-- PIISS AUTOMATION SETUP SQL
-- Run this entire script in your Supabase SQL Editor.
-- =================================================================================

-- ---------------------------------------------------------------------------------
-- 1. ENABLE EXTENSIONS
-- ---------------------------------------------------------------------------------
-- Ensure pg_cron is available (Required for scheduled tasks)
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;


-- ---------------------------------------------------------------------------------
-- 2. CREATE AUDIT LOGS TABLE & TRIGGERS
-- ---------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL,
    record_id TEXT NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_data JSONB,
    new_data JSONB,
    changed_by TEXT, -- Optional, if we want to track the user who did it
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function to handle the audit trigger
CREATE OR REPLACE FUNCTION public.audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO public.audit_logs (table_name, record_id, action, old_data, changed_by)
        VALUES (TG_TABLE_NAME, OLD.id::TEXT, 'DELETE', row_to_json(OLD)::JSONB, current_setting('request.jwt.claim.sub', true));
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO public.audit_logs (table_name, record_id, action, old_data, new_data, changed_by)
        VALUES (TG_TABLE_NAME, NEW.id::TEXT, 'UPDATE', row_to_json(OLD)::JSONB, row_to_json(NEW)::JSONB, current_setting('request.jwt.claim.sub', true));
        RETURN NEW;
    ELSIF (TG_OP = 'INSERT') THEN
        INSERT INTO public.audit_logs (table_name, record_id, action, new_data, changed_by)
        VALUES (TG_TABLE_NAME, NEW.id::TEXT, 'INSERT', row_to_json(NEW)::JSONB, current_setting('request.jwt.claim.sub', true));
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add triggers to critical tables
DO $$
BEGIN
    -- For Fees
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_fees_trigger') THEN
        CREATE TRIGGER audit_fees_trigger
        AFTER INSERT OR UPDATE OR DELETE ON public.fees
        FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();
    END IF;

    -- For Students
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_students_trigger') THEN
        CREATE TRIGGER audit_students_trigger
        AFTER INSERT OR UPDATE OR DELETE ON public.students
        FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();
    END IF;

    -- For Results
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_results_trigger') THEN
        CREATE TRIGGER audit_results_trigger
        AFTER INSERT OR UPDATE OR DELETE ON public.results
        FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();
    END IF;
END $$;


-- ---------------------------------------------------------------------------------
-- 3. AUTOMATED LATE FEE CRON JOB
-- ---------------------------------------------------------------------------------
-- Function to apply late fees to overdue records
CREATE OR REPLACE FUNCTION public.apply_late_fees()
RETURNS VOID AS $$
DECLARE
    late_fee_amount INT := 500; -- Change this to the penalty amount you want
BEGIN
    -- Update fees that are pending and due_date has passed (assuming we add a due_date column, or using month_year logic)
    -- Since we only have month_year right now, let's say the due date is the 10th of that month_year.
    UPDATE public.fees
    SET 
        status = 'overdue',
        -- We can add late fee into custom_fields or add a specific column.
        -- For now, let's just append to custom_fields JSON array.
        custom_fields = COALESCE(custom_fields, '[]'::jsonb) || jsonb_build_object('id', gen_random_uuid(), 'name', 'Late Fee Penalty', 'amount', late_fee_amount),
        total_amount = total_amount + late_fee_amount
    WHERE status = 'pending' 
      AND TO_DATE('10 ' || month_year, 'DD Month YYYY') < CURRENT_DATE
      -- Ensure we don't apply it multiple times (check if Late Fee is already in custom_fields)
      AND NOT (custom_fields @> '[{"name": "Late Fee Penalty"}]');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule the late fee checker to run every day at midnight
SELECT cron.schedule(
    'daily-late-fee-check',
    '0 0 * * *', -- Everyday at 00:00
    $$SELECT public.apply_late_fees()$$
);


-- ---------------------------------------------------------------------------------
-- 4. CREATE STORAGE BUCKET FOR PARENT RECEIPTS
-- ---------------------------------------------------------------------------------
-- Create the bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public uploads to receipts (since parents aren't logged in)
CREATE POLICY "Public Upload to Receipts"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'receipts');

-- Allow public read of receipts (so admin can see them)
CREATE POLICY "Public Read Receipts"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'receipts');
