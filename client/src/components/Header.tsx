import { 
  FileText, 
  Settings, 
  History, 
  Share2, 
  Save, 
  RefreshCcw, 
  Plus, 
  Download, 
  Eye, 
  Edit3 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";


interface HeaderProps {
  mode: "form" | "preview";
  setMode: (mode: "form" | "preview") => void;
  onSave: () => void;
  onNew: () => void;
  onHistory: () => void;
  onInvoices: () => void;
  onShare: () => void;
  onSettings: () => void;
  onPrint: () => void;
  isSaving: boolean;
}

export function Header({ 
  mode, setMode, onSave, onNew, onHistory, onInvoices, onShare, onSettings, onPrint, isSaving 
}: HeaderProps) {
  
 

  return (
    <header className="glass-effect sticky top-0 z-40 px-4 py-3 flex items-center justify-between flex-wrap gap-4">
      {/* Left: Brand & Badges */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-primary">
          <div className="bg-primary/10 p-2 rounded-xl">
            <FileText className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-display font-bold hidden sm:block">YaSi Invoice</h1>
        </div>
        <div className="hidden md:flex items-center gap-2">
        <Badge variant="outline" className="text-muted-foreground border-border/60">GST Invoice Generator</Badge>
        </div>
      </div>

      {/* Middle: Actions */}
      <div className="flex items-center bg-secondary/50 p-1 rounded-xl">
        <Button variant="ghost" size="sm" onClick={onNew} className="text-muted-foreground hover:text-foreground">
          <Plus className="w-4 h-4 mr-1.5" /> New
        </Button>
        <div className="w-px h-5 bg-border mx-1"></div>
        <Button variant="ghost" size="sm" onClick={onSave} disabled={isSaving} className="text-muted-foreground hover:text-foreground">
          <Save className="w-4 h-4 mr-1.5" /> {isSaving ? "Saving..." : "Save"}
        </Button>
        <div className="w-px h-5 bg-border mx-1"></div>
        <Button variant="ghost" size="sm" onClick={onInvoices} className="text-muted-foreground hover:text-foreground hidden sm:flex">
          <FileText className="w-4 h-4 mr-1.5" /> Invoices
        </Button>
        <div className="w-px h-5 bg-border mx-1 hidden sm:block"></div>
        <Button variant="ghost" size="sm" onClick={onHistory} className="text-muted-foreground hover:text-foreground hidden sm:flex">
          <History className="w-4 h-4 mr-1.5" /> History
        </Button>
        <div className="w-px h-5 bg-border mx-1 hidden sm:block"></div>
        <Button variant="ghost" size="sm" onClick={onShare} className="text-primary hover:text-primary/80 hover:bg-primary/5">
          <Share2 className="w-4 h-4 mr-1.5" /> Share
        </Button>
      </div>

      {/* Right: Toggles & Export */}
      <div className="flex items-center gap-3">
        <div className="flex items-center bg-secondary rounded-lg p-1">
          <Button 
            size="sm" 
            variant={mode === "form" ? "default" : "ghost"}
            className={mode === "form" ? "shadow-sm" : ""}
            onClick={() => setMode("form")}
          >
            <Edit3 className="w-4 h-4 sm:mr-1.5" /> <span className="hidden sm:inline">Form</span>
          </Button>
          <Button 
            size="sm" 
            variant={mode === "preview" ? "default" : "ghost"}
            className={mode === "preview" ? "shadow-sm" : ""}
            onClick={() => setMode("preview")}
          >
            <Eye className="w-4 h-4 sm:mr-1.5" /> <span className="hidden sm:inline">Preview</span>
          </Button>
        </div>

        <Button variant="outline" size="icon" onClick={onPrint} className="hidden sm:flex border-border/50 text-muted-foreground hover:text-foreground">
          <Download className="w-4 h-4" />
        </Button>
        
        <Button variant="outline" size="icon" onClick={onSettings} className="border-border/50 text-muted-foreground hover:text-foreground">
          <Settings className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
}
