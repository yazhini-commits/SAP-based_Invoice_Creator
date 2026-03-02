import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useInvoices } from "@/hooks/use-invoices";
import { format } from "date-fns";
import { FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoadInvoice: (data: any) => void;
}

export function HistoryDialog({ open, onOpenChange, onLoadInvoice }: HistoryDialogProps) {
  const { data: invoices, isLoading } = useInvoices();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col p-0 overflow-hidden bg-background">
        <div className="p-6 border-b border-border/50">
          <DialogHeader>
            <DialogTitle className="text-2xl font-display flex items-center gap-2">
              <FileText className="w-6 h-6 text-primary" /> Invoice History
            </DialogTitle>
          </DialogHeader>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 bg-secondary/10">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
              <p>Loading your invoices...</p>
            </div>
          ) : invoices && invoices.length > 0 ? (
            <div className="grid gap-4">
              {invoices.map((inv) => {
                const invoiceData = inv.data as any;
                const dateStr = invoiceData.date ? format(new Date(invoiceData.date), "dd MMM yyyy") : "No date";
                return (
                  <div key={inv.id} className="bg-card border border-border/50 p-4 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-bold text-foreground">{inv.invoiceNumber}</span>
                        <span className="text-xs bg-secondary px-2 py-0.5 rounded text-muted-foreground">{invoiceData.type}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{invoiceData.clientName || "Unnamed Client"} • {dateStr}</p>
                    </div>
                    <Button 
                      variant="secondary" 
                      className="opacity-0 group-hover:opacity-100 transition-opacity bg-primary/10 text-primary hover:bg-primary hover:text-white"
                      onClick={() => {
                        onLoadInvoice(inv.data);
                        onOpenChange(false);
                      }}
                    >
                      Load Data
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground text-center">
              <FileText className="w-12 h-12 mb-4 opacity-20" />
              <p className="font-medium text-foreground mb-1">No invoices found</p>
              <p className="text-sm">Invoices you save will appear here.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
