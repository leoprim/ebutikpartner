-- Create messages table
create table if not exists public.messages (
  id uuid default gen_random_uuid() primary key,
  channel_id text not null,
  user_id uuid references auth.users(id) on delete cascade,
  content text not null,
  attachments jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.messages enable row level security;

-- Create policies
create policy "Users can view messages in channels they have access to"
  on public.messages for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.is_premium = true
    )
  );

create policy "Premium users can insert messages"
  on public.messages for insert
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.is_premium = true
    )
  );

-- Enable realtime
alter publication supabase_realtime add table public.messages;

-- Create function to get user profile for messages
create or replace function public.get_user_profile(user_id uuid)
returns json
language sql
security definer
as $$
  select json_build_object(
    'id', p.id,
    'name', p.email,
    'avatar', null
  )
  from public.profiles p
  where p.id = user_id;
$$; 