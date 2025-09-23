import { useState, useEffect, useCallback } from 'react';
import { Object as FabricObject } from 'fabric';

interface UseSmartPropertiesPositionProps {
  selectedObject: FabricObject | null;
  panelWidth?: number;
  panelHeight?: number;
}

interface Position {
  left: number;
  top: number;
}

export const useSmartPropertiesPosition = ({
  selectedObject,
  panelWidth = 280,
  panelHeight = 200,
}: UseSmartPropertiesPositionProps): Position => {
  const [position, setPosition] = useState<Position>({ left: 0, top: 0 });

  const updatePosition = useCallback(() => {
    if (!selectedObject || !selectedObject.canvas) {
      setPosition({ left: 0, top: 0 });
      return;
    }

    const canvas = selectedObject.canvas;
    const canvasElement = canvas.getElement();
    const canvasRect = canvasElement.getBoundingClientRect();
    
    // Get object bounds in canvas coordinates
    const objBounds = selectedObject.getBoundingRect();
    const zoom = canvas.getZoom();
    const vpt = canvas.viewportTransform || [1, 0, 0, 1, 0, 0];
    
    // Convert to screen coordinates
    const objLeft = (objBounds.left * zoom + vpt[4]) + canvasRect.left;
    const objTop = (objBounds.top * zoom + vpt[5]) + canvasRect.top;
    const objRight = objLeft + (objBounds.width * zoom);
    const objBottom = objTop + (objBounds.height * zoom);
    
    // Smart positioning - try above first, then below
    const margin = 12; // Reduced margin for closer positioning
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    let left = objLeft + (objBounds.width * zoom) / 2 - panelWidth / 2;
    let top = objTop - panelHeight - margin;
    
    // For text objects, position closer to account for text baseline
    if (selectedObject.type === 'i-text' || selectedObject.type === 'text') {
      top = objTop - panelHeight - 8; // Much closer for text objects
    }
    
    // Check if positioning above fits on screen
    const fitsAbove = top >= margin;
    const fitsBelow = objBottom + margin + panelHeight <= screenHeight - margin;
    
    // If doesn't fit above but fits below, position below
    if (!fitsAbove && fitsBelow) {
      top = objBottom + margin;
    }
    // If doesn't fit above and doesn't fit below, use the side with more space
    else if (!fitsAbove && !fitsBelow) {
      const spaceAbove = objTop;
      const spaceBelow = screenHeight - objBottom;
      
      if (spaceBelow > spaceAbove) {
        top = objBottom + margin;
      } else {
        top = Math.max(margin, objTop - panelHeight - margin);
      }
    }
    
    // Adjust horizontal position to stay on screen
    if (left < margin) {
      left = margin;
    } else if (left + panelWidth > screenWidth - margin) {
      left = screenWidth - panelWidth - margin;
    }
    
    setPosition({ left, top });
  }, [selectedObject, panelWidth, panelHeight]);

  useEffect(() => {
    updatePosition();
    
    if (!selectedObject || !selectedObject.canvas) return;
    
    // Listen for object movement and transformation events
    const canvas = selectedObject.canvas;
    const handleObjectMove = () => updatePosition();
    
    canvas.on('object:moving', handleObjectMove);
    canvas.on('object:scaling', handleObjectMove);
    canvas.on('object:rotating', handleObjectMove);
    canvas.on('object:modified', handleObjectMove);
    
    return () => {
      canvas.off('object:moving', handleObjectMove);
      canvas.off('object:scaling', handleObjectMove);
      canvas.off('object:rotating', handleObjectMove);
      canvas.off('object:modified', handleObjectMove);
    };
  }, [selectedObject, updatePosition]);

  return position;
};