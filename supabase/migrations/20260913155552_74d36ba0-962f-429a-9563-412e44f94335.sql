ALTER TABLE public.fatawa DROP CONSTRAINT IF EXISTS fatawa_content_type_valid;

CREATE TABLE public.categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.categories TO anon, authenticated;
GRANT ALL ON public.categories TO service_role;

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY categories_read ON public.categories FOR SELECT USING (true);
CREATE POLICY categories_insert ON public.categories FOR INSERT WITH CHECK (true);

INSERT INTO public.categories (name, slug) VALUES
  ('Fatwa','fatwa'),
  ('Advice','advice'),
  ('Motivation','motivation'),
  ('Reminder','reminder'),
  ('Lecture','lecture');