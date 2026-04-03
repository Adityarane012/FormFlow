-- supabase/migrations/create_forms_and_responses.sql

-- Enable the pgcrypto extension if gen_random_uuid() requires it (it's built-in on newer pg)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create forms table
CREATE TABLE IF NOT EXISTS forms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    schema JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT now(),
    created_by UUID
);

-- Create responses table
CREATE TABLE IF NOT EXISTS responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
    answers JSONB NOT NULL,
    submitted_at TIMESTAMP DEFAULT now()
);

-- Add index on form_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_responses_form_id ON responses(form_id);
