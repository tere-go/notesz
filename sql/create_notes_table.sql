-- Create notes table in Supabase
-- Run this in your Supabase SQL Editor

CREATE TABLE notes (
    note_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date_created TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_update TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    title TEXT NOT NULL,
    content TEXT
);

-- Create an index on date_created for better query performance
CREATE INDEX idx_notes_date_created ON notes(date_created);

-- Create an index on last_update for better query performance
CREATE INDEX idx_notes_last_update ON notes(last_update);

-- Enable Row Level Security (RLS) - optional but recommended
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations for now (you can restrict this later)
CREATE POLICY "Allow all operations on notes" ON notes
    FOR ALL USING (true);
