-- =========================================================
-- Safe Supabase Schema Patch (Idempotent Update)
-- Run this in your Supabase SQL Editor to add missing columns
-- without causing "already exists" errors.
-- =========================================================

-- 1. Ensure 'fees' table exists or add missing columns
CREATE TABLE IF NOT EXISTS public.fees (
    id TEXT PRIMARY KEY,
    challan_number TEXT,
    student_id TEXT,
    student_name TEXT,
    class_name TEXT,
    section TEXT,
    month_year TEXT,
    tuition_fee NUMERIC DEFAULT 0,
    lab_fee NUMERIC DEFAULT 0,
    exam_fee NUMERIC DEFAULT 0,
    discount NUMERIC DEFAULT 0,
    custom_fields JSONB DEFAULT '[]'::jsonb,
    total_amount NUMERIC DEFAULT 0,
    amount_paid NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'pending',
    payment_method TEXT,
    payment_date TEXT,
    receipt_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Safely add custom_fields and arrears if fees table already existed
ALTER TABLE public.fees ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.fees ADD COLUMN IF NOT EXISTS arrears NUMERIC DEFAULT 0;

-- Enable RLS & Policy
ALTER TABLE public.fees ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public access for fees" ON public.fees;
CREATE POLICY "Public access for fees" ON public.fees FOR ALL USING (true) WITH CHECK (true);


-- 2. Ensure 'fee_structures' table exists or add missing columns
CREATE TABLE IF NOT EXISTS public.fee_structures (
    id TEXT PRIMARY KEY,
    class_name TEXT,
    tuition_fee NUMERIC DEFAULT 0,
    admission_fee NUMERIC DEFAULT 0,
    exam_fee NUMERIC DEFAULT 0,
    lab_fee NUMERIC DEFAULT 0,
    custom_fields JSONB DEFAULT '[]'::jsonb,
    is_public BOOLEAN DEFAULT true,
    kinship_enabled BOOLEAN DEFAULT true,
    kinship_discount_percent NUMERIC DEFAULT 25,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Safely add missing columns if fee_structures table already existed
ALTER TABLE public.fee_structures ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.fee_structures ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;
ALTER TABLE public.fee_structures ADD COLUMN IF NOT EXISTS kinship_enabled BOOLEAN DEFAULT true;
ALTER TABLE public.fee_structures ADD COLUMN IF NOT EXISTS kinship_discount_percent NUMERIC DEFAULT 25;

-- Enable RLS & Policy
ALTER TABLE public.fee_structures ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public access for fee_structures" ON public.fee_structures;
CREATE POLICY "Public access for fee_structures" ON public.fee_structures FOR ALL USING (true) WITH CHECK (true);
