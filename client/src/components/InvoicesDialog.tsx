import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useInvoices } from "@/hooks/use-invoices";
import { FileText } from "lucide-react";
import { useUpdateInvoice } from "@/hooks/use-invoices";


interface InvoicesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoadInvoice: (data: any) => void;
  onDownload: () => void; 
}

export function InvoicesDialog({ open, onOpenChange, onLoadInvoice, onDownload }: InvoicesDialogProps) {
  const { data: invoices } = useInvoices();
  const updateStatus = useUpdateInvoice(); 

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
       <DialogHeader>
  <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
    <div className="bg-primary/10 p-2 rounded-lg">
      <FileText className="w-5 h-5 text-primary" />
    </div>
    All Invoices
  </DialogTitle>
</DialogHeader>

       <div className="max-h-[450px] overflow-y-auto">
  <table className="w-full text-sm">
    <thead className="sticky top-0 bg-background border-b">
      <tr className="text-muted-foreground text-left">
        <th className="py-2 px-3">Invoice No</th>
        <th className="py-2 px-3">Date</th>
        <th className="py-2 px-3">Amount</th>
        <th className="py-2 px-3">Status</th>
        <th className="py-2 px-3 text-center">Actions</th>
      </tr>
    </thead>

    <tbody>
  {invoices?.map((inv: any) => {
    const invoiceData = inv.data as any;

    return (
      <tr
        key={inv.id}
        className="border-b hover:bg-muted/40 transition"
      >
        <td className="py-3 px-3 font-medium">
          {inv.invoiceNumber}
        </td>

        <td className="py-3 px-3">
          {inv.createdAt
            ? new Date(inv.createdAt).toLocaleDateString()
            : "-"}
        </td>

        <td className="py-3 px-3">
  ₹
  {(() => {
    const d = inv.data as any;
    if (!d?.items) return 0;

    const subtotal = d.items.reduce((sum: number, item: any) => {
      const qty = item.qty || 0;
      const rate = item.rate || 0;
      const discount = item.discount || 0;

      let lineTotal = qty * rate;

      if (item.discountType === "%") {
        lineTotal -= (lineTotal * discount) / 100;
      } else {
        lineTotal -= discount;
      }

      return sum + lineTotal;
    }, 0);

    const shipping = Number(d.shipping || 0);
    const overallDiscount = Number(d.overallDiscount || 0);

    let total = subtotal + shipping;

    if (d.overallDiscountType === "%") {
      total -= (total * overallDiscount) / 100;
    } else {
      total -= overallDiscount;
    }

    return total.toFixed(2);
  })()}
</td>

       <td className="py-3 px-3">
  <select
  value={inv.status || "PENDING"}
  onChange={(e) =>
    updateStatus.mutate({
      id: inv.id,
      status: e.target.value,
    })
  }
  className={`px-3 py-1 rounded-full text-xs font-medium border ${
    inv.status === "PAID"
      ? "bg-green-100 text-green-700"
      : inv.status === "OVERDUE"
      ? "bg-red-100 text-red-700"
      : "bg-yellow-100 text-yellow-700"
  }`}
>
  <option value="PENDING">PENDING</option>
  <option value="PAID">PAID</option>
  <option value="OVERDUE">OVERDUE</option>
</select>
</td>
<td className="py-3 px-3 text-center space-x-2">

  {/* Download Button */}
 <button
 onClick={() => {
  onLoadInvoice(inv.data);   // load invoice into preview
  onOpenChange(false);       // close dialog
  setTimeout(() => {
    onDownload();            // generate PDF
  }, 300);
}}
  className="px-3 py-1 text-xs font-medium rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition"
>
  Download
</button>

  {/* Delete Button */}
  <button
    onClick={() => {
      if (confirm("Are you sure you want to delete this invoice?")) {
        fetch(`/api/invoices/${inv.id}`, { method: "DELETE" })
          .then(() => window.location.reload());
      }
    }}
    className="px-3 py-1 text-xs font-medium rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition"
  >
    Delete
  </button>

</td>
      </tr>
    );
  })}
</tbody>
  </table>
</div>
      </DialogContent>
    </Dialog>
  );
}