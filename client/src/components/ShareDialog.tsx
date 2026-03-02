import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Mail, MessageCircle } from "lucide-react";
import { type z } from "zod";
import { type invoiceDataSchema } from "@shared/schema";
import { calculateInvoiceTotals } from "@/lib/invoice-calc";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: z.infer<typeof invoiceDataSchema>;
}

export function ShareDialog({ open, onOpenChange, data }: ShareDialogProps) {
  const totals = calculateInvoiceTotals(data);
  
  const summaryText = `Invoice: ${data.number || 'Draft'}
From: ${data.clientName || 'Business'}
Amount Due: ₹${totals.grandTotal.toFixed(2)}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Share Invoice</DialogTitle>
          <DialogDescription>
            Share a summary of this invoice with your client.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-3 gap-4">
            <Button variant="outline" className="flex flex-col h-auto py-4 border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300">
              <MessageCircle className="w-6 h-6 mb-2" />
              WhatsApp
            </Button>
            <Button variant="outline" className="flex flex-col h-auto py-4 border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300">
              <Mail className="w-6 h-6 mb-2" />
              Email
            </Button>
            <Button 
              variant="outline" 
              className="flex flex-col h-auto py-4 hover:bg-secondary"
              onClick={() => {
                navigator.clipboard.writeText(summaryText);
              }}
            >
              <Copy className="w-6 h-6 mb-2 text-muted-foreground" />
              Copy
            </Button>
          </div>
          
          <div className="mt-4 p-4 bg-secondary/50 rounded-xl border border-border/50 text-sm font-mono whitespace-pre-wrap">
            {summaryText}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
