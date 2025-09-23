import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { TransparentPattern } from "@/components/ui/transparent-pattern";
import { Bold, Italic, Underline, Strikethrough } from "lucide-react";
import { CORE_COLORS } from "../constants/colors";

interface HorizontalTextPropertiesPanelProps {
  fontSize: number;
  fontFamily: string;
  textColor: string;
  isBold: boolean;
  isItalic: boolean;
  isUnderlined: boolean;
  isStrikethrough: boolean;
  onFontSizeChange: (size: number) => void;
  onFontFamilyChange: (family: string) => void;
  onTextColorChange: (color: string) => void;
  onBoldToggle: () => void;
  onItalicToggle: () => void;
  onUnderlineToggle: () => void;
  onStrikethroughToggle: () => void;
  left: number;
  top: number;
  uiTick?: number; // Add uiTick to force re-renders
}

const fontFamilies = [
  { name: "Inter", value: "Inter, sans-serif" },
  { name: "Arial", value: "Arial, sans-serif" },
  { name: "Times", value: "Times New Roman, serif" },
  { name: "Courier", value: "Courier New, monospace" },
  { name: "Helvetica", value: "Helvetica, sans-serif" },
  { name: "Georgia", value: "Georgia, serif" },
];

export const HorizontalTextPropertiesPanel = ({
  fontSize,
  fontFamily,
  textColor,
  isBold,
  isItalic,
  isUnderlined,
  isStrikethrough,
  onFontSizeChange,
  onFontFamilyChange,
  onTextColorChange,
  onBoldToggle,
  onItalicToggle,
  onUnderlineToggle,
  onStrikethroughToggle,
  left,
  top,
}: HorizontalTextPropertiesPanelProps) => {
  return (
    <div 
      className="absolute z-50 glass-panel p-2 flex items-center gap-2 pointer-events-auto"
      style={{ 
        left: `${left}px`, 
        top: `${Math.max(10, top - 80)}px`, // 80px above, minimum 10px from top
        transform: 'translateX(-50%)'
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Font Family */}
      <Select value={fontFamily} onValueChange={onFontFamilyChange}>
        <SelectTrigger className="w-20 h-8 text-xs" onClick={(e) => e.stopPropagation()}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent onClick={(e) => e.stopPropagation()}>
          {fontFamilies.map((font) => (
            <SelectItem key={font.value} value={font.value} onClick={(e) => e.stopPropagation()}>
              <span style={{ fontFamily: font.value }}>{font.name}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Font Size */}
      <div className="flex items-center gap-1">
        <input
          type="number"
          value={fontSize}
          onChange={(e) => onFontSizeChange(parseInt(e.target.value) || 16)}
          className="w-12 h-8 text-xs bg-transparent border border-border rounded px-1 text-center"
          min="8"
          max="72"
          step="2"
        />
        <span className="text-xs text-muted-foreground">px</span>
      </div>

      {/* Text Formatting */}
      <div className="flex gap-1">
        <Button
          variant={isBold ? "secondary" : "ghost"}
          size="sm"
          onClick={onBoldToggle}
          className="h-8 w-8 p-0 hover:bg-white/10 transition-smooth"
        >
          <Bold className="h-3 w-3" />
        </Button>
        <Button
          variant={isItalic ? "secondary" : "ghost"}
          size="sm"
          onClick={onItalicToggle}
          className="h-8 w-8 p-0 hover:bg-white/10 transition-smooth"
        >
          <Italic className="h-3 w-3" />
        </Button>
        <Button
          variant={isUnderlined ? "secondary" : "ghost"}
          size="sm"
          onClick={onUnderlineToggle}
          className="h-8 w-8 p-0 hover:bg-white/10 transition-smooth"
        >
          <Underline className="h-3 w-3" />
        </Button>
        <Button
          variant={isStrikethrough ? "secondary" : "ghost"}
          size="sm"
          onClick={onStrikethroughToggle}
          className="h-8 w-8 p-0 hover:bg-white/10 transition-smooth"
        >
          <Strikethrough className="h-3 w-3" />
        </Button>
      </div>

      {/* Color Picker */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-white/10 transition-smooth"
          >
            {textColor === "transparent" ? (
              <TransparentPattern size="sm" />
            ) : (
              <div 
                className="w-4 h-4 rounded-sm border-[0.8px] border-[#D3D3D3]" 
                style={{ backgroundColor: textColor }}
              />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-32 p-2 glass-panel border-none" side="top">
          <div className="grid grid-cols-5 gap-1">
            {/* Transparent option first */}
            <button
              key="transparent"
              className={`w-5 h-5 rounded-sm border-[0.8px] transition-all relative overflow-hidden ${
                "transparent" === textColor 
                  ? "border-[#D3D3D3] ring-2 ring-[#D3D3D3]/50 scale-110" 
                  : "border-[#D3D3D3] hover:scale-105 hover:border-[#D3D3D3]"
              }`}
              onClick={() => onTextColorChange("transparent")}
            >
              <TransparentPattern size="sm" className="w-full h-full border-none" />
            </button>
            {CORE_COLORS.filter(c => c !== "transparent").map((color) => (
              <button
                key={color}
                className={`w-5 h-5 rounded-sm border-[0.8px] transition-all ${
                  color === textColor 
                    ? "border-[#D3D3D3] ring-2 ring-[#D3D3D3]/50 scale-110" 
                    : "border-[#D3D3D3] hover:scale-105 hover:border-[#D3D3D3]"
                }`}
                style={{ backgroundColor: color }}
                onClick={() => onTextColorChange(color)}
              />
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};