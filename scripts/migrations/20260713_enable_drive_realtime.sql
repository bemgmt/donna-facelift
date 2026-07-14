-- Drive event presence and role updates need to reach attendees and facilitators
-- immediately. These policies are limited to the fixed demo organization and do
-- not change Cognito, Supabase Auth, public.users, or billing access.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'donna_drive_organizations'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.donna_drive_organizations;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'donna_drive_members'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.donna_drive_members;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'donna_drive_roles'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.donna_drive_roles;
  END IF;
END $$;

DROP POLICY IF EXISTS "Drive demo organization realtime read" ON public.donna_drive_organizations;
CREATE POLICY "Drive demo organization realtime read"
  ON public.donna_drive_organizations
  FOR SELECT
  TO anon, authenticated
  USING (id = 'dd-org-001');

DROP POLICY IF EXISTS "Drive demo members realtime read" ON public.donna_drive_members;
CREATE POLICY "Drive demo members realtime read"
  ON public.donna_drive_members
  FOR SELECT
  TO anon, authenticated
  USING (org_id = 'dd-org-001');

DROP POLICY IF EXISTS "Drive demo roles realtime read" ON public.donna_drive_roles;
CREATE POLICY "Drive demo roles realtime read"
  ON public.donna_drive_roles
  FOR SELECT
  TO anon, authenticated
  USING (org_id = 'dd-org-001');
