drop policy if exists "login_events_select_admin" on public.login_events;
drop policy if exists "login_events_select_own_or_admin" on public.login_events;

create policy "login_events_select_own_or_admin"
on public.login_events for select
to authenticated
using (
  user_id = auth.uid()
  or public.has_permission('audit_logs.read')
);

notify pgrst, 'reload schema';
