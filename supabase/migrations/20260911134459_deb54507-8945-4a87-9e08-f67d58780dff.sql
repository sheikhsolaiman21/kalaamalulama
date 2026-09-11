CREATE TABLE public.scholars (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.scholars TO authenticated;
GRANT SELECT, INSERT ON public.scholars TO anon;
GRANT ALL ON public.scholars TO service_role;
ALTER TABLE public.scholars ENABLE ROW LEVEL SECURITY;
CREATE POLICY "scholars_read" ON public.scholars FOR SELECT USING (true);
CREATE POLICY "scholars_insert" ON public.scholars FOR INSERT WITH CHECK (true);

CREATE TABLE public.topics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.topics TO authenticated;
GRANT SELECT, INSERT ON public.topics TO anon;
GRANT ALL ON public.topics TO service_role;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "topics_read" ON public.topics FOR SELECT USING (true);
CREATE POLICY "topics_insert" ON public.topics FOR INSERT WITH CHECK (true);

CREATE TABLE public.fatawa (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  summary_transcript TEXT,
  instagram_url TEXT NOT NULL,
  scholar_id UUID REFERENCES public.scholars(id) ON DELETE SET NULL,
  topic_id UUID REFERENCES public.topics(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fatawa TO authenticated;
GRANT SELECT, INSERT ON public.fatawa TO anon;
GRANT ALL ON public.fatawa TO service_role;
ALTER TABLE public.fatawa ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fatawa_read" ON public.fatawa FOR SELECT USING (true);
CREATE POLICY "fatawa_insert" ON public.fatawa FOR INSERT WITH CHECK (true);

CREATE INDEX fatawa_scholar_idx ON public.fatawa(scholar_id);
CREATE INDEX fatawa_topic_idx ON public.fatawa(topic_id);

INSERT INTO public.scholars (name, slug) VALUES
  ('Shaykh Abdullah Rahman', 'abdullah-rahman'),
  ('Mufti Ismail Karim', 'ismail-karim'),
  ('Shaykh Yusuf Haque', 'yusuf-haque'),
  ('Ustadh Bilal Ahmed', 'bilal-ahmed');

INSERT INTO public.topics (name, slug) VALUES
  ('Salah', 'salah'),
  ('Zakat', 'zakat'),
  ('Fasting', 'fasting'),
  ('Marriage', 'marriage'),
  ('Business & Finance', 'business-finance'),
  ('Purification', 'purification');

INSERT INTO public.fatawa (title, summary_transcript, instagram_url, scholar_id, topic_id)
SELECT v.title, v.summary, v.url, s.id, t.id
FROM (VALUES
  ('Combining prayers while travelling', 'A traveller may shorten and combine Dhuhr with Asr and Maghrib with Isha once the journey distance is met. The shaykh explains the conditions of a valid journey and when the concession ends.', 'https://www.instagram.com/p/CxQZq1sLh8H/', 'abdullah-rahman', 'salah'),
  ('Missing Fajr repeatedly: is it a major sin?', 'Deliberately sleeping through Fajr without any effort to wake is sinful; the ruling differs for genuine oversight. Practical steps for building a reliable routine are given.', 'https://www.instagram.com/p/Cw1nMxTLp2v/', 'bilal-ahmed', 'salah'),
  ('Paying zakat on gold jewellery worn daily', 'Scholars differ on worn jewellery. The safer opinion is to pay 2.5% annually once the nisab is reached, and the calculation method is demonstrated.', 'https://www.instagram.com/p/Cy8fLmDLq3T/', 'ismail-karim', 'zakat'),
  ('Can zakat be given to a family member?', 'Zakat may go to poor relatives who are not dependants you are already obliged to maintain, such as siblings, aunts and cousins.', 'https://www.instagram.com/p/CvB2aKQL0Zn/', 'ismail-karim', 'zakat'),
  ('Using an inhaler while fasting', 'The stronger position is that a metered-dose inhaler does not break the fast because it delivers vapour, not nourishment, to the lungs.', 'https://www.instagram.com/p/CzR7pQeLw9K/', 'yusuf-haque', 'fasting'),
  ('Making up missed Ramadan fasts before the next Ramadan', 'Missed fasts should be made up before the following Ramadan. Delay without excuse requires repentance and, in one opinion, feeding a poor person per day.', 'https://www.instagram.com/p/Cu4hTnGLs1M/', 'yusuf-haque', 'fasting'),
  ('Is a marriage valid without the wali?', 'The majority hold the guardian is a condition of a valid contract. The shaykh outlines the disagreement and the safest practice for converts.', 'https://www.instagram.com/p/Cx0dRfULm7B/', 'abdullah-rahman', 'marriage'),
  ('Conditions in the marriage contract', 'A wife may stipulate lawful conditions such as continuing her studies, and these are binding once accepted.', 'https://www.instagram.com/p/CtP9wZaLk4D/', 'abdullah-rahman', 'marriage'),
  ('Buying a home with a conventional mortgage', 'Interest-based mortgages are prohibited. Alternatives such as diminishing musharakah and cooperative ownership models are discussed.', 'https://www.instagram.com/p/Cy1kVbHLr6X/', 'ismail-karim', 'business-finance'),
  ('Trading shares and screening companies', 'Equity investing is permitted when the underlying business is lawful and debt and interest income stay below accepted screening thresholds.', 'https://www.instagram.com/p/CwLmXpNLd5Q/', 'bilal-ahmed', 'business-finance'),
  ('Wiping over socks: how long is it valid?', 'A resident may wipe for a day and night, a traveller for three days and nights, starting from the first wipe after breaking wudu.', 'https://www.instagram.com/p/CvT3sYkLh2P/', 'yusuf-haque', 'purification'),
  ('Does touching your spouse break wudu?', 'The strongest view is that touching alone does not invalidate wudu unless something else exits the body.', 'https://www.instagram.com/p/CsX6dQwLn8F/', 'bilal-ahmed', 'purification')
) AS v(title, summary, url, scholar_slug, topic_slug)
JOIN public.scholars s ON s.slug = v.scholar_slug
JOIN public.topics t ON t.slug = v.topic_slug;