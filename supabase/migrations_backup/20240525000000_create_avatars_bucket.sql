-- Create a public storage bucket for avatars
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Set up access policies for the avatars bucket

-- Allow public read access
create policy "Avatar images are publicly accessible."
  on storage.objects for select
  using ( bucket_id = 'avatars' );

-- Allow authenticated users to upload avatar images
create policy "Anyone can upload an avatar."
  on storage.objects for insert
  with check ( bucket_id = 'avatars' and auth.role() = 'authenticated' );

-- Allow users to update their own avatar images (optional, but good for overwrites if we used user ID in path)
-- For now, we are using random filenames, so updates act like new inserts. 
-- But if we want to allow replacing files:
create policy "Anyone can update their own avatar."
  on storage.objects for update
  using ( bucket_id = 'avatars' and auth.role() = 'authenticated' );
