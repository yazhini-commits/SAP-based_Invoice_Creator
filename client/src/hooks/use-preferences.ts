import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { type UpdatePreferencesRequest } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

/* =========================================================
   GET PREFERENCES
   ========================================================= */

export function usePreferences() {
  return useQuery({
    queryKey: ["preferences"],

    queryFn: async () => {
      const res = await fetch(api.preferences.get.path, {
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to fetch preferences");

      const data = await res.json();
      return api.preferences.get.responses[200].parse(data);
    },

    // keep cached (important for preview)
    staleTime: 1000 * 60 * 60, // 1 hour
    refetchOnWindowFocus: false,
  });
}

/* =========================================================
   UPDATE PREFERENCES
   ========================================================= */

export function useUpdatePreferences() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (updates: UpdatePreferencesRequest) => {
      const validated = api.preferences.update.input.parse(updates);

      const res = await fetch(api.preferences.update.path, {
        method: api.preferences.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to update preferences");

      return api.preferences.update.responses[200].parse(await res.json());
    },

    /* ⭐⭐ THIS IS THE MAGIC ⭐⭐ */
    onSuccess: (newData) => {

      /* 1️⃣ instantly update React Query cache */
      queryClient.setQueryData(["preferences"], newData);

      /* 2️⃣ also update any component already using it */
      queryClient.invalidateQueries({
        queryKey: ["preferences"],
        refetchType: "none", // VERY IMPORTANT (no extra network calls)
      });

      toast({
        title: "Preferences Saved",
        description: "Preview updated successfully.",
      });
    },
  });
}