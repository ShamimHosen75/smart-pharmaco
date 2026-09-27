CREATE OR REPLACE FUNCTION public.has_staff_access(_user uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$ SELECT _user = auth.uid() AND EXISTS (SELECT 1 FROM public.user_roles r JOIN public.profiles p ON p.id = r.user_id JOIN public.staff_invitations i ON i.claimed_by = r.user_id WHERE r.user_id = _user AND p.is_active AND i.status = 'claimed') $$;
CREATE OR REPLACE FUNCTION public.is_staff_admin(_user uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$ SELECT _user = auth.uid() AND EXISTS (SELECT 1 FROM public.user_roles r JOIN public.profiles p ON p.id = r.user_id JOIN public.staff_invitations i ON i.claimed_by = r.user_id WHERE r.user_id = _user AND p.is_active AND i.status = 'claimed' AND r.role IN ('super_admin','branch_admin')) $$;
CREATE OR REPLACE FUNCTION public.claim_staff_account() RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE person record; invite public.staff_invitations;
BEGIN
 SELECT id, email, email_confirmed_at INTO person FROM auth.users WHERE id = auth.uid();
 IF person.id IS NULL OR person.email_confirmed_at IS NULL THEN RETURN false; END IF;
 SELECT * INTO invite FROM public.staff_invitations WHERE lower(email)=lower(person.email) AND status IN ('pending','claimed') FOR UPDATE;
 IF NOT FOUND OR (invite.claimed_by IS NOT NULL AND invite.claimed_by <> person.id) THEN RETURN false; END IF;
 INSERT INTO public.profiles(id,full_name,display_name,branch,is_active) VALUES (person.id,invite.full_name,invite.full_name,invite.branch,true) ON CONFLICT(id) DO NOTHING;
 INSERT INTO public.user_roles(user_id,role) VALUES(person.id,invite.role) ON CONFLICT(user_id) DO NOTHING;
 UPDATE public.staff_invitations SET status='claimed',claimed_by=person.id WHERE id=invite.id AND status='pending';
 RETURN public.has_staff_access(person.id);
END $$;
REVOKE EXECUTE ON FUNCTION public.has_staff_access(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_staff_admin(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.claim_staff_account() FROM PUBLIC, anon;