import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Bold, Italic, Underline, Strikethrough, Palette } from "lucide-react";
import { CORE_COLORS } from "@/constants/colors";

interface TextPropertiesPanelProps {
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
}

const fontFamilies = [
  { value: "Arial", label: "Arial" },
  { value: "Helvetica", label: "Helvetica" },
  { value: "Times New Roman", label: "Times New Roman" },
  { value: "Georgia", label: "Georgia" },
  { value: "Verdana", label: "Verdana" },
  { value: "Courier New", label: "Courier New" },
];

export const TextPropertiesPanel = ({
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
  top
}: TextPropertiesPanelProps) => {
  return (
    <div 
      className="glass-panel p-3 space-y-3 w-64 fixed z-50"
      style={{ left, top }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Font Family */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-foreground">Font Family</label>
        <Select value={fontFamily} onValueChange={onFontFamilyChange}>
          <SelectTrigger className="h-8 text-xs border-[0.8px] border-[#D3D3D3]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="glass-panel border-[0.8px] border-[#D3D3D3]">
            {fontFamilies.map((font) => (
              <SelectItem key={font.value} value={font.value} className="text-xs">
                {font.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Font Size */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-foreground">
          Font Size: {fontSize}px
        </label>
        <Slider
          value={[fontSize]}
          onValueChange={(value) => onFontSizeChange(value[0])}
          min={8}
          max={72}
          step={1}
          className="w-full"
        />
      </div>

      {/* Text Formatting */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-foreground">Formatting</label>
        <div className="flex gap-1">
          <Button
            variant={isBold ? "secondary" : "ghost"}
            size="sm"
            onClick={onBoldToggle}
            className="h-8 w-8 p-0 hover:bg-white/10 transition-smooth"
            title="Bold"
          >
            <Bold className="h-3 w-3" />
          </Button>
          <Button
            variant={isItalic ? "secondary" : "ghost"}
            size="sm"
            onClick={onItalicToggle}
            className="h-8 w-8 p-0 hover:bg-white/10 transition-smooth"
            title="Italic"
          >
            <Italic className="h-3 w-3" />
          </Button>
          <Button
            variant={isUnderlined ? "secondary" : "ghost"}
            size="sm"
            onClick={onUnderlineToggle}
            className="h-8 w-8 p-0 hover:bg-white/10 transition-smooth"
            title="Underline"
          >
            <Underline className="h-3 w-3" />
          </Button>
          <Button
            variant={isStrikethrough ? "secondary" : "ghost"}
            size="sm"
            onClick={onStrikethroughToggle}
            className="h-8 w-8 p-0 hover:bg-white/10 transition-smooth"
            title="Strikethrough"
          >
            <Strikethrough className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Text Color */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-foreground">Color</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-full justify-start border-[0.8px] border-[#D3D3D3] hover:bg-white/10 transition-smooth"
            >
              <div
                className="w-4 h-4 rounded border-[0.8px] border-[#D3D3D3] mr-2"
                style={{ backgroundColor: textColor }}
              />
              <Palette className="h-3 w-3 mr-2" />
              Color
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3 glass-panel border-[0.8px] border-[#D3D3D3]">
            <div className="grid grid-cols-6 gap-2">
              {CORE_COLORS.map((color) => (
                <button
                  key={color}
                  className="w-8 h-8 rounded border-[0.8px] border-[#D3D3D3] hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  onClick={() => onTextColorChange(color)}
                  title={color}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};