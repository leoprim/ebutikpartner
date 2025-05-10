-- Create a new storage bucket for attachments
insert into storage.buckets (id, name, public)
values ('attachments', 'attachments', true);

-- Set up storage policies for the attachments bucket
create policy "Allow authenticated users to upload attachments"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'attachments' AND
  auth.role() = 'authenticated'
);

create policy "Allow authenticated users to read attachments"
on storage.objects for select
to authenticated
using (bucket_id = 'attachments');

create policy "Allow users to delete their own attachments"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'attachments' AND
  auth.uid() = owner
); 