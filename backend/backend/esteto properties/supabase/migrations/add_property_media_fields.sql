-- Migration: Add videos, documents, and allow_booking fields to properties table
-- Date: 2026-02-16

-- Add videos column (array of video URLs)
ALTER TABLE properties ADD COLUMN IF NOT EXISTS videos TEXT[] DEFAULT '{}';

-- Add documents column (JSONB array for document objects with type and url)
ALTER TABLE properties ADD COLUMN IF NOT EXISTS documents JSONB DEFAULT '[]';

-- Add allow_booking column (boolean to enable/disable booking for property)
ALTER TABLE properties ADD COLUMN IF NOT EXISTS allow_booking BOOLEAN DEFAULT true;

-- Create index for faster queries on allow_booking
CREATE INDEX IF NOT EXISTS idx_properties_allow_booking ON properties(allow_booking);

-- Comment on columns for documentation
COMMENT ON COLUMN properties.videos IS 'Array of video URLs for property videos';
COMMENT ON COLUMN properties.documents IS 'JSONB array of document objects: [{type: "floor_plan"|"brochure"|"layout"|"other", url: string, name: string}]';
COMMENT ON COLUMN properties.allow_booking IS 'Whether property allows booking/scheduling visits';
