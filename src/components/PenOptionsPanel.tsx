import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { TransparentPattern } from "@/components/ui/transparent-pattern";
import { CORE_COLORS } from "../constants/colors";

interface PenOptionsPanelProps {
  brushSize: number;
  brushColor: string;
  onSizeChange: (size: number) => void;
  onColorChange: (color: string) => void;
}

export const PenOptionsPanel = ({
  brushSize,
  brushColor,
  onSizeChange,
  onColorChange,
}: PenOptionsPanelProps) => {
  return (
    <div className="w-64 p-4 glass-panel mt-2 space-y-4" onClick={(e) => e.stopPropagation()}>
      {/* Brush Size */}
      <div>
        <label className="text-sm font-medium mb-2 block">
          Thickness: {brushSize}px
        </label>
        <Slider
          value={[brushSize]}
          onValueChange={(value) => onSizeChange(value[0])}
          max={20}
          min={1}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>1px</span>
          <span>20px</span>
        </div>
      </div>

      {/* Color Selection */}
      <div>
        <label className="text-sm font-medium mb-2 block">Color</label>
        <div className="grid grid-cols-5 gap-2">
          {CORE_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => onColorChange(color)}
              className={`w-8 h-8 rounded hover:scale-110 transition-transform border-[0.8px] border-[#D3D3D3] ${
                brushColor === color ? 'ring-2 ring-primary' : ''
              }`}
              style={{ 
                backgroundColor: color === "transparent" ? "transparent" : color,
              }}
              title={color}
            >
              {color === "transparent" && (
                <TransparentPattern className="w-full h-full" size="sm" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};