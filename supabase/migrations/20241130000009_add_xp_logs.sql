-- Create xp_logs table to track XP history and prevent farming
create table if not exists public.xp_logs (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    action_type text not null,
    resource_id text,
    xp_amount integer not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    
    -- Prevent duplicate XP for the same action on the same resource
    constraint unique_user_action_resource unique (user_id, action_type, resource_id)
);

-- Enable RLS
alter table public.xp_logs enable row level security;

-- Policies
create policy "Users can view their own XP logs"
    on public.xp_logs for select
    using (auth.uid() = user_id);

create policy "Users can insert their own XP logs"
    on public.xp_logs for insert
    with check (auth.uid() = user_id);

-- Add indexes
create index idx_xp_logs_user_id on public.xp_logs(user_id);
create index idx_xp_logs_action_type on public.xp_logs(action_type);
