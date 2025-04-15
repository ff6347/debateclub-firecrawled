create table "public"."link_tags" (
	"link_id" integer not null,
	"tag_id" bigint not null,
	"created_at" timestamp with time zone not null default CURRENT_TIMESTAMP
);
alter table "public"."tags"
alter column "created_at"
set not null;
alter table "public"."tags"
alter column "id"
set data type bigint using "id"::bigint;
CREATE INDEX idx_link_tags_link_id ON public.link_tags USING btree (link_id);
CREATE INDEX idx_link_tags_tag_id ON public.link_tags USING btree (tag_id);
CREATE UNIQUE INDEX link_tags_pkey ON public.link_tags USING btree (link_id, tag_id);
alter table "public"."link_tags"
add constraint "link_tags_pkey" PRIMARY KEY using index "link_tags_pkey";
alter table "public"."link_tags"
add constraint "link_tags_link_id_fkey" FOREIGN KEY (link_id) REFERENCES links(id) ON DELETE CASCADE not valid;
alter table "public"."link_tags" validate constraint "link_tags_link_id_fkey";
alter table "public"."link_tags"
add constraint "link_tags_tag_id_fkey" FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE not valid;
alter table "public"."link_tags" validate constraint "link_tags_tag_id_fkey";
grant delete on table "public"."link_tags" to "anon";
grant insert on table "public"."link_tags" to "anon";
grant references on table "public"."link_tags" to "anon";
grant select on table "public"."link_tags" to "anon";
grant trigger on table "public"."link_tags" to "anon";
grant truncate on table "public"."link_tags" to "anon";
grant update on table "public"."link_tags" to "anon";
grant delete on table "public"."link_tags" to "authenticated";
grant insert on table "public"."link_tags" to "authenticated";
grant references on table "public"."link_tags" to "authenticated";
grant select on table "public"."link_tags" to "authenticated";
grant trigger on table "public"."link_tags" to "authenticated";
grant truncate on table "public"."link_tags" to "authenticated";
grant update on table "public"."link_tags" to "authenticated";
grant delete on table "public"."link_tags" to "service_role";
grant insert on table "public"."link_tags" to "service_role";
grant references on table "public"."link_tags" to "service_role";
grant select on table "public"."link_tags" to "service_role";
grant trigger on table "public"."link_tags" to "service_role";
grant truncate on table "public"."link_tags" to "service_role";
grant update on table "public"."link_tags" to "service_role";