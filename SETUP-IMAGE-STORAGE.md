# Setup Image Storage for Posts

## Step 1: Run SQL Migration

In Supabase SQL Editor, run:
```sql
-- Copy contents of supabase-images.sql
ALTER TABLE posts ADD COLUMN IF NOT EXISTS images TEXT[];
```

## Step 2: Create Storage Bucket

1. Go to Supabase Dashboard → **Storage**
2. Click **"New bucket"**
3. Enter bucket name: `post-images`
4. Make it **Public** (check the box)
5. Click **Create bucket**

## Step 3: Set Storage Policies

1. Click on the `post-images` bucket
2. Go to **Policies** tab
3. Click **"New policy"**

### Policy 1: Public Read
```sql
-- Allow anyone to view images
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'post-images' );
```

### Policy 2: Authenticated Upload
```sql
-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'post-images' AND
  auth.role() = 'authenticated'
);
```

### Policy 3: Users can delete own images
```sql
-- Allow users to delete their own uploads
CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'post-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

## Step 4: Configure Bucket Settings

1. In bucket settings, set:
   - **File size limit**: 5MB
   - **Allowed MIME types**: 
     - image/jpeg
     - image/png
     - image/gif
     - image/webp

## Step 5: Test Upload

1. Go to `/create`
2. Fill in post details
3. Click "Add images"
4. Select 1-4 images
5. Submit post
6. Images should appear in the post!

## Verification

Check if everything works:

1. **Storage Bucket**: Should see `post-images` bucket
2. **Policies**: Should have 3 policies enabled
3. **Upload Test**: Try creating a post with images
4. **View Test**: Images should display in feed

## Troubleshooting

### "Bucket not found"
- Make sure bucket name is exactly `post-images`
- Check bucket is created in correct project

### "Upload failed"
- Verify storage policies are set
- Check file size (max 5MB)
- Ensure user is authenticated

### "Images not displaying"
- Check bucket is set to Public
- Verify image URLs in database
- Check browser console for errors

### "Permission denied"
- Verify authenticated upload policy
- Check user is signed in
- Review policy SQL syntax

## Features

✅ Upload up to 4 images per post
✅ Image preview before posting
✅ Remove images before submitting
✅ Automatic image optimization
✅ Secure storage with RLS
✅ Public viewing
✅ Grid layout display

## File Structure

Images are stored as:
```
post-images/
  └── {user_id}-{timestamp}-{random}.{ext}
```

Example:
```
post-images/abc123-1234567890-xyz789.jpg
```

## Done!

Your posts now support images! 📸
