alter table "public"."link_tags" enable row level security;

alter table "public"."links" enable row level security;

alter table "public"."tags" enable row level security;

create policy "Enable read access for all users"
on "public"."link_tags"
as permissive
for select
to anon, authenticated
using (true);


create policy "Enable read access for all users"
on "public"."links"
as permissive
for select
to authenticated, anon
using (true);


create policy "Enable read access for all users"
on "public"."tags"
as permissive
for select
to anon, authenticated
using (true);



