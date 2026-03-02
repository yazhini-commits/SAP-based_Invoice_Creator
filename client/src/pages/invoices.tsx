import { useInvoices } from "@/hooks/use-invoices";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Download } from "lucide-react";

export default function Invoices() {
  const { data: invoices } = useInvoices();

  const getStatus = (inv: any) => {
    if (!inv.data?.dueDate) return "PENDING";

    const today = new Date();
    const due = new Date(inv.data.dueDate);

    if (due < today) return "OVERDUE";
    return "PENDING";
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">All Invoices</h1>

      <div className="bg-white rounded-xl shadow border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="p-4">Invoice No</th>
              <th className="p-4">Client</th>
              <th className="p-4">Date</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-center">Download</th>
              <th className="p-4 text-center">Delete</th>
            </tr>
          </thead>

          <tbody>
            {invoices?.map((inv: any) => {
              const status = getStatus(inv);

              return (
                <tr
                  key={inv.id}
                  className="border-t hover:bg-muted/30 transition"
                >
                  <td className="p-4 font-semibold">
                    {inv.invoiceNumber}
                  </td>

                  <td className="p-4">
                    {inv.data?.clientName || "-"}
                  </td>

                  <td className="p-4">
                    {inv.data?.date || "-"}
                  </td>

                  <td className="p-4 font-medium">
                    ₹ {inv.data?.grandTotal || 0}
                  </td>

                  <td className="p-4">
                    {status === "OVERDUE" && (
                      <Badge variant="destructive">OVERDUE</Badge>
                    )}
                    {status === "PENDING" && (
                      <Badge className="bg-yellow-200 text-yellow-800">
                        PENDING
                      </Badge>
                    )}
                  </td>

                  <td className="p-4 text-center">
                    <Button size="sm" variant="outline">
                      <Download className="w-4 h-4" />
                    </Button>
                  </td>

                  <td className="p-4 text-center">
                    <Button size="sm" variant="destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}