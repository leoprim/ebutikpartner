-- Create function to get user metadata
create or replace function public.get_user_metadata(user_id uuid)
returns json
language sql
security definer
as $$
  select json_build_object(
    'full_name', au.raw_user_meta_data->>'full_name',
    'name', au.raw_user_meta_data->>'name',
    'avatar_url', au.raw_user_meta_data->>'avatar_url'
  )
  from auth.users au
  where au.id = user_id;
$$; 