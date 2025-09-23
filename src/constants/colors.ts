export const CORE_COLORS = [
  "transparent", // Transparent (default)
  "#000000", // Black
  "#EF4444", // Red  
  "#F97316", // Orange
  "#EAB308", // Yellow
  "#22C55E", // Green
  "#3B82F6", // Blue
  "#8B5CF6", // Purple
  "#A0522D", // Brown
  "#FFFFFF", // White
];

export const getColorName = (color: string): string => {
  const colorMap: Record<string, string> = {
    "transparent": "Transparent",
    "#000000": "Black",
    "#EF4444": "Red",
    "#F97316": "Orange", 
    "#EAB308": "Yellow",
    "#22C55E": "Green",
    "#3B82F6": "Blue",
    "#8B5CF6": "Purple",
    "#A0522D": "Brown",
    "#FFFFFF": "White",
  };
  return colorMap[color] || "Custom";
};

// Utility function to get effective color based on selection and theme
export const getEffectiveColor = (selectedColor: string, themeDefault: string): string => {
  return selectedColor === "transparent" ? themeDefault : selectedColor;
};