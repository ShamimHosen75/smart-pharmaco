CREATE OR REPLACE FUNCTION public.staff_can_manage_branch(_branch text) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$ SELECT public.is_staff_admin(auth.uid()) AND (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id=auth.uid() AND role='super_admin') OR EXISTS (SELECT 1 FROM public.profiles WHERE id=auth.uid() AND branch=_branch)) $$;
CREATE OR REPLACE FUNCTION public.staff_has_other_branch(_user uuid, _branch text) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$ SELECT EXISTS (SELECT 1 FROM public.staff_branch_assignments WHERE user_id=_user AND branch_name<>_branch) $$;
REVOKE EXECUTE ON FUNCTION public.staff_can_manage_branch(text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.staff_has_other_branch(uuid,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.staff_can_manage_branch(text), public.staff_has_other_branch(uuid,text) TO authenticated;
DROP POLICY "Admins remove branch assignments" ON public.staff_branch_assignments;
CREATE POLICY "Admins remove branch assignments" ON public.staff_branch_assignments FOR DELETE TO authenticated USING (public.staff_can_manage_branch(branch_name) AND user_id <> auth.uid() AND (EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id=auth.uid() AND r.role='super_admin') OR NOT EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id=staff_branch_assignments.user_id AND r.role='super_admin')) AND public.staff_has_other_branch(user_id,branch_name));
DROP POLICY "Admins create invitations" ON public.staff_invitations;
CREATE POLICY "Admins create invitations" ON public.staff_invitations FOR INSERT TO authenticated WITH CHECK (public.staff_can_manage_branch(branch) AND status='pending' AND claimed_by IS NULL AND (role<>'super_admin' OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id=auth.uid() AND role='super_admin')));
CREATE OR REPLACE FUNCTION public.manage_staff_invitation(_id uuid, _email text, _name text, _role public.staff_role, _branch text, _status text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE caller_role public.staff_role; target public.staff_invitations;
BEGIN
 SELECT role INTO caller_role FROM public.user_roles WHERE user_id=auth.uid() AND public.has_staff_access(auth.uid());
 IF caller_role IS NULL OR caller_role NOT IN ('super_admin','branch_admin') THEN RAISE EXCEPTION 'Not authorized'; END IF;
 IF _role='super_admin' AND caller_role<>'super_admin' THEN RAISE EXCEPTION 'Not authorized'; END IF;
 SELECT * INTO target FROM public.staff_invitations WHERE id=_id FOR UPDATE;
 IF NOT FOUND OR (target.role='super_admin' AND caller_role<>'super_admin') THEN RAISE EXCEPTION 'Not authorized'; END IF;
 IF NOT public.staff_can_manage_branch(target.branch) OR NOT public.staff_can_manage_branch(trim(_branch)) THEN RAISE EXCEPTION 'Branch not authorized'; END IF;
 IF _status NOT IN ('pending','claimed','disabled') THEN RAISE EXCEPTION 'Invalid status'; END IF;
 IF (target.claimed_by IS NULL AND _status NOT IN ('pending','disabled')) OR (target.claimed_by IS NOT NULL AND _status NOT IN ('claimed','disabled')) THEN RAISE EXCEPTION 'Invalid account state'; END IF;
 IF target.claimed_by IS NOT NULL AND lower(target.email)<>lower(trim(_email)) THEN RAISE EXCEPTION 'Account email cannot be changed'; END IF;
 IF target.claimed_by=auth.uid() AND (_status='disabled' OR _role<>target.role) THEN RAISE EXCEPTION 'Cannot change own access'; END IF;
 IF target.claimed_by IS NOT NULL AND target.role='super_admin' AND (_role<>'super_admin' OR _status='disabled') AND (SELECT count(*) FROM public.user_roles r JOIN public.profiles p ON p.id=r.user_id WHERE r.role='super_admin' AND p.is_active)<=1 THEN RAISE EXCEPTION 'Cannot remove the last Super Admin'; END IF;
 UPDATE public.staff_invitations SET email=lower(trim(_email)),full_name=trim(_name),role=_role,branch=trim(_branch),status=_status WHERE id=_id;
 IF target.claimed_by IS NOT NULL THEN
 UPDATE public.profiles SET full_name=trim(_name),branch=trim(_branch),is_active=(_status<>'disabled') WHERE id=target.claimed_by;
 UPDATE public.user_roles SET role=_role WHERE user_id=target.claimed_by;
 END IF;
END $$;
CREATE OR REPLACE FUNCTION public.has_staff_access(_user uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT _user=auth.uid() AND EXISTS (SELECT 1 FROM public.user_roles r JOIN public.profiles p ON p.id=r.user_id JOIN public.staff_invitations i ON i.claimed_by=r.user_id JOIN public.staff_branch_assignments a ON a.user_id=r.user_id WHERE r.user_id=_user AND p.is_active AND i.status='claimed') $$;
CREATE OR REPLACE FUNCTION public.is_staff_admin(_user uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT _user=auth.uid() AND EXISTS (SELECT 1 FROM public.user_roles r JOIN public.profiles p ON p.id=r.user_id JOIN public.staff_invitations i ON i.claimed_by=r.user_id JOIN public.staff_branch_assignments a ON a.user_id=r.user_id WHERE r.user_id=_user AND p.is_active AND i.status='claimed' AND r.role IN ('super_admin','branch_admin')) $$;
REVOKE EXECUTE ON FUNCTION public.manage_staff_invitation(uuid,text,text,public.staff_role,text,text), public.has_staff_access(uuid), public.is_staff_admin(uuid) FROM PUBLIC, anon;
DROP POLICY "Admins see invitations" ON public.staff_invitations;
CREATE POLICY "Admins see invitations" ON public.staff_invitations FOR SELECT TO authenticated USING (public.staff_can_manage_branch(branch));