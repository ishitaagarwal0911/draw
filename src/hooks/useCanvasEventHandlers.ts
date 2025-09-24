import { useEffect, useRef } from "react";
import { Canvas as FabricCanvas, PencilBrush, Rect, Circle, Triangle, Line, IText, Polygon, Object as FabricObject } from "fabric";
import { DrawingTool } from "../components/WhiteboardCanvas";
import { ShapeType } from "../components/ShapesPanel";


interface UseCanvasEventHandlersProps {
  fabricCanvas: FabricCanvas | null;
  activeTool: DrawingTool;
  activeShape: ShapeType | null;
  brushColor: string;
  brushSize: number;
  strokeWidth: number;
  isDrawing: boolean;
  startPointer: { x: number; y: number } | null;
  currentShape: FabricObject | null;
  fontFamily: string;
  fontSize: number;
  textColor: string;
  isBold: boolean;
  isItalic: boolean;
  isUnderlined: boolean;
  selectedObject: FabricObject | null;
  onIsDrawingChange: (isDrawing: boolean) => void;
  onStartPointerChange: (pointer: { x: number; y: number } | null) => void;
  onCurrentShapeChange: (shape: FabricObject | null) => void;
  onActivateSelect: () => void;
  onDirtyChange: (isDirty: boolean) => void;
  onZoomChange: (zoom: number) => void;
  onSelectedObjectChange: (object: FabricObject | null) => void;
  saveState: () => void;
  themeDefault: string;
  altKeyPressed: { current: boolean };
}

export const useCanvasEventHandlers = ({
  fabricCanvas,
  activeTool,
  activeShape,
  brushColor,
  brushSize,
  strokeWidth,
  isDrawing,
  startPointer,
  currentShape,
  fontFamily,
  fontSize,
  textColor,
  isBold,
  isItalic,
  isUnderlined,
  selectedObject,
  onIsDrawingChange,
  onStartPointerChange,
  onCurrentShapeChange,
  onActivateSelect,
  onDirtyChange,
  onZoomChange,
  onSelectedObjectChange,
  saveState,
  themeDefault,
  altKeyPressed
}: UseCanvasEventHandlersProps) => {
  
  // Helper function to create shapes
  const createShape = (type: ShapeType, startX: number, startY: number, endX: number, endY: number) => {
    const width = Math.abs(endX - startX);
    const height = Math.abs(endY - startY);
    const left = Math.min(startX, endX);
    const top = Math.min(startY, endY);

    const effectiveColor = brushColor === "transparent" ? themeDefault : brushColor;
    console.log('Creating shape:', type, 'with effective color:', effectiveColor);

    switch (type) {
      case "rectangle":
        return new Rect({
          left,
          top,
          width: Math.max(width, 1),
          height: Math.max(height, 1),
          fill: "transparent",
          stroke: effectiveColor,
          strokeWidth: strokeWidth || 2,
          selectable: true,
          hasControls: true,
          hasBorders: true,
          cornerStyle: 'circle',
          borderOpacityWhenMoving: 0.5,
          hoverCursor: 'move',
          perPixelTargetFind: true,
          strokeUniform: true,
          // Explicitly enable all controls
          lockScalingFlip: false,
          lockRotation: false,
          lockScalingX: false,
          lockScalingY: false,
          lockMovementX: false,
          lockMovementY: false,
          borderColor: '#3B82F6',
          cornerColor: '#3B82F6',
          cornerStrokeColor: '#3B82F6',
          transparentCorners: false,
          cornerSize: 8,
          rotatingPointOffset: 40
        });
      case "circle":
        const radius = Math.max(Math.min(width, height) / 2, 1);
        return new Circle({
          left: left + width / 2,
          top: top + height / 2,
          radius,
          fill: "transparent",
          stroke: effectiveColor,
          strokeWidth: brushSize,
          originX: 'center',
          originY: 'center',
          selectable: true,
          hasControls: true,
          hasBorders: true,
          cornerStyle: 'circle',
          borderOpacityWhenMoving: 0.5,
          hoverCursor: 'move',
          perPixelTargetFind: true,
          strokeUniform: true,
          // Explicitly enable all controls
          lockScalingFlip: false,
          lockRotation: false,
          lockScalingX: false,
          lockScalingY: false,
          lockMovementX: false,
          lockMovementY: false,
          borderColor: '#3B82F6',
          cornerColor: '#3B82F6',
          cornerStrokeColor: '#3B82F6',
          transparentCorners: false,
          cornerSize: 8,
          rotatingPointOffset: 40
        });
      case "triangle":
        return new Triangle({
          left: left + width / 2,
          top: top + height / 2,
          width: Math.max(width, 1),
          height: Math.max(height, 1),
          fill: "transparent",
          stroke: effectiveColor,
          strokeWidth: strokeWidth || 2,
          originX: 'center',
          originY: 'center',
          selectable: true,
          hasControls: true,
          hasBorders: true,
          cornerStyle: 'circle',
          borderOpacityWhenMoving: 0.5,
          hoverCursor: 'move',
          perPixelTargetFind: true,
          strokeUniform: true,
          // Explicitly enable all controls
          lockScalingFlip: false,
          lockRotation: false,
          lockScalingX: false,
          lockScalingY: false,
          lockMovementX: false,
          lockMovementY: false,
          borderColor: '#3B82F6',
          cornerColor: '#3B82F6',
          cornerStrokeColor: '#3B82F6',
          transparentCorners: false,
          cornerSize: 8,
          rotatingPointOffset: 40
        });
      case "line":
        return new Line([startX, startY, endX, endY], {
          stroke: effectiveColor,
          strokeWidth: strokeWidth || 2,
          selectable: true,
          hasControls: true,
          hasBorders: true,
          cornerStyle: 'circle',
          borderOpacityWhenMoving: 0.5,
          hoverCursor: 'move',
          perPixelTargetFind: true,
          strokeUniform: true,
          // Explicitly enable all controls
          lockScalingFlip: false,
          lockRotation: false,
          lockScalingX: false,
          lockScalingY: false,
          lockMovementX: false,
          lockMovementY: false,
          borderColor: '#3B82F6',
          cornerColor: '#3B82F6',
          cornerStrokeColor: '#3B82F6',
          transparentCorners: false,
          cornerSize: 8,
          rotatingPointOffset: 40
        });
      default:
        console.error('Unknown shape type:', type);
        return null;
    }
  };

  useEffect(() => {
    if (!fabricCanvas) return;

    // Enhanced panning and interaction
    const handleMouseDown = (opt: any) => {
      const evt = opt.e;
      const pointer = fabricCanvas.getPointer(evt);
      
      // Store click position for context menu paste
      onStartPointerChange({ x: pointer.x, y: pointer.y });
      
      // Auto-switch to select mode when clicking an object (except for pen tool)
      const target = fabricCanvas.findTarget(evt);
      if (target && activeTool !== "select" && activeTool !== "pen") {
        onActivateSelect();
        fabricCanvas.setActiveObject(target);
        fabricCanvas.renderAll();
        onSelectedObjectChange(target);
        return;
      }
      
      
      // Only allow panning if no object is selected and not using Alt key
      if (!target && (activeTool === "pan" || evt.button === 1)) {
        fabricCanvas.isDragging = true;
        fabricCanvas.selection = false;
        fabricCanvas.lastPosX = evt.clientX;
        fabricCanvas.lastPosY = evt.clientY;
        fabricCanvas.setCursor("grabbing");
      } else if (activeTool === "shape" && activeShape) {
        onIsDrawingChange(true);
        onStartPointerChange({ x: pointer.x, y: pointer.y });
      } else if (activeTool === "text") {
        onIsDrawingChange(true);
        onStartPointerChange({ x: pointer.x, y: pointer.y });
      }
    };

    const handleMouseMove = (opt: any) => {
      const evt = opt.e;
      const pointer = fabricCanvas.getPointer(evt);
      
      
      if (fabricCanvas.isDragging && activeTool === "pan") {
        const vpt = fabricCanvas.viewportTransform!;
        vpt[4] += evt.clientX - fabricCanvas.lastPosX;
        vpt[5] += evt.clientY - fabricCanvas.lastPosY;
        fabricCanvas.requestRenderAll();
        fabricCanvas.lastPosX = evt.clientX;
        fabricCanvas.lastPosY = evt.clientY;
      } else if (isDrawing && activeTool === "shape" && activeShape && startPointer) {
        const pointer = fabricCanvas.getPointer(evt);
        
        if (currentShape) {
          fabricCanvas.remove(currentShape);
        }

        const newShape = createShape(activeShape, startPointer.x, startPointer.y, pointer.x, pointer.y);
        if (newShape) {
          // Mark as preview shape to prevent object:added events
          newShape.set({ 
            opacity: 0.7,
            selectable: false,
            evented: false
          });
          fabricCanvas.add(newShape);
          onCurrentShapeChange(newShape);
          fabricCanvas.renderAll();
        }
      } else if (isDrawing && activeTool === "text" && startPointer) {
        const pointer = fabricCanvas.getPointer(evt);
        const width = Math.abs(pointer.x - startPointer.x);
        const height = Math.abs(pointer.y - startPointer.y);
        
        // Show preview rectangle for text box
        if (currentShape) {
          fabricCanvas.remove(currentShape);
        }
        
        if (width > 10 && height > 10) {
          const rect = new Rect({
            left: Math.min(startPointer.x, pointer.x),
            top: Math.min(startPointer.y, pointer.y),
            width,
            height,
            fill: "transparent",
            stroke: "rgba(0,0,0,0.3)",
            strokeDashArray: [5, 5],
            strokeWidth: 1,
            selectable: false,
          });
          fabricCanvas.add(rect);
          onCurrentShapeChange(rect);
          fabricCanvas.renderAll();
        }
      }
    };

    const handleMouseUp = (opt: any) => {
      
      if (fabricCanvas.isDragging) {
        fabricCanvas.setViewportTransform(fabricCanvas.viewportTransform!);
        fabricCanvas.isDragging = false;
        fabricCanvas.selection = true;
        fabricCanvas.setCursor("default");
      } else if (isDrawing && activeTool === "shape") {
        if (currentShape) {
          // Make the shape final by enabling selection and events
          currentShape.set({ 
            opacity: 1,
            selectable: true,
            evented: true
          });
          fabricCanvas.renderAll();
          fabricCanvas.setActiveObject(currentShape);
          onCurrentShapeChange(null);
          onActivateSelect(); // Auto-switch to select after shape creation
          onDirtyChange(true);
        }
        onIsDrawingChange(false);
        onStartPointerChange(null);
      } else if (isDrawing && activeTool === "text" && startPointer) {
        if (currentShape) {
          fabricCanvas.remove(currentShape);
        }
        
        const pointer = fabricCanvas.getPointer(opt.e);
        const width = Math.abs(pointer.x - startPointer.x);
        const height = Math.abs(pointer.y - startPointer.y);
        
        // Create text box if dragged area is significant
        if (width > 10 && height > 10) {
          const effectiveTextColor = textColor === "transparent" ? themeDefault : textColor;
          const text = new IText("Add text", {
            left: Math.min(startPointer.x, pointer.x),
            top: Math.min(startPointer.y, pointer.y),
            width: width,
            fontFamily,
            fontSize,
            fill: effectiveTextColor,
            fontWeight: isBold ? "bold" : "normal",
            fontStyle: isItalic ? "italic" : "normal",
            underline: isUnderlined,
            opacity: 1,
            selectable: true,
            editable: true,
            hasControls: true,
            hasBorders: true,
            hoverCursor: 'move',
            perPixelTargetFind: true,
            strokeUniform: true,
            // Explicitly enable all controls
            lockScalingFlip: false,
            lockRotation: false,
            lockScalingX: false,
            lockScalingY: false,
            lockMovementX: false,
            lockMovementY: false,
            borderColor: '#3B82F6',
            cornerColor: '#3B82F6',
            cornerStrokeColor: '#3B82F6',
            transparentCorners: false,
            cornerSize: 8,
            rotatingPointOffset: 40
          });
          
          fabricCanvas.add(text);
          fabricCanvas.setActiveObject(text);
          fabricCanvas.renderAll();
          // Enter editing after a brief delay to ensure object is properly added
          setTimeout(() => {
            text.enterEditing();
            text.selectAll();
          }, 50);
          onActivateSelect(); // Auto-switch to select after text creation
        } else {
          // Fallback to click placement
          const effectiveTextColor = textColor === "transparent" ? themeDefault : textColor;
          const text = new IText("Type here", {
            left: startPointer.x,
            top: startPointer.y,
            fontFamily,
            fontSize,
            fill: effectiveTextColor,
            fontWeight: isBold ? "bold" : "normal",
            fontStyle: isItalic ? "italic" : "normal",
            underline: isUnderlined,
            opacity: 1,
            selectable: true,
            editable: true,
            hasControls: true,
            hasBorders: true,
            hoverCursor: 'move',
            perPixelTargetFind: true,
            strokeUniform: true,
            // Explicitly enable all controls
            lockScalingFlip: false,
            lockRotation: false,
            lockScalingX: false,
            lockScalingY: false,
            lockMovementX: false,
            lockMovementY: false,
            borderColor: '#3B82F6',
            cornerColor: '#3B82F6',
            cornerStrokeColor: '#3B82F6',
            transparentCorners: false,
            cornerSize: 8,
            rotatingPointOffset: 40
          });
          
          fabricCanvas.add(text);
          fabricCanvas.setActiveObject(text);
          fabricCanvas.renderAll();
          // Enter editing after a brief delay to ensure object is properly added
          setTimeout(() => {
            text.enterEditing();
            text.selectAll();
          }, 50);
          onActivateSelect(); // Auto-switch to select after text creation
        }
        
        onCurrentShapeChange(null);
        onDirtyChange(true);
        onIsDrawingChange(false);
        onStartPointerChange(null);
      }
    };

    // Keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if text is being edited inside Fabric canvas
      const isCanvasTextEditing = (fabricCanvas?.getActiveObject() as any)?.isEditing === true;
      
      // Let the WhiteboardCanvas component handle delete operations instead of duplicating logic
      // This prevents conflicts between the two delete handlers
    };

    const handleDoubleClick = (opt: any) => {
      const target = fabricCanvas?.findTarget(opt.e);
      if (target && (target.type === 'i-text' || target.type === 'text')) {
        fabricCanvas.setActiveObject(target);
        setTimeout(() => {
          (target as any).enterEditing();
          (target as any).selectAll();
        }, 10);
      }
    };

    fabricCanvas.on("mouse:down", handleMouseDown);
    fabricCanvas.on("mouse:move", handleMouseMove);
    fabricCanvas.on("mouse:up", handleMouseUp);
    fabricCanvas.on("mouse:dblclick", handleDoubleClick);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      fabricCanvas.off("mouse:down", handleMouseDown);
      fabricCanvas.off("mouse:move", handleMouseMove);
      fabricCanvas.off("mouse:up", handleMouseUp);
      fabricCanvas.off("mouse:dblclick", handleDoubleClick);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    fabricCanvas,
    activeTool,
    activeShape,
    isDrawing,
    startPointer,
    currentShape,
    selectedObject,
    brushColor,
    brushSize,
    strokeWidth,
    fontFamily,
    fontSize,
    textColor,
    isBold,
    isItalic,
    isUnderlined,
    themeDefault
  ]);
};