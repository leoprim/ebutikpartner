create table if not exists videos (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  duration text,
  thumbnail_url text,
  video_url text not null,
  created_by uuid references auth.users(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  is_published boolean default false,
  order_index integer default 0
);

-- Add RLS policies
alter table videos enable row level security;

-- Allow all authenticated users to view published videos
create policy "Anyone can view published videos"
  on videos for select
  using (is_published = true);

-- Allow users to view their own unpublished videos
create policy "Users can view their own unpublished videos"
  on videos for select
  using (auth.uid() = created_by);

-- Allow users to insert their own videos
create policy "Users can insert their own videos"
  on videos for insert
  with check (auth.uid() = created_by);

-- Allow users to update their own videos
create policy "Users can update their own videos"
  on videos for update
  using (auth.uid() = created_by);

-- Allow users to delete their own videos
create policy "Users can delete their own videos"
  on videos for delete
  using (auth.uid() = created_by);

-- Create indexes for faster lookups
create index videos_created_by_idx on videos(created_by);
create index videos_is_published_idx on videos(is_published);
create index videos_order_index_idx on videos(order_index); 