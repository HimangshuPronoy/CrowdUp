-- Add image support to posts
ALTER TABLE posts ADD COLUMN IF NOT EXISTS images TEXT[];

-- Create storage bucket for post images (run this in Supabase Dashboard > Storage)
-- You'll need to create a bucket named 'post-images' in the Supabase Storage UI

-- Storage policies will be set up via the Supabase Dashboard
-- Bucket: post-images
-- Public: true (for viewing)
-- File size limit: 5MB
-- Allowed MIME types: image/jpeg, image/png, image/gif, image/webp
