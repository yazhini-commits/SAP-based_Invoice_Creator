import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertInvoice, type UpdateInvoiceRequest, type Invoice } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useInvoices() {
  return useQuery({
    queryKey: [api.invoices.list.path],
    queryFn: async () => {
      const res = await fetch(api.invoices.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch invoices");
      const data = await res.json();
      return api.invoices.list.responses[200].parse(data);
    },
  });
}

export function useInvoice(id: number | null) {
  return useQuery({
    queryKey: [api.invoices.get.path, id],
    queryFn: async () => {
      if (!id) return null;
      const url = buildUrl(api.invoices.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch invoice");
      const data = await res.json();
      return api.invoices.get.responses[200].parse(data);
    },
    enabled: !!id,
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertInvoice) => {
      const validated = api.invoices.create.input.parse(data);
      const res = await fetch(api.invoices.create.path, {
        method: api.invoices.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Failed to create invoice");
      }
      return api.invoices.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.invoices.list.path] });
      toast({
        title: "Invoice Saved",
        description: "Your invoice has been successfully saved.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error saving invoice",
        description: error.message,
      });
    }
  });
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & UpdateInvoiceRequest) => {
      const validated = api.invoices.update.input.parse(updates);
      const url = buildUrl(api.invoices.update.path, { id });
      const res = await fetch(url, {
        method: api.invoices.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update invoice");
      return api.invoices.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.invoices.list.path] });
      toast({
        title: "Invoice Updated",
        description: "Your changes have been saved.",
      });
    },
  });
}
