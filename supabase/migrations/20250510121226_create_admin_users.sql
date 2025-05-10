-- Create admin_users table
create table if not exists public.admin_users (
    id uuid references auth.users on delete cascade not null primary key,
    email text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.admin_users enable row level security;

-- Create policies
create policy "Admins can view all admin users"
    on public.admin_users for select
    to authenticated
    using (
        exists (
            select 1 from public.admin_users
            where id = auth.uid()
        )
    );

create policy "Admins can insert new admin users"
    on public.admin_users for insert
    to authenticated
    with check (
        exists (
            select 1 from public.admin_users
            where id = auth.uid()
        )
    );

create policy "Admins can update admin users"
    on public.admin_users for update
    to authenticated
    using (
        exists (
            select 1 from public.admin_users
            where id = auth.uid()
        )
    );

create policy "Admins can delete admin users"
    on public.admin_users for delete
    to authenticated
    using (
        exists (
            select 1 from public.admin_users
            where id = auth.uid()
        )
    );

-- Create function to check if user is admin
create or replace function public.is_admin(user_id uuid)
returns boolean
language plpgsql
security definer
as $$
begin
    return exists (
        select 1 from public.admin_users
        where id = user_id
    );
end;
$$;

-- Insert initial admin user (you'll need to replace this with your actual user ID)
-- Note: You'll need to run this manually after getting your user ID
-- insert into public.admin_users (id, email) values ('your-user-id', 'info@leoprim.com');
