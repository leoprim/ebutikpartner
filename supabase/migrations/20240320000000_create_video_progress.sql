create table if not exists video_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  video_id text not null,
  progress integer not null,
  timestamp double precision not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, video_id)
);

-- Add RLS policies
alter table video_progress enable row level security;

create policy "Users can view their own video progress"
  on video_progress for select
  using (auth.uid() = user_id);

create policy "Users can insert their own video progress"
  on video_progress for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own video progress"
  on video_progress for update
  using (auth.uid() = user_id);

-- Create index for faster lookups
create index video_progress_user_video_idx on video_progress(user_id, video_id); 