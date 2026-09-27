import { useMemo } from "react";
import { useAuth } from "@/auth/AuthContext";
import { useBranchStore } from "@/stores/branch-store";

/** Presentation scope for demo operational records; Cloud policies secure staff assignments. */
export function useAssignedBranches() {
  const { assignedBranches } = useAuth();
  const branches = useBranchStore((s) => s.branches);
  return useMemo(() => {
    const allowed = branches.filter((branch) => assignedBranches.includes(branch.name));
    return { branches: allowed, branchIds: new Set(allowed.map((branch) => branch.id)) };
  }, [branches, assignedBranches]);
}