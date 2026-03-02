
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, Trash2 } from "lucide-react";
import { usePreferences, useUpdatePreferences } from "@/hooks/use-preferences";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";

interface PreferencesSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PreferencesSheet({ open, onOpenChange }: PreferencesSheetProps) {
  const { data: preferences } = usePreferences();
  const updatePreferences = useUpdatePreferences();
  const queryClient = useQueryClient();

  const handleClearHistory = async () => {
    if (confirm("Are you sure you want to clear all invoice history? This cannot be undone.")) {
      // Logic to clear invoices would go here, for now we can simulate or implement if needed
      // Since there's no bulk delete, we'll leave it as a placeholder for now
      alert("This feature is coming soon!");
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] bg-background p-0 border-l-border/50">
        <div className="p-6 border-b border-border/50">
          <SheetHeader>
            <SheetTitle className="font-display text-2xl">Preferences</SheetTitle>
            <SheetDescription>Manage your invoice settings and appearance.</SheetDescription>
          </SheetHeader>
        </div>

        <Tabs defaultValue="appearance" className="w-full h-full flex flex-col">
          <div className="px-6 py-2 border-b border-border/50">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
              <TabsTrigger value="data">Manage Data</TabsTrigger>
            </TabsList>
          </div>

          <div className="p-6 flex-1 overflow-y-auto">
            <TabsContent value="appearance" className="space-y-6 mt-0">
              <div className="space-y-3">
                <h3 className="text-sm font-semibold">Brand Color</h3>
                <div className="flex gap-3">
                  {["#6366f1", "#3b82f6", "#10b981", "#f59e0b", "#ef4444"].map((color) => (
                    <button
                      key={color}
                      className={`w-8 h-8 rounded-full border-2 transition-transform focus:outline-none ${preferences?.brandColor === color ? 'border-primary scale-110' : 'border-transparent hover:scale-110'}`}
                      style={{ backgroundColor: color }}
                      onClick={() => updatePreferences.mutate({ brandColor: color })}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold">Invoice Prefix</h3>
                <Input 
                  placeholder="INV-" 
                  defaultValue={preferences?.invoicePrefix || "INV"} 
                  className="bg-secondary/50" 
                  onBlur={(e) => updatePreferences.mutate({ invoicePrefix: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">This prefix will be added to new invoices automatically.</p>
              </div>
            </TabsContent>

            <TabsContent value="data" className="mt-0 space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Data Management</h3>
                <div className="space-y-3">
                  <div className="p-4 rounded-xl border border-border bg-secondary/20">
                    <h4 className="text-sm font-medium mb-1">Backup Data</h4>
                    <p className="text-xs text-muted-foreground mb-3">Download all your invoice data as a JSON file.</p>
                    <Button variant="outline" size="sm" onClick={() => {
                      const data = JSON.stringify(preferences, null, 2);
                      const blob = new Blob([data], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'yasi-backup.json';
                      a.click();
                    }} className="w-full">
                      Download Backup
                    </Button>
                  </div>
                  <div className="p-4 rounded-xl border border-border bg-secondary/20">
                    <h4 className="text-sm font-medium mb-1">Clear Invoice History</h4>
                    <p className="text-xs text-muted-foreground mb-3">Permanently delete all saved invoices from the database.</p>
                    <Button variant="destructive" size="sm" onClick={handleClearHistory} className="w-full">
                      <Trash2 className="w-4 h-4 mr-2" /> Clear All Invoices
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
