GRANT SELECT, INSERT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

DROP POLICY IF EXISTS user_roles_claim_admin ON public.user_roles;
CREATE POLICY user_roles_claim_admin ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND role = 'admin'
    AND lower(coalesce(auth.jwt() ->> 'email', '')) = 'sheikhsolaimanovi@gmail.com'
  );

DROP POLICY IF EXISTS fatawa_admin_write ON public.fatawa;
CREATE POLICY fatawa_admin_write ON public.fatawa FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS scholars_admin_write ON public.scholars;
CREATE POLICY scholars_admin_write ON public.scholars FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS topics_admin_write ON public.topics;
CREATE POLICY topics_admin_write ON public.topics FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS categories_admin_write ON public.categories;
CREATE POLICY categories_admin_write ON public.categories FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS submissions_admin_read ON public.submissions;
DROP POLICY IF EXISTS submissions_admin_update ON public.submissions;
DROP POLICY IF EXISTS submissions_admin_delete ON public.submissions;
CREATE POLICY submissions_admin_read ON public.submissions FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));
CREATE POLICY submissions_admin_update ON public.submissions FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));
CREATE POLICY submissions_admin_delete ON public.submissions FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.claim_admin() FROM PUBLIC, anon, authenticated;