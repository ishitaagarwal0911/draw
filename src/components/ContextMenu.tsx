import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Download, Clipboard, Scissors, CopyPlus, BringToFront, SendToBack } from "lucide-react";

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onCut?: () => void;
  onDuplicate?: () => void;
  onBringToFront?: () => void;
  onSendToBack?: () => void;
  onDownload: () => void;
  hasSelectedObject?: boolean;
}

export const ContextMenu = ({ 
  x, 
  y, 
  onClose, 
  onCopy, 
  onPaste, 
  onCut,
  onDuplicate,
  onBringToFront,
  onSendToBack,
  onDownload,
  hasSelectedObject = false 
}: ContextMenuProps) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  // Calculate position to keep menu within viewport
  const getAdjustedPosition = () => {
    const menuWidth = 105; // Fixed menu width
    const menuHeight = hasSelectedObject ? 280 : 120; // Approximate menu height based on items
    
    let adjustedX = x;
    let adjustedY = y;
    
    // Check right boundary
    if (x + menuWidth > window.innerWidth) {
      adjustedX = window.innerWidth - menuWidth - 10;
    }
    
    // Check bottom boundary
    if (y + menuHeight > window.innerHeight) {
      adjustedY = window.innerHeight - menuHeight - 10;
    }
    
    // Ensure menu doesn't go off left or top
    adjustedX = Math.max(10, adjustedX);
    adjustedY = Math.max(10, adjustedY);
    
    return { left: adjustedX, top: adjustedY };
  };

  const position = getAdjustedPosition();

  return (
    <div
      className="fixed z-[99999] glass-panel p-1 rounded-lg shadow-lg w-[105px] border border-border"
      style={position}
      onClick={(e) => e.stopPropagation()}
    >
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start gap-2 h-8 truncate"
        onClick={() => {
          onCopy();
          onClose();
        }}
      >
        <Copy className="h-4 w-4" />
        Copy
      </Button>
      
      {hasSelectedObject && onCut && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 h-8 truncate"
          onClick={() => {
            onCut();
            onClose();
          }}
        >
          <Scissors className="h-4 w-4" />
          Cut
        </Button>
      )}
      
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start gap-2 h-8 truncate"
        onClick={() => {
          onPaste();
          onClose();
        }}
      >
        <Clipboard className="h-4 w-4" />
        Paste
      </Button>
      
      {hasSelectedObject && onDuplicate && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 h-8 truncate"
          onClick={() => {
            onDuplicate();
            onClose();
          }}
        >
          <CopyPlus className="h-4 w-4" />
          Duplicate
        </Button>
      )}
      
      {hasSelectedObject && onBringToFront && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 h-8 truncate"
          onClick={() => {
            onBringToFront();
            onClose();
          }}
        >
          <BringToFront className="h-4 w-4" />
          Bring to Front
        </Button>
      )}
      
      {hasSelectedObject && onSendToBack && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 h-8 truncate"
          onClick={() => {
            onSendToBack();
            onClose();
          }}
        >
          <SendToBack className="h-4 w-4" />
          Send to Back
        </Button>
      )}
      
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start gap-2 h-8 truncate"
        onClick={() => {
          onDownload();
          onClose();
        }}
      >
        <Download className="h-4 w-4" />
        Download
      </Button>
    </div>
  );
};