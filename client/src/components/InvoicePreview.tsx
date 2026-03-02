import { type z } from "zod";
import { type invoiceDataSchema } from "@shared/schema";
import { calculateInvoiceTotals } from "@/lib/invoice-calc";
import { format } from "date-fns";
import { usePreferences } from "@/hooks/use-preferences";

interface InvoicePreviewProps {
  data: z.infer<typeof invoiceDataSchema>;
}

export function InvoicePreview({ data }: InvoicePreviewProps) {
  const totals = calculateInvoiceTotals(data);
  const { data: preferences, isLoading } = usePreferences();
  if (isLoading) return null;
  const waitForImages = async (element: HTMLElement) => {
  const images = Array.from(element.getElementsByTagName("img"));
  await Promise.all(
    images.map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise(resolve => {
        img.onload = resolve;
        img.onerror = resolve;
      });
    })
  );
};
  return (
    <div id="print-area" className="max-w-[21cm] min-h-[29.7cm] mx-auto bg-white shadow-2xl p-12 text-sm text-slate-800 border print:shadow-none print:border-none print:p-0">
      
      {/* Header */}
<div className="flex justify-between items-start border-b-2 border-slate-800 pb-8 mb-8">
  
  {/* LEFT SIDE — Invoice Title */}
  <div>
    <h1 className="text-4xl font-bold text-slate-900 tracking-tight uppercase">
      {data.type || "Tax Invoice"}
    </h1>
    <p className="text-slate-500 mt-2 font-medium">
      Invoice No: <span className="text-slate-800">{data.number || "DRAFT"}</span>
    </p>
    <p className="text-slate-500 font-medium">
      Date: <span className="text-slate-800">
        {data.date ? format(new Date(data.date), "dd MMM yyyy") : "-"}
      </span>
    </p>
    {data.dueDate && (
      <p className="text-slate-500 font-medium">
        Due Date: <span className="text-slate-800">
          {format(new Date(data.dueDate), "dd MMM yyyy")}
        </span>
      </p>
    )}
  </div>

  {/* RIGHT SIDE — Business Details */}
  <div className="text-right max-w-xs flex flex-col items-end">
    <h2 className="text-xl font-bold text-slate-900 mb-2">
      {preferences?.businessName || "Your Business Name"}
    </h2>

    {/* LOGO BELOW NAME */}
    {preferences?.businessLogoUrl && (
      <img
        src={preferences.businessLogoUrl}
        alt="Logo"
        className="w-24 h-24 object-contain mb-3"
      />
    )}

    {preferences?.businessAddress && (
      <p className="whitespace-pre-line text-slate-600 mb-1">
        {preferences.businessAddress}
      </p>
    )}

    {preferences?.businessGstin && (
      <p className="text-slate-600">
        <span className="font-semibold text-slate-800">GSTIN:</span>{" "}
        {preferences.businessGstin}
      </p>
    )}
  </div>
</div>

      {/* Bill To */}
      <div className="grid grid-cols-2 gap-12 mb-8">
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 border-b pb-1">Billed To</h3>
          <p className="text-lg font-bold text-slate-800 mb-1">{data.clientName || "Client Name"}</p>
          {data.clientAddress && <p className="whitespace-pre-line text-slate-600 mb-2">{data.clientAddress}</p>}
          {data.clientGstin && <p className="text-slate-600"><span className="font-semibold text-slate-800">GSTIN:</span> {data.clientGstin}</p>}
          {data.clientEmail && <p className="text-slate-600">{data.clientEmail}</p>}
          {data.clientPhone && <p className="text-slate-600">{data.clientPhone}</p>}
        </div>
        <div className="bg-slate-50 p-6 rounded-lg border border-slate-100">
          <div className="grid grid-cols-2 gap-y-3 gap-x-4">
            <div className="text-slate-500">PO / Ref:</div>
            <div className="font-medium text-right">{data.poRef || "-"}</div>
            <div className="text-slate-500">Place of Supply:</div>
            <div className="font-medium text-right">{data.placeOfSupply || "-"}</div>
            <div className="text-slate-500">Transaction Mode:</div>
            <div className="font-medium text-right">{data.transactionMode}</div>
            <div className="text-slate-500">Tax Type:</div>
            <div className="font-medium text-right">{data.taxInclusive ? "Inclusive" : "Exclusive"}</div>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-8">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-800 text-white text-xs uppercase tracking-wider">
              <th className="py-3 px-4 font-semibold rounded-tl-lg">Description</th>
              <th className="py-3 px-4 font-semibold">HSN</th>
              <th className="py-3 px-4 font-semibold text-right">Qty</th>
              <th className="py-3 px-4 font-semibold text-right">Rate</th>
              <th className="py-3 px-4 font-semibold text-right">Tax %</th>
              <th className="py-3 px-4 font-semibold text-right rounded-tr-lg">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y border-b border-slate-200">
            {data.items.length > 0 ? data.items.map((item, i) => {
              const qty = item.qty || 0;
              const rate = item.rate || 0;
              const baseTotal = qty * rate;
              const taxPct = (item.cgst || 0) + (item.sgst || 0) + (item.cess || 0);
              return (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="py-4 px-4 align-top">
                    <p className="font-medium text-slate-800">{item.description || "-"}</p>
                    {item.discount > 0 && (
                      <p className="text-xs text-green-600 mt-1">Discount: {item.discount}{item.discountType}</p>
                    )}
                  </td>
                  <td className="py-4 px-4 align-top text-slate-600">{item.hsn || "-"}</td>
                  <td className="py-4 px-4 align-top text-right text-slate-600">{qty} {item.unit}</td>
                  <td className="py-4 px-4 align-top text-right text-slate-600">₹{rate.toFixed(2)}</td>
                  <td className="py-4 px-4 align-top text-right text-slate-600">{taxPct > 0 ? `${taxPct}%` : "-"}</td>
                  <td className="py-4 px-4 align-top text-right font-medium text-slate-800">₹{baseTotal.toFixed(2)}</td>
                </tr>
              )
            }) : (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400 italic">No items added to this invoice.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Totals & Notes */}
      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-7 space-y-6">
          {(data.bankName || data.accountNumber) && (
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 border-b pb-1">Bank Details</h3>
              <div className="bg-slate-50 p-4 rounded-lg text-sm border border-slate-100">
                {data.bankName && <p className="mb-1"><span className="text-slate-500 w-24 inline-block">Bank:</span> <span className="font-medium">{data.bankName}</span></p>}
                {data.accountNumber && <p className="mb-1"><span className="text-slate-500 w-24 inline-block">A/C No:</span> <span className="font-medium">{data.accountNumber}</span></p>}
                {data.ifscCode && <p className="mb-1"><span className="text-slate-500 w-24 inline-block">IFSC:</span> <span className="font-medium">{data.ifscCode}</span></p>}
                {data.upiId && <p className="mb-1"><span className="text-slate-500 w-24 inline-block">UPI:</span> <span className="font-medium">{data.upiId}</span></p>}
              </div>
            </div>
          )}

          {data.notes && (
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 border-b pb-1">Notes</h3>
              <p className="whitespace-pre-line text-slate-600 text-sm">{data.notes}</p>
            </div>
          )}
          
          {data.terms && (
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 border-b pb-1">Terms & Conditions</h3>
              <p className="whitespace-pre-line text-slate-600 text-xs">{data.terms}</p>
            </div>
          )}
        </div>

        <div className="col-span-5">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Taxable Value</span>
              <span>₹ {totals.taxableValue.toFixed(2)}</span>
            </div>
            
            {(totals.totalCgst > 0 || totals.totalSgst > 0) && (
              <div className="flex justify-between text-slate-600">
                <span>CGST + SGST</span>
                <span>₹ {(totals.totalCgst + totals.totalSgst).toFixed(2)}</span>
              </div>
            )}
            
            {totals.totalCess > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>CESS</span>
                <span>₹ {totals.totalCess.toFixed(2)}</span>
              </div>
            )}

            {data.shipping > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Shipping</span>
                <span>+ ₹ {data.shipping.toFixed(2)}</span>
              </div>
            )}

            {totals.overallDiscountVal > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>- ₹ {totals.overallDiscountVal.toFixed(2)}</span>
              </div>
            )}

            <div className="h-px bg-slate-200 my-2"></div>
            
            <div className="flex justify-between text-lg font-bold text-slate-900">
              <span>Grand Total</span>
              <span>₹ {totals.grandTotal.toFixed(2)}</span>
            </div>

            {data.advancePaid > 0 && (
              <>
                <div className="flex justify-between text-slate-600">
                  <span>Advance Paid</span>
                  <span>- ₹ {data.advancePaid.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-primary bg-primary/5 p-2 rounded border border-primary/20">
                  <span>Balance Due</span>
                  <span>₹ {totals.balanceDue.toFixed(2)}</span>
                </div>
              </>
            )}
          </div>
          
  <div className="mt-8 flex justify-end border-t border-dashed pt-6">
  <div className="relative w-52 h-48">

    {/* SEAL (base layer) */}
    {preferences?.sealUrl && (
      <img
        src={preferences.sealUrl}
        alt="Company Seal"
        className="absolute bottom-6 right-0 w-36 object-contain opacity-80"
      />
    )}

    {/* SIGNATURE (overlapping above seal) */}
    {preferences?.signatureUrl && (
      <img
        src={preferences.signatureUrl}
        alt="Digital Signature"
        className="absolute bottom-20 right-2 w-32 object-contain z-10"
      />
    )}

    {/* AUTHORIZED SIGNATORY TEXT */}
    <div className="absolute bottom-0 right-2 text-xs text-slate-600 font-medium">
      Authorized Signatory
    </div>

  </div>
</div>


<div className="mt-8 flex justify-end text-slate-400 text-xs italic pr-2">
  <p>Generated by YaSi Invoice</p>
</div>
        </div>
      </div>
    </div>
  );
}
