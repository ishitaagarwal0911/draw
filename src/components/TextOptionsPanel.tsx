import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { TransparentPattern } from "@/components/ui/transparent-pattern";
import { Bold, Italic, Underline, Strikethrough, Palette } from "lucide-react";
import { CORE_COLORS } from "../constants/colors";

interface TextOptionsPanelProps {
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
}

const fontFamilies = [
  { name: "Inter", value: "Inter, sans-serif" },
  { name: "Arial", value: "Arial, sans-serif" },
  { name: "Times", value: "Times New Roman, serif" },
  { name: "Courier", value: "Courier New, monospace" },
  { name: "Helvetica", value: "Helvetica, sans-serif" },
  { name: "Georgia", value: "Georgia, serif" },
];

export const TextOptionsPanel = ({
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
}: TextOptionsPanelProps) => {
  return (
    <div className="glass-panel mt-2 p-3" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center gap-3 flex-wrap">
        {/* Font Family - Compact */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium">Font</label>
          <Select value={fontFamily} onValueChange={onFontFamilyChange}>
            <SelectTrigger className="w-24 h-8" onClick={(e) => e.stopPropagation()}>
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
        </div>

        {/* Font Size - Compact */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium">{fontSize}px</label>
          <Slider
            value={[fontSize]}
            onValueChange={(value) => onFontSizeChange(value[0])}
            max={72}
            min={8}
            step={2}
            className="w-20"
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        {/* Text Formatting */}
        <div className="flex gap-1">
          <Button
            variant={isBold ? "secondary" : "ghost"}
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onBoldToggle();
            }}
            className="h-8 w-8 p-0 hover:bg-white/10 transition-smooth"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant={isItalic ? "secondary" : "ghost"}
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onItalicToggle();
            }}
            className="h-8 w-8 p-0 hover:bg-white/10 transition-smooth"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            variant={isUnderlined ? "secondary" : "ghost"}
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onUnderlineToggle();
            }}
            className="h-8 w-8 p-0 hover:bg-white/10 transition-smooth"
          >
            <Underline className="h-4 w-4" />
          </Button>
          <Button
            variant={isStrikethrough ? "secondary" : "ghost"}
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onStrikethroughToggle();
            }}
            className="h-8 w-8 p-0 hover:bg-white/10 transition-smooth"
          >
            <Strikethrough className="h-4 w-4" />
          </Button>
        </div>

        {/* Color Picker - Collapsible */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-white/10 transition-smooth"
            >
              <div className="flex items-center justify-center">
                {textColor === "transparent" ? (
                  <TransparentPattern size="sm" />
                ) : (
                  <div 
                    className="w-4 h-4 rounded-sm border-[0.8px] border-[#D3D3D3]" 
                    style={{ backgroundColor: textColor }}
                  />
                )}
              </div>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-40 p-3 glass-panel border-none" side="top">
        <div className="grid grid-cols-5 gap-2">
          {/* Transparent option first */}
          <button
            key="transparent"
            className={`w-6 h-6 rounded-sm border-[0.8px] transition-all relative overflow-hidden ${
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
              className={`w-6 h-6 rounded-sm border-[0.8px] transition-all ${
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
    </div>
  );
};