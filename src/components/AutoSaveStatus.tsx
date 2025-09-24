// Auto-save status indicator component
import { useEffect, useState } from "react";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";

interface AutoSaveStatusProps {
  isDirty: boolean;
  isOnline?: boolean;
}

export const AutoSaveStatus = ({ isDirty, isOnline = true }: AutoSaveStatusProps) => {
  const [status, setStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    if (isDirty) {
      setStatus('saving');
      // Simulate save completion after 2 seconds
      const timer = setTimeout(() => {
        setStatus('saved');
        setLastSaved(new Date());
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isDirty]);

  const getStatusIcon = () => {
    switch (status) {
      case 'saving':
        return <Clock className="w-3 h-3 animate-pulse text-amber-500" />;
      case 'error':
        return <AlertCircle className="w-3 h-3 text-red-500" />;
      case 'saved':
      default:
        return <CheckCircle className="w-3 h-3 text-green-500" />;
    }
  };

  const getStatusText = () => {
    if (!isOnline) return "Offline";
    switch (status) {
      case 'saving':
        return "Saving...";
      case 'error':
        return "Save failed";
      case 'saved':
      default:
        return lastSaved ? `Saved ${lastSaved.toLocaleTimeString()}` : "Saved";
    }
  };

  return (
    <div 
      className="fixed top-4 right-4 z-50 flex items-center gap-1.5 px-2 py-1 bg-background/80 backdrop-blur-sm border border-border rounded-md text-xs text-muted-foreground shadow-sm"
      data-testid="auto-save-status"
    >
      {getStatusIcon()}
      <span>{getStatusText()}</span>
    </div>
  );
};