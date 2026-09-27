import { useAuth } from "@/auth/AuthContext";
import { useBranchStore } from "@/stores/branch-store";

/** Presentation scope for demo operational records; Cloud policies secure staff assignments. */
export function useAssignedBranches() {
  const { assignedBranches } = useAuth();
  const branches = useBranchStore((s) => s.branches);
  const allowed = branches.filter((branch) => assignedBranches.includes(branch.name));
  const ids = new Set(allowed.map((branch) => branch.id));
  return { branches: allowed, branchIds: ids };
}