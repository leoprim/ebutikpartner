-- Update existing storage bucket for videos
update storage.buckets 
set file_size_limit = 104857600 -- 100MB in bytes
where id = 'videos';

-- Drop existing policies if they exist
drop policy if exists "Anyone can view videos" on storage.objects;
drop policy if exists "Authenticated users can upload videos" on storage.objects;
drop policy if exists "Users can update their own videos" on storage.objects;
drop policy if exists "Users can delete their own videos" on storage.objects;

-- Set up storage policies
create policy "Anyone can view videos"
  on storage.objects for select
  using ( bucket_id = 'videos' );

create policy "Authenticated users can upload videos"
  on storage.objects for insert
  with check (
    bucket_id = 'videos'
    and auth.role() = 'authenticated'
  );

create policy "Users can update their own videos"
  on storage.objects for update
  using (
    bucket_id = 'videos'
    and auth.uid() = owner
  );

create policy "Users can delete their own videos"
  on storage.objects for delete
  using (
    bucket_id = 'videos'
    and auth.uid() = owner
  ); 