ALTER TABLE public.fatawa RENAME COLUMN instagram_url TO video_url;

CREATE TABLE IF NOT EXISTS public.submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  summary_transcript text,
  video_url text NOT NULL,
  scholar_name text,
  topic_name text,
  category_slug text,
  submitter_name text,
  submitter_email text,
  note text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.submissions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.submissions TO authenticated;
GRANT ALL ON public.submissions TO service_role;

ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY submissions_public_insert ON public.submissions FOR INSERT TO anon, authenticated
  WITH CHECK (status = 'pending');
CREATE POLICY submissions_admin_read ON public.submissions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY submissions_admin_update ON public.submissions FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY submissions_admin_delete ON public.submissions FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS submissions_updated_at ON public.submissions;
CREATE TRIGGER submissions_updated_at BEFORE UPDATE ON public.submissions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();