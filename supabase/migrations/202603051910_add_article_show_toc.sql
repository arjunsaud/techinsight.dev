-- Add show_toc column to articles table
ALTER TABLE articles ADD COLUMN show_toc BOOLEAN DEFAULT FALSE;
