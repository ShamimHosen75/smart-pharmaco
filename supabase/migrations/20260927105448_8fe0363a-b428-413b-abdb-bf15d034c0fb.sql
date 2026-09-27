CREATE TYPE public.staff_role AS ENUM ('super_admin','branch_admin','pharmacist','sales_staff','accountant');
CREATE TABLE public.staff_invitations (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), email text NOT NULL UNIQUE, full_name text NOT NULL, role public.staff_role NOT NULL, branch text NOT NULL DEFAULT 'Dhanmondi Main Branch', status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','claimed','disabled')), claimed_by uuid UNIQUE, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.staff_invitations TO authenticated;
GRANT ALL ON public.staff_invitations TO service_role;
ALTER TABLE public.staff_invitations ENABLE ROW LEVEL SECURITY;
CREATE TABLE public.profiles (
 id uuid PRIMARY KEY, full_name text NOT NULL DEFAULT '', display_name text NOT NULL DEFAULT '', phone text NOT NULL DEFAULT '', job_title text NOT NULL DEFAULT '', bio text NOT NULL DEFAULT '', avatar_url text NOT NULL DEFAULT '', branch text NOT NULL DEFAULT 'Dhanmondi Main Branch', is_active boolean NOT NULL DEFAULT true, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE TABLE public.user_roles (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL UNIQUE, role public.staff_role NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE FUNCTION public.is_staff_admin(_user uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles r JOIN public.profiles p ON p.id = r.user_id WHERE r.user_id = _user AND p.is_active AND r.role IN ('super_admin','branch_admin')) $$;
CREATE FUNCTION public.has_staff_access(_user uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles r JOIN public.profiles p ON p.id = r.user_id WHERE r.user_id = _user AND p.is_active) $$;
CREATE POLICY "Staff can view own profile and admins view staff" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid() OR public.is_staff_admin(auth.uid()));
CREATE POLICY "Staff can update own personal details" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid() AND public.has_staff_access(auth.uid())) WITH CHECK (id = auth.uid() AND public.has_staff_access(auth.uid()));
CREATE POLICY "Staff see own role and admins see staff roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_staff_admin(auth.uid()));
CREATE POLICY "Admins see invitations" ON public.staff_invitations FOR SELECT TO authenticated USING (public.is_staff_admin(auth.uid()));
CREATE POLICY "Admins create invitations" ON public.staff_invitations FOR INSERT TO authenticated WITH CHECK (public.is_staff_admin(auth.uid()) AND status = 'pending' AND claimed_by IS NULL AND (role <> 'super_admin' OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'super_admin')));
CREATE FUNCTION public.manage_staff_invitation(_id uuid, _email text, _name text, _role public.staff_role, _branch text, _status text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE caller_role public.staff_role; target public.staff_invitations;
BEGIN
 SELECT role INTO caller_role FROM public.user_roles WHERE user_id = auth.uid() AND public.has_staff_access(auth.uid());
 IF caller_role IS NULL OR caller_role NOT IN ('super_admin','branch_admin') THEN RAISE EXCEPTION 'Not authorized'; END IF;
 IF _role = 'super_admin' AND caller_role <> 'super_admin' THEN RAISE EXCEPTION 'Not authorized'; END IF;
 SELECT * INTO target FROM public.staff_invitations WHERE id = _id;
 IF NOT FOUND OR target.role = 'super_admin' AND caller_role <> 'super_admin' THEN RAISE EXCEPTION 'Not authorized'; END IF;
 IF target.claimed_by IS NOT NULL AND lower(target.email) <> lower(trim(_email)) THEN RAISE EXCEPTION 'Account email cannot be changed'; END IF;
 IF target.claimed_by = auth.uid() AND _status = 'disabled' THEN RAISE EXCEPTION 'Cannot disable own account'; END IF;
 IF target.claimed_by IS NOT NULL AND target.role = 'super_admin' AND _role <> 'super_admin' AND (SELECT count(*) FROM public.user_roles r JOIN public.profiles p ON p.id=r.user_id WHERE r.role='super_admin' AND p.is_active) <= 1 THEN RAISE EXCEPTION 'Cannot remove the last Super Admin'; END IF;
 UPDATE public.staff_invitations SET email = lower(trim(_email)), full_name = trim(_name), role = _role, branch = trim(_branch), status = _status, updated_at = now() WHERE id = _id;
 IF target.claimed_by IS NOT NULL THEN
 UPDATE public.profiles SET full_name = trim(_name), branch = trim(_branch), is_active = (_status <> 'disabled'), updated_at = now() WHERE id = target.claimed_by;
 UPDATE public.user_roles SET role = _role, updated_at = now() WHERE user_id = target.claimed_by;
 END IF;
END $$;
GRANT EXECUTE ON FUNCTION public.manage_staff_invitation(uuid,text,text,public.staff_role,text,text) TO authenticated;
CREATE FUNCTION public.claim_staff_account() RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE person record; invite public.staff_invitations;
BEGIN
 SELECT id, email, email_confirmed_at INTO person FROM auth.users WHERE id = auth.uid();
 IF person.id IS NULL OR person.email_confirmed_at IS NULL THEN RETURN false; END IF;
 SELECT * INTO invite FROM public.staff_invitations WHERE lower(email)=lower(person.email) AND status IN ('pending','claimed') FOR UPDATE;
 IF NOT FOUND OR invite.claimed_by IS NOT NULL AND invite.claimed_by <> person.id THEN RETURN false; END IF;
 INSERT INTO public.profiles(id,full_name,display_name,branch,is_active) VALUES (person.id,invite.full_name,invite.full_name,invite.branch,true) ON CONFLICT(id) DO NOTHING;
 INSERT INTO public.user_roles(user_id,role) VALUES(person.id,invite.role) ON CONFLICT(user_id) DO NOTHING;
 UPDATE public.staff_invitations SET status='claimed',claimed_by=person.id,updated_at=now() WHERE id=invite.id AND status='pending';
 RETURN public.has_staff_access(person.id);
END $$;
GRANT EXECUTE ON FUNCTION public.claim_staff_account() TO authenticated;
CREATE FUNCTION public.staff_touch_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$ BEGIN NEW.updated_at=now(); RETURN NEW; END $$;
CREATE TRIGGER touch_staff_invitations BEFORE UPDATE ON public.staff_invitations FOR EACH ROW EXECUTE FUNCTION public.staff_touch_updated_at();
CREATE TRIGGER touch_profiles BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.staff_touch_updated_at();
CREATE TRIGGER touch_user_roles BEFORE UPDATE ON public.user_roles FOR EACH ROW EXECUTE FUNCTION public.staff_touch_updated_at();
INSERT INTO public.staff_invitations (email,full_name,role,branch) VALUES ('shamimdevs75@gmail.com','Shamim Hosen','super_admin','Dhanmondi Main Branch');