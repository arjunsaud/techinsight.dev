-- Add is_featured column to articles table
ALTER TABLE articles ADD COLUMN is_featured BOOLEAN DEFAULT FALSE;
