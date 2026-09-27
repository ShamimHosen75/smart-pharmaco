REVOKE EXECUTE ON FUNCTION public.is_staff_admin(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.has_staff_access(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.manage_staff_invitation(uuid,text,text,public.staff_role,text,text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.claim_staff_account() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_staff_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_staff_access(uuid) TO authenticated;
REVOKE UPDATE ON public.profiles FROM authenticated;
GRANT UPDATE (display_name, phone, job_title, bio, avatar_url) ON public.profiles TO authenticated;
REVOKE UPDATE, DELETE ON public.staff_invitations FROM authenticated;