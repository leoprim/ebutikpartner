-- Insert admin user
insert into public.admin_users (id, email)
select id, email
from auth.users
where email = 'leo@primgroup.se'
on conflict (id) do nothing; 