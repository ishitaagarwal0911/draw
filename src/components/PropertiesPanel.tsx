import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Object as FabricObject } from "fabric";
import { useSmartPropertiesPosition } from "../hooks/useSmartPropertiesPosition";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { TransparentPattern } from "./ui/transparent-pattern";
import { 
  PaintBucket,
  Eye, 
  EyeOff,
  Minus,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  
} from "lucide-react";
import { CORE_COLORS } from "../constants/colors";

interface PropertiesPanelProps {
  selectedObject: FabricObject | null;
  onObjectUpdate: (object: FabricObject, updates: any) => void;
  onDeselect: () => void;
}


export const PropertiesPanel = ({ selectedObject, onObjectUpdate, onDeselect }: PropertiesPanelProps) => {
  const [fillColor, setFillColor] = useState("#000000");
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState(1);
  const [hasFill, setHasFill] = useState(true);
  const [hasStroke, setHasStroke] = useState(false);
  
  // Text properties
  const [textFontFamily, setTextFontFamily] = useState("Inter, sans-serif");
  const [textFontSize, setTextFontSize] = useState(16);
  const [textIsBold, setTextIsBold] = useState(false);
  const [textIsItalic, setTextIsItalic] = useState(false);
  const [textIsUnderlined, setTextIsUnderlined] = useState(false);
  const [textIsStrikethrough, setTextIsStrikethrough] = useState(false);

  // Font families for text objects
  const fontFamilies = [
    { name: "Inter", value: "Inter, sans-serif" },
    { name: "Helvetica", value: "Helvetica, Arial, sans-serif" },
    { name: "Times", value: "Times, 'Times New Roman', serif" },
    { name: "Courier", value: "Courier, 'Courier New', monospace" },
    { name: "Georgia", value: "Georgia, serif" },
    { name: "Arial", value: "Arial, sans-serif" },
  ];

  const position = useSmartPropertiesPosition({
    selectedObject,
    panelWidth: 400, // Horizontal panel is wider
    panelHeight: 60   // But shorter
  });

  useEffect(() => {
    if (!selectedObject) return;

    const fill = selectedObject.get("fill");
    const stroke = selectedObject.get("stroke");
    const strokeWidthValue = selectedObject.get("strokeWidth") || 1;

    // Special handling for drawn paths - auto-show fill as transparent
    if (selectedObject.type === 'path') {
      setHasFill(true); // Show fill chip
      setFillColor("transparent"); // Set to transparent by default
      setHasStroke(true);
      setStrokeColor(stroke || "#000000");
    } else {
      if (typeof fill === "string") {
        setFillColor(fill);
        setHasFill(true);
      } else {
        setHasFill(false);
      }

      if (typeof stroke === "string") {
        setStrokeColor(stroke);
        setHasStroke(true);
      } else {
        setHasStroke(false);
      }
    }

    setStrokeWidth(strokeWidthValue);

    // Update text properties if it's a text object
    if (selectedObject.type === 'i-text' || selectedObject.type === 'text') {
      const textObj = selectedObject as any;
      setTextFontFamily(textObj.fontFamily || "Inter, sans-serif");
      setTextFontSize(textObj.fontSize || 16);
      setTextIsBold(textObj.fontWeight === 'bold');
      setTextIsItalic(textObj.fontStyle === 'italic');
      setTextIsUnderlined(!!textObj.underline);
      setTextIsStrikethrough(!!textObj.linethrough);
    }
  }, [selectedObject]);

  const handleFillToggle = () => {
    if (!selectedObject) return;
    
    const newHasFill = !hasFill;
    setHasFill(newHasFill);
    
    onObjectUpdate(selectedObject, {
      fill: newHasFill ? fillColor : "transparent"
    });
  };

  const handleStrokeToggle = () => {
    if (!selectedObject) return;
    
    const newHasStroke = !hasStroke;
    setHasStroke(newHasStroke);
    
    onObjectUpdate(selectedObject, {
      stroke: newHasStroke ? strokeColor : null,
      strokeWidth: newHasStroke ? strokeWidth : 0
    });
  };

  const handleFillColorChange = (color: string) => {
    setFillColor(color);
    if (selectedObject && hasFill) {
      selectedObject.set('fill', color);
      selectedObject.set('opacity', 1);
      selectedObject.canvas?.renderAll();
      onObjectUpdate(selectedObject, { fill: color, opacity: 1 });
    }
  };

  const handleStrokeColorChange = (color: string) => {
    setStrokeColor(color);
    if (selectedObject && hasStroke) {
      selectedObject.set('stroke', color);
      selectedObject.canvas?.renderAll();
      onObjectUpdate(selectedObject, { stroke: color });
    }
  };

  const handleStrokeWidthChange = (value: number[]) => {
    if (!selectedObject) return;
    
    const newWidth = value[0];
    setStrokeWidth(newWidth);
    
    selectedObject.set('strokeWidth', newWidth);
    selectedObject.canvas?.renderAll();
    onObjectUpdate(selectedObject, { strokeWidth: newWidth });
  };


  // Text formatting handlers
  const handleTextFontFamilyChange = (fontFamily: string) => {
    setTextFontFamily(fontFamily);
    onObjectUpdate(selectedObject, { fontFamily });
  };

  const handleTextFontSizeChange = (fontSize: number) => {
    setTextFontSize(fontSize);
    onObjectUpdate(selectedObject, { fontSize });
  };

  const handleTextColorChange = (color: string) => {
    onObjectUpdate(selectedObject, { fill: color });
  };

  const handleTextBoldToggle = () => {
    const newBold = !textIsBold;
    setTextIsBold(newBold);
    onObjectUpdate(selectedObject, { fontWeight: newBold ? 'bold' : 'normal' });
  };

  const handleTextItalicToggle = () => {
    const newItalic = !textIsItalic;
    setTextIsItalic(newItalic);
    onObjectUpdate(selectedObject, { fontStyle: newItalic ? 'italic' : 'normal' });
  };

  const handleTextUnderlineToggle = () => {
    const newUnderline = !textIsUnderlined;
    setTextIsUnderlined(newUnderline);
    onObjectUpdate(selectedObject, { underline: newUnderline });
  };

  const handleTextStrikethroughToggle = () => {
    const newStrikethrough = !textIsStrikethrough;
    setTextIsStrikethrough(newStrikethrough);
    onObjectUpdate(selectedObject, { linethrough: newStrikethrough });
  };

  if (!selectedObject) return null;

  const isTextObject = selectedObject.type === 'i-text' || selectedObject.type === 'text';

  return (
    <div 
      className="fixed z-30 glass-panel p-4 rounded-xl min-w-64 max-w-80 pointer-events-auto"
      style={{
        left: position.left,
        top: position.top,
      }}
      onClick={(e) => e.stopPropagation()}
    >
        <div className="space-y-4">
          {isTextObject ? (
            // Text formatting controls
            <>
              <div className="space-y-2">
                <span className="text-sm font-medium">Font Family</span>
                <Select value={textFontFamily} onValueChange={handleTextFontFamilyChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fontFamilies.map((font) => (
                      <SelectItem key={font.value} value={font.value}>
                        <span style={{ fontFamily: font.value }}>{font.name}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <span className="text-sm font-medium">Font Size: {textFontSize}px</span>
                <Slider
                  value={[textFontSize]}
                  onValueChange={([value]) => handleTextFontSizeChange(value)}
                  min={8}
                  max={72}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <span className="text-sm font-medium">Text Color</span>
                <div className="grid grid-cols-5 gap-2">
                  {CORE_COLORS.filter(color => color !== "transparent").map((color) => (
                    <button
                      key={color}
                      onClick={() => handleTextColorChange(color)}
                      className="w-8 h-8 rounded border-2 border-border hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-sm font-medium">Formatting</span>
                <div className="grid grid-cols-4 gap-1">
                  <Button
                    variant={textIsBold ? "default" : "outline"}
                    size="sm"
                    onClick={handleTextBoldToggle}
                    className="p-2"
                  >
                    <Bold className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={textIsItalic ? "default" : "outline"}
                    size="sm"
                    onClick={handleTextItalicToggle}
                    className="p-2"
                  >
                    <Italic className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={textIsUnderlined ? "default" : "outline"}
                    size="sm"
                    onClick={handleTextUnderlineToggle}
                    className="p-2"
                  >
                    <Underline className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={textIsStrikethrough ? "default" : "outline"}
                    size="sm"
                    onClick={handleTextStrikethroughToggle}
                    className="p-2"
                  >
                    <Strikethrough className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            // Shape fill/stroke controls
            <>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleFillToggle}
                  className="h-8 w-8 p-0 hover:bg-white/10"
                  title={hasFill ? "Hide fill" : "Show fill"}
                >
                  <PaintBucket className="h-4 w-4" />
                </Button>
                
                {hasFill && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-1 border-[0.8px] border-[#D3D3D3]"
                        style={{ 
                          backgroundColor: fillColor === "transparent" ? "transparent" : fillColor,
                        }}
                        title="Fill color"
                      >
                        {fillColor === "transparent" && (
                          <TransparentPattern className="w-full h-full" />
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-3" side="top">
                       <div className="grid grid-cols-5 gap-2">
                           {CORE_COLORS.map((color) => (
                             <button
                               key={color}
                               onClick={() => handleFillColorChange(color)}
                               className={`w-6 h-6 rounded hover:scale-105 transition-transform border-[0.8px] border-[#D3D3D3] ${
                                 color === "transparent" ? "bg-transparent" : ""
                               }`}
                               style={{ 
                                 backgroundColor: color === "transparent" ? "transparent" : color,
                               }}
                               title={color}
                             >
                               {color === "transparent" && (
                                 <TransparentPattern className="w-full h-full" />
                               )}
                             </button>
                           ))}
                       </div>
                    </PopoverContent>
                  </Popover>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleStrokeToggle}
                  className="h-8 w-8 p-0 hover:bg-white/10"
                  title={hasStroke ? "Hide stroke" : "Show stroke"}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                
                {hasStroke && (
                  <>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-1 border-2"
                          style={{ 
                            backgroundColor: strokeColor,
                            borderColor: strokeColor === "#ffffff" ? "#e5e7eb" : "transparent"
                          }}
                          title="Stroke color"
                        />
                      </PopoverTrigger>
                      <PopoverContent className="w-64 p-3" side="top">
                        <div className="grid grid-cols-5 gap-2">
                          {CORE_COLORS.filter(c => c !== "transparent").map((color) => (
                            <button
                              key={color}
                              onClick={() => handleStrokeColorChange(color)}
                              className="w-6 h-6 rounded border hover:scale-105 transition-transform"
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{strokeWidth}px</span>
                      <Slider
                        value={[strokeWidth]}
                        onValueChange={handleStrokeWidthChange}
                        max={20}
                        min={1}
                        step={1}
                        className="w-16"
                      />
                    </div>
                  </>
                )}
              </div>
            </>
          )}

        </div>
    </div>
  );
};