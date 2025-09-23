import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { 
  Square, 
  Circle, 
  Triangle, 
  Minus
} from "lucide-react";
import { ShapeType } from "./ShapesPanel";

interface ShapesOptionsPanelProps {
  activeShape: ShapeType | null;
  strokeWidth: number;
  onShapeSelect: (shape: ShapeType) => void;
  onStrokeWidthChange: (width: number) => void;
}

const shapes = [
  { name: "Rectangle", type: "rectangle" as const, icon: Square },
  { name: "Circle", type: "circle" as const, icon: Circle },
  { name: "Triangle", type: "triangle" as const, icon: Triangle },
  { name: "Line", type: "line" as const, icon: Minus },
];

export const ShapesOptionsPanel = ({ 
  activeShape, 
  strokeWidth, 
  onShapeSelect, 
  onStrokeWidthChange 
}: ShapesOptionsPanelProps) => {
  return (
    <div className="glass-panel mt-2 p-3 space-y-4" onClick={(e) => e.stopPropagation()}>
      {/* Shape Selection */}
      <div className="flex items-center gap-2">
        {shapes.map((shape) => {
          const Icon = shape.icon;
          return (
            <Button
              key={shape.type}
              variant={activeShape === shape.type ? "secondary" : "ghost"}
              size="sm"
              onClick={() => onShapeSelect(shape.type)}
              className="h-8 w-8 p-0 hover:bg-white/10 transition-smooth"
              title={shape.name}
            >
              <Icon className="h-4 w-4" />
            </Button>
          );
        })}
      </div>

      <Separator />

      {/* Stroke Width */}
      <div>
        <label className="text-sm font-medium mb-2 block">
          Stroke: {strokeWidth}px
        </label>
        <Slider
          value={[strokeWidth]}
          onValueChange={(value) => onStrokeWidthChange(value[0])}
          max={10}
          min={1}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>1px</span>
          <span>10px</span>
        </div>
      </div>
    </div>
  );
};