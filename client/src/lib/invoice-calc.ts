import { type z } from "zod";
import { type invoiceDataSchema } from "@shared/schema";

type InvoiceData = z.infer<typeof invoiceDataSchema>;

export function calculateInvoiceTotals(data: Partial<InvoiceData>) {
  const items = data.items || [];
  
  let taxableValue = 0;
  let totalCgst = 0;
  let totalSgst = 0;
  let totalCess = 0;

  items.forEach(item => {
    const qty = item.qty || 0;
    const rate = item.rate || 0;
    let discount = item.discount || 0;
    
    // Calculate base item total
    let itemTotal = qty * rate;
    
    // Apply item discount
    if (item.discountType === "%") {
      itemTotal = itemTotal - (itemTotal * (discount / 100));
    } else {
      itemTotal = itemTotal - discount;
    }
    
    // Ensure it doesn't go negative
    itemTotal = Math.max(0, itemTotal);
    taxableValue += itemTotal;
    
    // Calculate taxes on discounted item total
    totalCgst += itemTotal * ((item.cgst || 0) / 100);
    totalSgst += itemTotal * ((item.sgst || 0) / 100);
    totalCess += itemTotal * ((item.cess || 0) / 100);
  });

  const shipping = data.shipping || 0;
  const advance = data.advancePaid || 0;
  
  // Apply overall discount
  let overallDiscountVal = 0;
  const odValue = data.overallDiscount || 0;
  if (data.overallDiscountType === "%") {
    overallDiscountVal = taxableValue * (odValue / 100);
  } else {
    overallDiscountVal = odValue;
  }

  // Grand Total calculation
  let grandTotal = taxableValue + shipping + totalCgst + totalSgst + totalCess - overallDiscountVal;
  
  if (data.autoRoundOff) {
    grandTotal = Math.round(grandTotal);
  }

  // Advance paid
  const balanceDue = Math.max(0, grandTotal - advance);

  return {
    taxableValue,
    totalCgst,
    totalSgst,
    totalCess,
    grandTotal,
    balanceDue,
    overallDiscountVal
  };
}
