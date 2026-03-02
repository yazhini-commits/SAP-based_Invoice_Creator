import { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { invoiceDataSchema } from "@shared/schema";
import { type z } from "zod";
import { Header } from "@/components/Header";
import { SummaryCards } from "@/components/SummaryCards";
import { InvoiceForm } from "@/components/InvoiceForm";
import { InvoicePreview } from "@/components/InvoicePreview";
import { PreferencesSheet } from "@/components/PreferencesSheet";
import { HistoryDialog } from "@/components/HistoryDialog";
import { ShareDialog } from "@/components/ShareDialog";
import { useCreateInvoice } from "@/hooks/use-invoices";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useInvoices } from "@/hooks/use-invoices";
import { usePreferences } from "@/hooks/use-preferences";
import { InvoicesDialog } from "@/components/InvoicesDialog";


const handlePrint = async () => {
  const element = document.getElementById("print-area");
  if (!element) return;

  // wait images (logo/sign/seal)
  const images = element.getElementsByTagName("img");
  await Promise.all(
    Array.from(images).map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise(resolve => {
        img.onload = resolve;
        img.onerror = resolve;
      });
    })
  );

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
  });

  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF("p", "mm", "a4");
  const imgWidth = 210;
  const pageHeight = 297;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

  // invoice number filename
  const invoiceNumber =
    (document.querySelector('input[name="number"]') as HTMLInputElement)?.value || "invoice";

  pdf.save(`${invoiceNumber}.pdf`);
};
const getTodayDate = () => {
  const today = new Date();
  return today.toLocaleDateString("en-CA");
};
const defaultValues: z.infer<typeof invoiceDataSchema> = {
  type: "Tax Invoice",
  number: "",
  date: getTodayDate(),
  dueDate: "",
  transactionMode: "Intrastate",
  taxInclusive: false,
  rcm: false,
  autoRoundOff: true,
  clientName: "",
  items: [],
  shipping: 0,
  overallDiscount: 0,
  overallDiscountType: "%",
  advancePaid: 0,
};

export default function Home() {
  const [mode, setMode] = useState<"form" | "preview">("form");
  const [prefOpen, setPrefOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [invoicesOpen, setInvoicesOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const methods = useForm<z.infer<typeof invoiceDataSchema>>({
    resolver: zodResolver(invoiceDataSchema),
    defaultValues,
  });

  const { watch, reset, handleSubmit } = methods;
  const formData = watch();

  const createInvoice = useCreateInvoice();
const { data: invoices } = useInvoices();
const { data: preferences } = usePreferences();
const [isInitialized, setIsInitialized] = useState(false);
const getTodayDate = () => {
  const today = new Date();
  return today.toLocaleDateString("en-CA");
};
useEffect(() => {
  if (!invoices || !preferences) return;
  if (isInitialized) return; // 🚨 Prevent reset after save

  const prefix = preferences.invoicePrefix || "INV";

  const numbers = invoices.map(inv => {
    const parts = inv.invoiceNumber?.split("-");
    if (!parts || parts.length < 2) return 0;
    const num = parseInt(parts[1]);
    return isNaN(num) ? 0 : num;
  });

  const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0;
  const nextNumber = maxNumber + 1;
  const padded = String(nextNumber).padStart(3, "0");

  reset({
    ...defaultValues,
    number: `${prefix}-${padded}`,
    date: getTodayDate(),
  });

  setIsInitialized(true); // 👈 Mark as initialized

}, [invoices, preferences, isInitialized]);

 const onValidSubmit = (data: z.infer<typeof invoiceDataSchema>) => {
  createInvoice.mutate({
    invoiceNumber: data.number,
    data,
  });
};

const onInvalidSubmit = (errors: any) => {
  alert("Please fill all required fields before saving.");
  console.log(errors);
};

  const handleNew = () => {
  if (!confirm("Start a new invoice? Unsaved changes will be lost.")) return;

  const nextNumber = (invoices?.length || 0) + 1;
  const padded = String(nextNumber).padStart(3, "0");
  const prefix = preferences?.invoicePrefix || "INV";

  reset({
    ...defaultValues,
    number: `${prefix}-${padded}`,
    date: getTodayDate(),
  });

  setMode("form");
};

  return (
    <div className="min-h-screen bg-muted/30">
      <Header 
        mode={mode}
        setMode={setMode}
        onSave={handleSubmit(onValidSubmit, onInvalidSubmit)}
        onNew={handleNew}
        onHistory={() => setHistoryOpen(true)}
        onInvoices={() => setInvoicesOpen(true)}
        onShare={() => setShareOpen(true)}
        onSettings={() => setPrefOpen(true)}
        onPrint={handlePrint}
        isSaving={createInvoice.isPending}
      />

      <main className="p-4 md:p-6 lg:p-8">
        {mode === "form" ? (
          <div className="max-w-7xl mx-auto animation-fade-in print:hidden">
            <SummaryCards data={formData} />
            <FormProvider {...methods}>
              <form onSubmit={(e) => e.preventDefault()}>
                <InvoiceForm />
              </form>
            </FormProvider>
          </div>
        ) : (
          <div className="py-8 bg-muted/50 rounded-2xl border border-border/50 animation-fade-in shadow-inner overflow-auto">
            <InvoicePreview data={formData} />
          </div>
        )}
      </main>

      <PreferencesSheet open={prefOpen} onOpenChange={setPrefOpen} />
      <HistoryDialog 
        open={historyOpen} 
        onOpenChange={setHistoryOpen} 
        onLoadInvoice={(data) => {
          reset(data);
          setMode("form");
        }} 
      />
    <InvoicesDialog
  open={invoicesOpen}
  onOpenChange={setInvoicesOpen}
  onLoadInvoice={(data) => {
    reset(data);
    setMode("preview");
    setInvoicesOpen(false);
  }}
  onDownload={handlePrint}
/>

      <ShareDialog 
        open={shareOpen} 
        onOpenChange={setShareOpen} 
        data={formData} 
      />
    </div>
  );
}
