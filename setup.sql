-- SQL Schema Setup for Hawawshi El Nasr (Supabase SQL Editor)
-- Copy and paste this script into your Supabase SQL Editor and run it to create the products table.

-- 1. Create the products table
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  available BOOLEAN DEFAULT TRUE,
  description TEXT,
  image TEXT
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies to allow client-side operations (anonymous CRUD)
-- Allow public select (everyone can view the menu)
CREATE POLICY "Allow public select" 
ON products FOR SELECT 
TO public 
USING (true);

-- Allow public insert (needed for client-side seeding & admin catalog additions)
CREATE POLICY "Allow public insert" 
ON products FOR INSERT 
TO public 
WITH CHECK (true);

-- Allow public update (needed for admin catalog edits and stock toggles)
CREATE POLICY "Allow public update" 
ON products FOR UPDATE 
TO public 
USING (true) 
WITH CHECK (true);

-- Allow public delete (needed for admin catalog deletions)
CREATE POLICY "Allow public delete" 
ON products FOR DELETE 
TO public 
USING (true);
