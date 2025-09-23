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
    const handleClickOutside = () => onClose();
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("click", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  return (
    <div
      className="fixed z-[99999] glass-panel p-1 rounded-lg shadow-lg min-w-[120px] border border-border"
      style={{ left: x, top: y }}
      onClick={(e) => e.stopPropagation()}
    >
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start gap-2 h-8"
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
          className="w-full justify-start gap-2 h-8"
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
        className="w-full justify-start gap-2 h-8"
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
          className="w-full justify-start gap-2 h-8"
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
          className="w-full justify-start gap-2 h-8"
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
          className="w-full justify-start gap-2 h-8"
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
        className="w-full justify-start gap-2 h-8"
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