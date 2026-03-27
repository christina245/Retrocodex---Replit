import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Fact as DbFact } from "@shared/schema";

export function useSavedFacts(isLoggedIn: boolean) {
  const queryClient = useQueryClient();

  const { data: savedDbFacts = [] } = useQuery<DbFact[]>({
    queryKey: ["/api/user/saved-facts"],
    enabled: isLoggedIn,
  });

  const savedFactIds = new Set(savedDbFacts.map((f) => f.id));

  const saveFactMutation = useMutation({
    mutationFn: (factId: string) =>
      apiRequest("POST", "/api/user/saved-facts", { factId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/saved-facts"] });
    },
  });

  const unsaveFactMutation = useMutation({
    mutationFn: (factId: string) =>
      apiRequest("DELETE", `/api/user/saved-facts/${factId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/saved-facts"] });
    },
  });

  const toggleSave = (factId: string) => {
    if (savedFactIds.has(factId)) {
      unsaveFactMutation.mutate(factId);
    } else {
      saveFactMutation.mutate(factId);
    }
  };

  return { savedFactIds, toggleSave };
}
