REVOKE INSERT ON public.staff_invitations FROM authenticated;
GRANT INSERT (email,full_name,role,branch) ON public.staff_invitations TO authenticated;
REVOKE EXECUTE ON FUNCTION public.staff_touch_updated_at() FROM PUBLIC, anon, authenticated;
CREATE OR REPLACE FUNCTION public.manage_staff_invitation(_id uuid, _email text, _name text, _role public.staff_role, _branch text, _status text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE caller_role public.staff_role; target public.staff_invitations;
BEGIN
 SELECT role INTO caller_role FROM public.user_roles WHERE user_id = auth.uid() AND public.has_staff_access(auth.uid());
 IF caller_role IS NULL OR caller_role NOT IN ('super_admin','branch_admin') THEN RAISE EXCEPTION 'Not authorized'; END IF;
 IF _role = 'super_admin' AND caller_role <> 'super_admin' THEN RAISE EXCEPTION 'Not authorized'; END IF;
 SELECT * INTO target FROM public.staff_invitations WHERE id = _id FOR UPDATE;
 IF NOT FOUND OR (target.role = 'super_admin' AND caller_role <> 'super_admin') THEN RAISE EXCEPTION 'Not authorized'; END IF;
 IF _status NOT IN ('pending','claimed','disabled') THEN RAISE EXCEPTION 'Invalid status'; END IF;
 IF target.claimed_by IS NULL AND _status NOT IN ('pending','disabled') OR target.claimed_by IS NOT NULL AND _status NOT IN ('claimed','disabled') THEN RAISE EXCEPTION 'Invalid account state'; END IF;
 IF target.claimed_by IS NOT NULL AND lower(target.email) <> lower(trim(_email)) THEN RAISE EXCEPTION 'Account email cannot be changed'; END IF;
 IF target.claimed_by = auth.uid() AND (_status='disabled' OR _role <> target.role) THEN RAISE EXCEPTION 'Cannot change own access'; END IF;
 IF target.claimed_by IS NOT NULL AND target.role='super_admin' AND (_role <> 'super_admin' OR _status='disabled') AND (SELECT count(*) FROM public.user_roles r JOIN public.profiles p ON p.id=r.user_id WHERE r.role='super_admin' AND p.is_active) <= 1 THEN RAISE EXCEPTION 'Cannot remove the last Super Admin'; END IF;
 UPDATE public.staff_invitations SET email=lower(trim(_email)),full_name=trim(_name),role=_role,branch=trim(_branch),status=_status WHERE id=_id;
 IF target.claimed_by IS NOT NULL THEN
 UPDATE public.profiles SET full_name=trim(_name),branch=trim(_branch),is_active=(_status <> 'disabled') WHERE id=target.claimed_by;
 UPDATE public.user_roles SET role=_role WHERE user_id=target.claimed_by;
 END IF;
END $$;