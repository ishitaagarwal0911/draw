import { useEffect, useRef } from "react";
import { Canvas as FabricCanvas, PencilBrush } from "fabric";

interface UseCanvasInitializationProps {
  containerRef: React.RefObject<HTMLDivElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  brushColor: string;
  brushSize: number;
  onCanvasReady: (canvas: FabricCanvas) => void;
  onDirtyChange: (isDirty: boolean) => void;
  onSelectionChange: (object: any) => void;
  loadCanvas: (canvas: FabricCanvas) => void;
}

export const useCanvasInitialization = ({
  containerRef,
  canvasRef,
  brushColor,
  brushSize,
  onCanvasReady,
  onDirtyChange,
  onSelectionChange,
  loadCanvas
}: UseCanvasInitializationProps) => {
  useEffect(() => {
    console.log('Canvas initialization starting...');
    
    if (!canvasRef.current) {
      console.error('Canvas ref is not available');
      return;
    }
    
    if (!containerRef.current) {
      console.error('Container ref is not available');
      return;
    }

    // Ensure container has dimensions
    const containerWidth = containerRef.current.clientWidth || window.innerWidth;
    const containerHeight = containerRef.current.clientHeight || window.innerHeight;
    
    console.log('Container dimensions:', { containerWidth, containerHeight });
    
    if (containerWidth === 0 || containerHeight === 0) {
      console.warn('Container has zero dimensions, retrying in 100ms');
      const retryTimeout = setTimeout(() => {
        // Trigger re-initialization
        const event = new Event('resize');
        window.dispatchEvent(event);
      }, 100);
      return () => clearTimeout(retryTimeout);
    }

    try {
      console.log('Creating Fabric canvas...');
      const canvas = new FabricCanvas(canvasRef.current, {
        width: containerWidth,
        height: containerHeight,
        backgroundColor: "transparent",
        selection: true,
        preserveObjectStacking: true,
        enableRetinaScaling: true,
        selectionBorderColor: 'rgba(100, 150, 255, 0.8)',
        selectionLineWidth: 2,
        selectionColor: 'rgba(100, 150, 255, 0.1)',
      });

      console.log('Fabric canvas created successfully');

      // Set modern blue selection styles
      import('fabric').then(({ Object: FabricObject }) => {
        FabricObject.prototype.set({
          borderColor: '#3B82F6',
          cornerColor: '#3B82F6',
          cornerStyle: 'circle',
          cornerSize: 8,
          transparentCorners: false,
          borderDashArray: undefined,
          padding: 0,
          borderScaleFactor: 1,
          hoverCursor: 'move',
          perPixelTargetFind: true,
          strokeUniform: true,
          hasControls: true,
          hasBorders: true,
          cornerStrokeColor: '#3B82F6',
          rotatingPointOffset: 40,
          // Ensure all objects show resize and rotation controls
          lockScalingFlip: false,
          lockRotation: false,
          lockScalingX: false,
          lockScalingY: false,
          lockMovementX: false,
          lockMovementY: false,
        });
        
        canvas.selectionColor = 'transparent';
        canvas.selectionBorderColor = '#3B82F6';
        canvas.selectionLineWidth = 2;
        
        // Force canvas to show controls
        canvas.uniformScaling = false;
      });

      // Handle freehand paths to apply consistent selection styles and controls visibility
      const handlePathCreated = (e: any) => {
        const path = e.path;
        if (path) {
          path.set({
            selectable: true,
            hasControls: true,
            hasBorders: true,
            borderColor: '#3B82F6',
            cornerColor: '#3B82F6',
            cornerStyle: 'circle',
            cornerSize: 8,
            transparentCorners: false,
            hoverCursor: 'move',
            perPixelTargetFind: true,
            strokeUniform: true,
            lockScalingFlip: false,
            lockRotation: false,
            lockScalingX: false,
            lockScalingY: false,
            lockMovementX: false,
            lockMovementY: false,
            cornerStrokeColor: '#3B82F6',
            rotatingPointOffset: 40
          });
          canvas.renderAll();
          onDirtyChange(true);
        }
      };

      canvas.on('path:created', handlePathCreated);

      // Initialize drawing brush
      canvas.freeDrawingBrush = new PencilBrush(canvas);
      canvas.freeDrawingBrush.color = brushColor;
      canvas.freeDrawingBrush.width = brushSize;
      console.log('Drawing brush initialized');

    // Remove built-in wheel handling to use our enhanced version
    // This is handled by useEnhancedCanvasNavigation now

    // Track changes and selection
    const handleObjectModified = () => {
      onDirtyChange(true);
    };

    const handleSelectionCreated = (e: any) => {
      onSelectionChange(e.selected[0] || null);
    };

    const handleSelectionUpdated = (e: any) => {
      onSelectionChange(e.selected[0] || null);
    };

    const handleSelectionCleared = () => {
      onSelectionChange(null);
    };

      // Add saveState event handlers for reliable redo
      canvas.on("object:modified", handleObjectModified);
      canvas.on("object:added", handleObjectModified);
      canvas.on("object:removed", handleObjectModified);
      canvas.on("path:created", handlePathCreated);
    canvas.on("selection:created", handleSelectionCreated);
    canvas.on("selection:updated", handleSelectionUpdated);
    canvas.on("selection:cleared", handleSelectionCleared);

      // Load saved canvas state
      console.log('Loading canvas state...');
      loadCanvas(canvas);

      // Notify parent that canvas is ready
      console.log('Canvas ready, notifying parent...');
      onCanvasReady(canvas);

      return () => {
        console.log('Disposing canvas...');
        canvas.dispose();
      };
    } catch (error) {
      console.error('Error during canvas initialization:', error);
      // Try again after a brief delay
      const retryTimeout = setTimeout(() => {
        console.log('Retrying canvas initialization...');
        const event = new Event('resize');
        window.dispatchEvent(event);
      }, 500);
      return () => clearTimeout(retryTimeout);
    }
  }, []); // Empty dependency array - this effect should only run once
};