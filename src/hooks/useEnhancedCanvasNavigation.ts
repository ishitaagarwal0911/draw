import { useEffect, useRef, useCallback } from 'react';
import { Canvas as FabricCanvas, Point } from 'fabric';

interface UseEnhancedCanvasNavigationProps {
  fabricCanvas: FabricCanvas | null;
  onZoomChange: (zoom: number) => void;
  isTextEditing?: boolean;
  backgroundElement?: HTMLElement | null;
  onHistoryCheckpoint?: () => void;
}

export const useEnhancedCanvasNavigation = ({ 
  fabricCanvas, 
  onZoomChange,
  isTextEditing = false,
  backgroundElement,
  onHistoryCheckpoint
}: UseEnhancedCanvasNavigationProps) => {
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });
  const objectMoveTimer = useRef<NodeJS.Timeout | null>(null);

  const handleArrowKeyMove = useCallback((direction: 'left' | 'right' | 'up' | 'down', distance: number = 1) => {
    const activeObject = fabricCanvas?.getActiveObject();
    if (!activeObject || !fabricCanvas) return false;
    
    // Don't move objects that are being edited
    if ((activeObject as any).isEditing) return false;
    
    const currentLeft = activeObject.left || 0;
    const currentTop = activeObject.top || 0;
    
    let newLeft = currentLeft;
    let newTop = currentTop;
    
    switch (direction) {
      case 'left':
        newLeft = currentLeft - distance;
        break;
      case 'right':
        newLeft = currentLeft + distance;
        break;
      case 'up':
        newTop = currentTop - distance;
        break;
      case 'down':
        newTop = currentTop + distance;
        break;
    }
    
    activeObject.set({ left: newLeft, top: newTop });
    activeObject.setCoords();
    fabricCanvas.renderAll();
    
    return true; // Object was moved
  }, [fabricCanvas]);

  useEffect(() => {
    if (!fabricCanvas) return;

    const isEditingActive = () => {
      const ao: any = fabricCanvas.getActiveObject?.();
      return !!(ao && ao.isEditing);
    };

    const handleWheel = (e: WheelEvent) => {
      // Allow native behavior while editing text
      if (isTextEditing || isEditingActive()) return;
      e.preventDefault();
      
      // Normalize wheel delta for different devices
      let deltaX = e.deltaX;
      let deltaY = e.deltaY;
      
      if (e.deltaMode === 1) { // Line mode
        deltaX *= 16;
        deltaY *= 16;
      } else if (e.deltaMode === 2) { // Page mode
        deltaX *= 100;
        deltaY *= 100;
      }
      
      if (e.ctrlKey || e.metaKey) {
        // Smooth zooming with pinch-to-zoom support
        const pointer = fabricCanvas.getPointer(e);
        let newZoom = fabricCanvas.getZoom();
        const zoomDelta = deltaY > 0 ? 0.9 : 1.1;
        newZoom *= zoomDelta;
        if (newZoom > 20) newZoom = 20;
        if (newZoom < 0.01) newZoom = 0.01;
        const point = new Point(pointer.x, pointer.y);
        fabricCanvas.zoomToPoint(point, newZoom);
        onZoomChange(newZoom);
      } else {
        // Improved trackpad panning
        const vpt = fabricCanvas.viewportTransform!;
        vpt[4] -= deltaX;
        vpt[5] -= deltaY;
        fabricCanvas.requestRenderAll();
        
        // Update background position if provided
        if (backgroundElement) {
          const bgX = -vpt[4] / 20;
          const bgY = -vpt[5] / 20;
          backgroundElement.style.backgroundPosition = `${bgX}px ${bgY}px`;
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!fabricCanvas) return;
      
      // Check if text is being edited
      const isEditingActive = (fabricCanvas.getActiveObject() as any)?.isEditing === true;
      if (isEditingActive) return;

      const activeObject = fabricCanvas.getActiveObject();
      let moveDistance = 1;
      if (e.shiftKey) moveDistance = 10;
      
      // Handle object movement with arrow keys if an object is selected
      if (activeObject && (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
        e.preventDefault();
        
        const moved = handleArrowKeyMove(
          e.key === 'ArrowLeft' ? 'left' :
          e.key === 'ArrowRight' ? 'right' :
          e.key === 'ArrowUp' ? 'up' : 'down',
          moveDistance
        );
        
        if (moved) {
          // Clear existing timer
          if (objectMoveTimer.current) {
            clearTimeout(objectMoveTimer.current);
          }
          // Set a debounced history checkpoint
          objectMoveTimer.current = setTimeout(() => {
            onHistoryCheckpoint?.();
          }, 200);
        }
        return;
      }

      // Space bar for panning
      if (e.code === 'Space' && !isPanning.current) {
        e.preventDefault();
        isPanning.current = true;
        fabricCanvas.setCursor('grab');
      }
      
      // Canvas panning with arrow keys (when no object selected)
      if (!activeObject) {
        let panDistance = 50;
        if (e.shiftKey) panDistance = 200;

        const vpt = fabricCanvas.viewportTransform!;
        
        if (e.key === 'ArrowLeft') {
          vpt[4] += panDistance;
          fabricCanvas.requestRenderAll();
          e.preventDefault();
        } else if (e.key === 'ArrowRight') {
          vpt[4] -= panDistance;
          fabricCanvas.requestRenderAll();
          e.preventDefault();
        } else if (e.key === 'ArrowUp') {
          vpt[5] += panDistance;
          fabricCanvas.requestRenderAll();
          e.preventDefault();
        } else if (e.key === 'ArrowDown') {
          vpt[5] -= panDistance;
          fabricCanvas.requestRenderAll();
          e.preventDefault();
        }
      }
      
      // Zoom controls
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case '0':
            e.preventDefault();
            fabricCanvas.setZoom(1);
            fabricCanvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
            onZoomChange(1);
            break;
          case '=':
          case '+':
            e.preventDefault();
            const zoomIn = Math.min(fabricCanvas.getZoom() * 1.2, 20);
            fabricCanvas.setZoom(zoomIn);
            onZoomChange(zoomIn);
            break;
          case '-':
            e.preventDefault();
            const zoomOut = Math.max(fabricCanvas.getZoom() / 1.2, 0.01);
            fabricCanvas.setZoom(zoomOut);
            onZoomChange(zoomOut);
            break;
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      // Clear object move timer on key up
      if (objectMoveTimer.current && (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
        clearTimeout(objectMoveTimer.current);
        objectMoveTimer.current = null;
      }

      if (e.code === 'Space' && isPanning.current) {
        isPanning.current = false;
        fabricCanvas.setCursor('default');
      }
    };

    const handleMouseDown = (opt: any) => {
      const evt = opt.e;
      if (isPanning.current || evt.button === 1) {
        fabricCanvas.isDragging = true;
        fabricCanvas.selection = false;
        panStart.current = { x: evt.clientX, y: evt.clientY };
        fabricCanvas.setCursor('grabbing');
      }
    };

    const handleMouseMove = (opt: any) => {
      const evt = opt.e;
      if (fabricCanvas.isDragging && isPanning.current) {
        const vpt = fabricCanvas.viewportTransform!;
        const deltaX = evt.clientX - panStart.current.x;
        const deltaY = evt.clientY - panStart.current.y;
        
        vpt[4] += deltaX;
        vpt[5] += deltaY;
        fabricCanvas.requestRenderAll();
        
        // Update background position for smooth effect
        if (backgroundElement) {
          backgroundElement.style.backgroundPosition = `${vpt[4]}px ${vpt[5]}px`;
        }
        
        panStart.current = { x: evt.clientX, y: evt.clientY };
      }
    };

    const handleMouseUp = () => {
      if (fabricCanvas.isDragging) {
        fabricCanvas.setViewportTransform(fabricCanvas.viewportTransform!);
        fabricCanvas.isDragging = false;
        fabricCanvas.selection = true;
        fabricCanvas.setCursor(isPanning.current ? 'grab' : 'default');
      }
    };

    // Attach event listeners
    const canvas = fabricCanvas.getElement();
    if (!canvas) return; // Safety check to prevent runtime error
    
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    // Add wheel listener to window for better trackpad support
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    fabricCanvas.on('mouse:down', handleMouseDown);
    fabricCanvas.on('mouse:move', handleMouseMove);
    fabricCanvas.on('mouse:up', handleMouseUp);

    return () => {
      // Clear timer on cleanup
      if (objectMoveTimer.current) {
        clearTimeout(objectMoveTimer.current);
      }
      
      canvas.removeEventListener('wheel', handleWheel);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      
      fabricCanvas.off('mouse:down', handleMouseDown);
      fabricCanvas.off('mouse:move', handleMouseMove);
      fabricCanvas.off('mouse:up', handleMouseUp);
    };
  }, [fabricCanvas, onZoomChange, isTextEditing, backgroundElement, handleArrowKeyMove, onHistoryCheckpoint]);
};