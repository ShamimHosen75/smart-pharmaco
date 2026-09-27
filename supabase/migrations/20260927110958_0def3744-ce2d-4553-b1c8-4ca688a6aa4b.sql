DROP POLICY "Staff can view own profile and admins view assigned staff" ON public.profiles;
CREATE POLICY "Staff can view own profile and admins view staff" ON public.profiles FOR SELECT TO authenticated USING (id=auth.uid() OR public.is_staff_admin(auth.uid()));
DROP POLICY "Staff see own role and admins see assigned roles" ON public.user_roles;
CREATE POLICY "Staff see own role and admins see staff roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id=auth.uid() OR public.is_staff_admin(auth.uid()));