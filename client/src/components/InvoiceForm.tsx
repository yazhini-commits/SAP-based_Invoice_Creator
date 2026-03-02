import { useFieldArray, useFormContext } from "react-hook-form";
import { type z } from "zod";
import { type invoiceDataSchema } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import React from "react";
import { Plus, Trash2, RotateCcw, UploadCloud, Lock, X } from "lucide-react";
import { usePreferences, useUpdatePreferences } from "@/hooks/use-preferences";
import { useInvoices } from "@/hooks/use-invoices";

export function InvoiceForm() {
  const { register, control, watch, setValue } = useFormContext<z.infer<typeof invoiceDataSchema>>();
  const { data: serverPreferences } = usePreferences();
const updatePreferences = useUpdatePreferences();


/* local reactive preferences */
const [preferences, setPreferences] = React.useState<any>({});

React.useEffect(() => {
  if (serverPreferences) {
    setPreferences(serverPreferences);
  }
}, [serverPreferences]);
  const { fields: itemFields, append: appendItem, remove: removeItem } = useFieldArray({
    control,
    name: "items"
  });

  const transactionMode = watch("transactionMode");
  const autoRoundOff = watch("autoRoundOff");
  const taxInclusive = watch("taxInclusive");
  const compressImage = (file: File): Promise<string> =>
  new Promise((resolve) => {
    const img = new Image();
    const canvas = document.createElement("canvas");
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    img.onload = () => {
      const maxWidth = 600;
      const scale = maxWidth / img.width;

      canvas.width = maxWidth;
      canvas.height = img.height * scale;

      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      resolve(canvas.toDataURL("image/jpeg", 0.7));
    };

    reader.readAsDataURL(file);
  });
 

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-24">
      {/* 1. Business Details & 2. Client Details in a Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Business Details */}
        <Card className="p-6 border-border/50 shadow-sm relative">
          <Button 
            variant="ghost" 
            size="sm" 
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            onClick={(e) => {
              e.preventDefault();
              // Reset some fields manually if needed
            }}
          >
            <RotateCcw className="w-4 h-4 mr-1.5" /> Clear All
          </Button>
          <h2 className="section-title">Your Business Details</h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Business Name *</label>
                <input 
                  className="input-styled" 
                  placeholder="YaSi Enterprises"
                  value={preferences?.businessName || ""}
onChange={(e) => {
  const val = e.target.value;

  setPreferences((prev: any) => ({
    ...prev,
    businessName: val,
  }));

  updatePreferences.mutate({ businessName: val });
}}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Your GSTIN</label>
                <input 
                  className="input-styled" 
                  placeholder="22AAAAA0000A1Z5" 
                  defaultValue={preferences?.businessGstin}
                  onBlur={(e) => updatePreferences.mutate({ businessGstin: e.target.value })}
                />
              </div>
            </div>
            
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Business Logo</label>
              {preferences?.businessLogoUrl ? (
                <div className="relative w-32 h-32 border rounded-xl overflow-hidden group">
                  <img src={preferences.businessLogoUrl} alt="Logo" className="w-full h-full object-contain" />
                  <button 
                    className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => updatePreferences.mutate({ businessLogoUrl: "" })}
                  >
                    <X className="w-6 h-6 text-white" />
                  </button>
                </div>
              ) : (
                <div 
                  className="border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center text-center bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
                 onClick={() => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = "image/*";

                    input.onchange = async (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (!file) return;

                    const url = await compressImage(file);

                    setPreferences((prev: any) => ({
                  ...prev,
                    businessLogoUrl: url,
                  }));

    updatePreferences.mutate({ businessLogoUrl: url });
  };

  input.click();
}}
                >
                  <UploadCloud className="w-6 h-6 text-muted-foreground mb-2" />
                  <span className="text-sm font-medium text-muted-foreground">Click to upload logo</span>
                  <span className="text-xs text-muted-foreground/60 mt-1">PNG, JPG up to 2MB</span>
                </div>
              )}
            </div>
            
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Business Address</label>
              <textarea 
                rows={3} 
                className="input-styled bg-blue-50/50 resize-none" 
                placeholder="123 Business Avenue, Tech Park..." 
                defaultValue={preferences?.businessAddress}
                onBlur={(e) => updatePreferences.mutate({ businessAddress: e.target.value })}
              />
            </div>
          </div>
        </Card>

        {/* Client Details */}
        <Card className="p-6 border-border/50 shadow-sm">
          <h2 className="section-title">Client Details</h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Client Name *</label>
                <input {...register("clientName")} className="input-styled" placeholder="Client Name" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Client GSTIN</label>
                <input {...register("clientGstin")} className="input-styled uppercase" placeholder="GSTIN" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Client Email</label>
                <input {...register("clientEmail")} type="email" className="input-styled" placeholder="client@example.com" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Client Phone</label>
                <input {...register("clientPhone")} className="input-styled" placeholder="+91 9876543210" />
              </div>
            </div>
            
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Client Address</label>
              <textarea {...register("clientAddress")} rows={3} className="input-styled resize-none" placeholder="Billing address..." />
            </div>
          </div>
        </Card>
      </div>

      {/* 3. Invoice Details */}
      <Card className="p-6 border-border/50 shadow-sm">
        <h2 className="section-title">Invoice Details</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Document Type</label>
            <Select onValueChange={(val) => setValue("type", val)} defaultValue={watch("type")}>
              <SelectTrigger className="input-styled h-auto py-2.5">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Tax Invoice">Tax Invoice</SelectItem>
                <SelectItem value="Proforma Invoice">Proforma Invoice</SelectItem>
                <SelectItem value="Estimate">Estimate</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Invoice Number</label>
            <input {...register("number")} className="input-styled font-mono font-medium" placeholder="INV-001" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Invoice Date</label>
            <input {...register("date")} type="date" className="input-styled" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Due Date</label>
            <input {...register("dueDate")} type="date" className="input-styled" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">PO / Ref Number</label>
            <input {...register("poRef")} className="input-styled" placeholder="PO-2024-01" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Place of Supply</label>
            <Select onValueChange={(val) => setValue("placeOfSupply", val)} defaultValue={watch("placeOfSupply")}>
              <SelectTrigger className="input-styled h-auto py-2.5">
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Maharashtra">Maharashtra (27)</SelectItem>
                <SelectItem value="Delhi">Delhi (27)</SelectItem>
                <SelectItem value="Karnataka">Karnataka (07)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Transaction Mode</label>
            <div className="flex bg-secondary p-1 rounded-xl">
              <button 
                type="button"
                className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-all ${transactionMode === 'Intrastate' ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground'}`}
                onClick={() => setValue("transactionMode", "Intrastate")}
              >
                Intrastate
              </button>
              <button 
                type="button"
                className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-all ${transactionMode === 'Interstate' ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground'}`}
                onClick={() => setValue("transactionMode", "Interstate")}
              >
                Interstate
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-8 py-3 px-4 bg-muted/40 rounded-xl border border-border/50">
          <div className="flex items-center space-x-2">
            <Switch checked={taxInclusive} onCheckedChange={(val) => setValue("taxInclusive", val)} id="taxInc" />
            <label htmlFor="taxInc" className="text-sm font-medium">Tax-Inclusive Prices</label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="rcm" onCheckedChange={(val) => setValue("rcm", val)} />
            <label htmlFor="rcm" className="text-sm font-medium">Reverse Charge (RCM)</label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch checked={autoRoundOff} onCheckedChange={(val) => setValue("autoRoundOff", val)} id="rnd" />
            <label htmlFor="rnd" className="text-sm font-medium">Auto Round-off Total</label>
          </div>
        </div>
      </Card>

      {/* 4. Items / Services */}
      <Card className="p-6 border-border/50 shadow-sm">
        <div className="flex items-center justify-between mb-6 border-l-4 border-primary pl-3">
          <h2 className="text-sm font-bold tracking-widest text-muted-foreground uppercase">Items / Services</h2>
          <Button 
            size="sm" 
            className="bg-primary/10 text-primary hover:bg-primary hover:text-white"
            onClick={(e) => {
              e.preventDefault();
              appendItem({ id: Date.now().toString(), description: "", qty: 1, rate: 0, discount: 0, discountType: "%", cgst: 0, sgst: 0, cess: 0, unit: "Nos" });
            }}
          >
            <Plus className="w-4 h-4 mr-1.5" /> Add Item
          </Button>
        </div>

        <div className="space-y-4">
          {itemFields.map((field, index) => (
            <div key={field.id} className="p-4 rounded-xl border border-border/80 bg-secondary/20 relative group">
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-full w-8 h-8 transition-all shadow-md"
                onClick={() => removeItem(index)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 md:col-span-5">
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Description</label>
                  <input {...register(`items.${index}.description`)} className="input-styled" placeholder="Item name or service description" />
                </div>
                <div className="col-span-6 md:col-span-2">
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">HSN/SAC</label>
                  <input {...register(`items.${index}.hsn`)} className="input-styled" placeholder="Code" />
                </div>
                <div className="col-span-6 md:col-span-2">
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Qty</label>
                  <div className="flex gap-1">
                    <input {...register(`items.${index}.qty`, { valueAsNumber: true })} type="number" step="0.01" className="input-styled w-2/3" placeholder="1" />
                    <Select onValueChange={(val) => setValue(`items.${index}.unit`, val)} defaultValue={field.unit}>
                      <SelectTrigger className="input-styled w-1/3 px-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Nos">Nos</SelectItem>
                        <SelectItem value="Kg">Kg</SelectItem>
                        <SelectItem value="Hrs">Hrs</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="col-span-6 md:col-span-3">
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Rate / Item (₹)</label>
                  <input {...register(`items.${index}.rate`, { valueAsNumber: true })} type="number" step="0.01" className="input-styled" placeholder="0.00" />
                </div>
              </div>

              <div className="grid grid-cols-12 gap-4 mt-4 pt-4 border-t border-border/50">
                <div className="col-span-6 md:col-span-3">
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Discount</label>
                  <div className="flex gap-1">
                    <input {...register(`items.${index}.discount`, { valueAsNumber: true })} type="number" className="input-styled w-2/3" placeholder="0" />
                    <Select onValueChange={(val) => setValue(`items.${index}.discountType`, val)} defaultValue={field.discountType}>
                      <SelectTrigger className="input-styled w-1/3 px-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="%">%</SelectItem>
                        <SelectItem value="₹">₹</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="col-span-6 md:col-span-3">
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">CGST (%)</label>
                  <input {...register(`items.${index}.cgst`, { valueAsNumber: true })} type="number" className="input-styled" placeholder="0" />
                </div>
                <div className="col-span-6 md:col-span-3">
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">SGST (%)</label>
                  <input {...register(`items.${index}.sgst`, { valueAsNumber: true })} type="number" className="input-styled" placeholder="0" />
                </div>
                <div className="col-span-6 md:col-span-3">
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">CESS (%)</label>
                  <input {...register(`items.${index}.cess`, { valueAsNumber: true })} type="number" className="input-styled" placeholder="0" />
                </div>
              </div>
            </div>
          ))}
          {itemFields.length === 0 && (
            <div className="text-center py-8 text-muted-foreground border-2 border-dashed border-border rounded-xl">
              No items added. Click "+ Add Item" to begin.
            </div>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 5. Bank Details */}
        <Card className="p-6 border-border/50 shadow-sm">
          <h2 className="section-title">Bank & Payment Details</h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Bank Name</label>
              <input {...register("bankName")} className="input-styled" placeholder="e.g. HDFC Bank" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Account Number</label>
              <input {...register("accountNumber")} className="input-styled font-mono" placeholder="XXXXXXXXXXXX" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">IFSC Code</label>
                <input {...register("ifscCode")} className="input-styled uppercase" placeholder="HDFC0001234" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">UPI ID</label>
                <input {...register("upiId")} className="input-styled" placeholder="business@upi" />
              </div>
            </div>
          </div>
        </Card>

        {/* 6. Charges & Deductions */}
        <Card className="p-6 border-border/50 shadow-sm">
          <h2 className="section-title">Charges & Deductions</h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Shipping / Freight (₹)</label>
              <input {...register("shipping", { valueAsNumber: true })} type="number" className="input-styled" placeholder="0.00" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Overall Discount</label>
              <div className="flex gap-2">
                <input {...register("overallDiscount", { valueAsNumber: true })} type="number" className="input-styled w-3/4" placeholder="0" />
                <Select onValueChange={(val) => setValue("overallDiscountType", val)} defaultValue={watch("overallDiscountType") || "%"}>
                  <SelectTrigger className="input-styled w-1/4">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="%">%</SelectItem>
                    <SelectItem value="₹">₹</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Advance Paid (₹)</label>
              <input {...register("advancePaid", { valueAsNumber: true })} type="number" className="input-styled" placeholder="0.00" />
            </div>
          </div>
        </Card>
      </div>

      {/* 7. Notes & Terms */}
      <Card className="p-6 border-border/50 shadow-sm">
        <h2 className="section-title">Notes & Terms</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Additional Notes</label>
            <Textarea {...register("notes")} rows={4} className="input-styled resize-none" placeholder="Thank you for your business!" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Terms & Conditions</label>
            <Textarea {...register("terms")} rows={4} className="input-styled resize-none" placeholder="1. Payment due in 30 days..." />
          </div>
        </div>
      </Card>

      {/* 8. Authenticity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 border-border/50 shadow-sm flex flex-col items-center justify-center min-h-[160px] bg-secondary/30 relative overflow-hidden group">
          <h2 className="text-sm font-bold tracking-widest text-muted-foreground uppercase mb-4 w-full text-left">Digital Signature</h2>
          {preferences?.signatureUrl ? (
            <div className="relative w-full h-32 flex items-center justify-center group">
              <img src={preferences.signatureUrl} alt="Signature" className="max-h-full max-w-full object-contain" />
              <button 
                className="absolute top-0 right-0 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => updatePreferences.mutate({ signatureUrl: "" })}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div 
              className="flex flex-col items-center justify-center text-muted-foreground z-10 cursor-pointer w-full h-full"
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.onchange = async (e) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;

  const url = await compressImage(file);

  setPreferences((prev: any) => ({
    ...prev,
    signatureUrl: url,
  }));

  updatePreferences.mutate({ signatureUrl: url });
};
                input.click();
              }}
            >
              <UploadCloud className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-sm font-medium">Upload Signature</p>
            </div>
          )}
        </Card>

        <Card className="p-6 border-border/50 shadow-sm flex flex-col items-center justify-center min-h-[160px] bg-secondary/30 relative overflow-hidden group">
          <h2 className="text-sm font-bold tracking-widest text-muted-foreground uppercase mb-4 w-full text-left">Company Seal / Stamp</h2>
          {preferences?.sealUrl ? (
            <div className="relative w-full h-32 flex items-center justify-center group">
              <img src={preferences.sealUrl} alt="Company Seal" className="max-h-full max-w-full object-contain" />
              <button 
                className="absolute top-0 right-0 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => updatePreferences.mutate({ sealUrl: "" })}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div 
              className="flex flex-col items-center justify-center text-muted-foreground z-10 cursor-pointer w-full h-full"
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.onchange = async (e) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;

  const url = await compressImage(file);

  setPreferences((prev: any) => ({
    ...prev,
    sealUrl: url,
  }));

  updatePreferences.mutate({ sealUrl: url });
};
                input.click();
              }}
            >
              <UploadCloud className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-sm font-medium">Upload Company Seal</p>
            </div>
          )}
        </Card>
      </div>

    </div>
  );
}
