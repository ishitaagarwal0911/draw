import { useState } from "react";
import { ExpandableTabs } from "@/components/ui/expandable-tabs";
import { 
  MousePointer, 
  Hand,
  Trash2, 
  Download,
  Undo,
  Redo,
  PenTool,
  Square,
  Circle,
  Triangle,
  Minus,
  Type
} from "lucide-react";
import { DrawingTool } from "./WhiteboardCanvas";
import { PenOptionsPanel } from "./PenOptionsPanel";
import { ShapesOptionsPanel } from "./ShapesOptionsPanel";
import { ShapeType } from "./ShapesPanel";
import { TextOptionsPanel } from "./TextOptionsPanel";

interface ToolbarProps {
  activeTool: DrawingTool;
  activeShape: ShapeType | null;
  brushColor: string;
  brushSize: number;
  strokeWidth: number;
  fontSize: number;
  fontFamily: string;
  textColor: string;
  isBold: boolean;
  isItalic: boolean;
  isUnderlined: boolean;
  isStrikethrough: boolean;
  onToolClick: (tool: DrawingTool) => void;
  onShapeSelect: (shape: ShapeType) => void;
  onColorChange: (color: string) => void;
  onSizeChange: (size: number) => void;
  onStrokeWidthChange: (width: number) => void;
  onFontSizeChange: (size: number) => void;
  onFontFamilyChange: (family: string) => void;
  onTextColorChange: (color: string) => void;
  onBoldToggle: () => void;
  onItalicToggle: () => void;
  onUnderlineToggle: () => void;
  onStrikethroughToggle: () => void;
  onClear: () => void;
  onExport: () => void;
  onUndo: () => Promise<boolean>;
  onRedo: () => Promise<boolean>;
  canUndo: boolean;
  canRedo: boolean;
}

export const Toolbar = ({
  activeTool,
  activeShape,
  brushColor,
  brushSize,
  strokeWidth,
  fontSize,
  fontFamily,
  textColor,
  isBold,
  isItalic,
  isUnderlined,
  isStrikethrough,
  onToolClick,
  onShapeSelect,
  onColorChange,
  onSizeChange,
  onStrokeWidthChange,
  onFontSizeChange,
  onFontFamilyChange,
  onTextColorChange,
  onBoldToggle,
  onItalicToggle,
  onUnderlineToggle,
  onStrikethroughToggle,
  onClear,
  onExport,
  onUndo,
  onRedo,
  canUndo,
  canRedo
}: ToolbarProps) => {
  const [expandedPanel, setExpandedPanel] = useState<string | null>(null);

  // Get the appropriate shape icon
  const getShapeIcon = () => {
    switch (activeShape) {
      case "rectangle": return Square;
      case "circle": return Circle;
      case "triangle": return Triangle;
      case "line": return Minus;
      default: return Square;
    }
  };

  const tabs = [
    { title: "Select", icon: MousePointer, type: "tab" as const },
    { title: "Pan", icon: Hand, type: "tab" as const },
    { type: "separator" as const },
    { title: "Draw", icon: PenTool, type: "tab" as const },
    { title: "Shapes", icon: activeShape ? getShapeIcon() : Square, type: "tab" as const },
    { title: "Text", icon: Type, type: "tab" as const },
    { type: "separator" as const },
    { title: "Undo", icon: Undo, type: "tab" as const },
    { title: "Redo", icon: Redo, type: "tab" as const },
    { type: "separator" as const },
    { title: "Clear", icon: Trash2, type: "tab" as const },
    { title: "Export", icon: Download, type: "tab" as const },
  ];

  const handleTabChange = (index: number | null) => {
    if (index === null) {
      setExpandedPanel(null);
      return;
    }
    
    const tab = tabs[index];
    if (!tab || tab.type === "separator") return;

    const tabTitle = (tab as any).title;
    
    switch (tabTitle) {
      case "Select":
        onToolClick("select");
        setExpandedPanel(null);
        break;
      case "Pan":
        onToolClick("pan");
        setExpandedPanel(null);
        break;
      case "Draw":
        onToolClick("pen");
        setExpandedPanel("Draw");
        break;
      case "Shapes":
        onToolClick("shape");
        setExpandedPanel("Shapes");
        break;
      case "Text":
        onToolClick("text");
        setExpandedPanel("Text");
        break;
      case "Undo":
        if (canUndo) onUndo();
        setExpandedPanel(null);
        break;
      case "Redo":
        if (canRedo) onRedo();
        setExpandedPanel(null);
        break;
      case "Clear":
        onClear();
        setExpandedPanel(null);
        break;
      case "Export":
        onExport();
        setExpandedPanel(null);
        break;
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <ExpandableTabs
        tabs={tabs}
        onChange={handleTabChange}
        className="glass-panel"
      />
      
      {/* Show detailed options when expanded */}
      {expandedPanel === "Draw" && (
        <PenOptionsPanel
          brushSize={brushSize}
          brushColor={brushColor}
          onSizeChange={onSizeChange}
          onColorChange={onColorChange}
        />
      )}
      
      {expandedPanel === "Shapes" && (
        <ShapesOptionsPanel
          activeShape={activeShape}
          strokeWidth={strokeWidth}
          onShapeSelect={onShapeSelect}
          onStrokeWidthChange={onStrokeWidthChange}
        />
      )}
    </div>
  );
};