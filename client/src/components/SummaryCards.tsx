import { Card } from "@/components/ui/card";
import { calculateInvoiceTotals } from "@/lib/invoice-calc";
import { type invoiceDataSchema } from "@shared/schema";
import { type z } from "zod";

interface SummaryCardsProps {
  data: z.infer<typeof invoiceDataSchema>;
}

export function SummaryCards({ data }: SummaryCardsProps) {
  const totals = calculateInvoiceTotals(data);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <Card className="p-5 border-border/50 shadow-sm bg-card hover:shadow-md transition-all">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Taxable Value</p>
        <p className="text-2xl font-display font-semibold text-foreground">
          ₹ {totals.taxableValue.toFixed(2)}
        </p>
      </Card>

      <Card className="p-5 border-border/50 shadow-sm bg-card hover:shadow-md transition-all">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">CGST + SGST</p>
        <p className="text-2xl font-display font-semibold text-foreground">
          ₹ {(totals.totalCgst + totals.totalSgst).toFixed(2)}
        </p>
      </Card>

      <Card className="p-5 border-border/50 shadow-sm bg-card hover:shadow-md transition-all">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">CESS</p>
        <p className="text-2xl font-display font-semibold text-foreground">
          ₹ {totals.totalCess.toFixed(2)}
        </p>
      </Card>

      <Card className="p-5 border-transparent shadow-lg bg-gradient-to-br from-primary to-primary/80 text-primary-foreground hover:shadow-xl hover:-translate-y-0.5 transition-all">
        <p className="text-xs font-bold text-primary-foreground/80 uppercase tracking-wider mb-1">Grand Total</p>
        <p className="text-3xl font-display font-bold">
          ₹ {totals.grandTotal.toFixed(2)}
        </p>
      </Card>
    </div>
  );
}
