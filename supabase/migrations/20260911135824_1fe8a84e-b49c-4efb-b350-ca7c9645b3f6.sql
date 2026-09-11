ALTER TABLE public.fatawa
ADD COLUMN content_type TEXT NOT NULL DEFAULT 'fatwa';

ALTER TABLE public.fatawa
ADD CONSTRAINT fatawa_content_type_valid
CHECK (content_type IN ('fatwa', 'advice', 'motivation', 'reminder', 'lecture'));

CREATE INDEX fatawa_content_type_idx ON public.fatawa(content_type);