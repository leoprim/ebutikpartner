-- Create video_analytics table
create table if not exists video_analytics (
  id uuid default gen_random_uuid() primary key,
  video_id uuid references videos(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade,
  view_count integer default 1,
  last_viewed_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add RLS policies
alter table video_analytics enable row level security;

-- Allow all authenticated users to view analytics
create policy "Anyone can view analytics"
  on video_analytics for select
  using (true);

-- Allow users to insert their own analytics
create policy "Users can insert their own analytics"
  on video_analytics for insert
  with check (auth.uid() = user_id);

-- Allow users to update their own analytics
create policy "Users can update their own analytics"
  on video_analytics for update
  using (auth.uid() = user_id);

-- Create indexes for faster lookups
create index video_analytics_video_id_idx on video_analytics(video_id);
create index video_analytics_user_id_idx on video_analytics(user_id);
create index video_analytics_last_viewed_at_idx on video_analytics(last_viewed_at);

-- Create a function to update the updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Create a trigger to automatically update the updated_at column
create trigger update_video_analytics_updated_at
  before update on video_analytics
  for each row
  execute function update_updated_at_column(); 