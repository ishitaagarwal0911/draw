import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Square, 
  Circle, 
  Triangle, 
  Minus, 
  ArrowRight,
  ChevronDown
} from "lucide-react";

export type ShapeType = "rectangle" | "circle" | "triangle" | "line";

interface ShapesPanelProps {
  activeShape: ShapeType | null;
  onShapeSelect: (shape: ShapeType) => void;
}

const shapes = [
  { name: "Rectangle", type: "rectangle" as const, icon: Square },
  { name: "Circle", type: "circle" as const, icon: Circle },
  { name: "Triangle", type: "triangle" as const, icon: Triangle },
  { name: "Line", type: "line" as const, icon: Minus },
];

export const ShapesPanel = ({ activeShape, onShapeSelect }: ShapesPanelProps) => {
  const currentShape = shapes.find(s => s.type === activeShape);
  const CurrentIcon = currentShape?.icon || Square;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={activeShape ? "default" : "ghost"}
          size="sm"
          className="h-9 w-9 p-0 hover:bg-white/10 transition-smooth"
          title="Shapes"
        >
          <CurrentIcon className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-36 p-2 glass-panel border-none" side="top">
        <div className="grid grid-cols-3 gap-1">
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
      </PopoverContent>
    </Popover>
  );
};