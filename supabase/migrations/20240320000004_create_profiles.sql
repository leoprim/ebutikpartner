-- Create profiles table
create table if not exists public.profiles (
    id uuid references auth.users on delete cascade not null primary key,
    email text not null,
    is_premium boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Create policies
create policy "Users can view their own profile"
    on public.profiles for select
    using (auth.uid() = id);

create policy "Users can update their own profile"
    on public.profiles for update
    using (auth.uid() = id);

-- Create function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

-- Create trigger for updated_at
create trigger set_updated_at
    before update on public.profiles
    for each row
    execute function public.handle_updated_at();

-- Insert initial profile for leo@primgroup.se
insert into public.profiles (id, email, is_premium)
select id, email, true
from auth.users
where email = 'leo@primgroup.se'
on conflict (id) do update
set is_premium = true; 