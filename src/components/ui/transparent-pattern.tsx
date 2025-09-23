import { cn } from "@/lib/utils";

interface TransparentPatternProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const TransparentPattern = ({ className, size = "md" }: TransparentPatternProps) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8"
  };

  // If no size is provided or className contains w-full/h-full, fill container
  const shouldFillContainer = className?.includes('w-full') || className?.includes('h-full');

  return (
    <div 
      className={cn(
        "relative overflow-hidden rounded border-[0.8px] border-[#D3D3D3]",
        shouldFillContainer ? "w-full h-full" : sizeClasses[size],
        className
      )}
    >
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(45deg, #D3D3D3 25%, transparent 25%), 
            linear-gradient(-45deg, #D3D3D3 25%, transparent 25%), 
            linear-gradient(45deg, transparent 75%, #D3D3D3 75%), 
            linear-gradient(-45deg, transparent 75%, #D3D3D3 75%)
          `,
          backgroundSize: '6px 6px',
          backgroundPosition: '0 0, 0 3px, 3px -3px, -3px 0px'
        }}
      />
    </div>
  );
};