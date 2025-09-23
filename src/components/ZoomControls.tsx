import { ZoomIn, ZoomOut, Maximize } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface ZoomControlsProps {
  zoom: number;
  onZoom: (direction: "in" | "out" | "fit") => void;
}

export const ZoomControls = ({ zoom, onZoom }: ZoomControlsProps) => {
  return (
    <div className="absolute bottom-6 right-6 z-10 flex flex-col items-center gap-2">
      <div className="glass-panel p-2 flex flex-col items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onZoom("in")}
          className="h-8 w-8 p-0 hover:bg-white/10 transition-smooth"
          title="Zoom In"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onZoom("out")}
          className="h-8 w-8 p-0 hover:bg-white/10 transition-smooth"
          title="Zoom Out"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onZoom("fit")}
          className="h-8 w-8 p-0 hover:bg-white/10 transition-smooth"
          title="Fit to Content"
        >
          <Maximize className="h-4 w-4" />
        </Button>
      </div>
      
      <ThemeToggle />
    </div>
  );
};