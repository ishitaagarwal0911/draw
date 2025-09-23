import { useEffect } from 'react';
import { Canvas as FabricCanvas } from 'fabric';

interface UseAdvancedNavigationProps {
  fabricCanvas: FabricCanvas | null;
  onZoomChange: (zoom: number) => void;
}

export const useAdvancedNavigation = ({
  fabricCanvas,
  onZoomChange,
}: UseAdvancedNavigationProps) => {
  
  useEffect(() => {
    if (!fabricCanvas) return;

    const handleWheel = (opt: any) => {
      const delta = opt.e.deltaY;
      const deltaX = opt.e.deltaX;
      let zoom = fabricCanvas.getZoom();
      
      // Zoom with Ctrl/Cmd + wheel
      if (opt.e.ctrlKey || opt.e.metaKey) {
        zoom *= 0.999 ** (delta * 0.5); // Faster zoom
        zoom = Math.max(0.1, Math.min(5, zoom));
        
        const pointer = fabricCanvas.getPointer(opt.e);
        fabricCanvas.zoomToPoint(pointer, zoom);
        onZoomChange(zoom);
        opt.e.preventDefault();
        opt.e.stopPropagation();
      } else {
        // Pan with regular wheel (both vertical and horizontal)
        const vpt = fabricCanvas.viewportTransform!;
        vpt[4] -= deltaX * 0.5; // Horizontal panning
        vpt[5] -= delta * 0.5;  // Vertical panning
        fabricCanvas.setViewportTransform(vpt);
        opt.e.preventDefault();
        opt.e.stopPropagation();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Space + mouse for panning
      if (e.code === 'Space' && !e.repeat) {
        fabricCanvas.setCursor('grab');
        e.preventDefault();
      }
      
      // Zoom shortcuts
      if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        // Reset zoom
        fabricCanvas.setZoom(1);
        fabricCanvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
        onZoomChange(1);
        e.preventDefault();
      } else if ((e.ctrlKey || e.metaKey) && e.key === '=') {
        // Zoom in
        let zoom = fabricCanvas.getZoom();
        zoom = Math.min(zoom * 1.1, 5);
        fabricCanvas.setZoom(zoom);
        onZoomChange(zoom);
        e.preventDefault();
      } else if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        // Zoom out
        let zoom = fabricCanvas.getZoom();
        zoom = Math.max(zoom * 0.9, 0.1);
        fabricCanvas.setZoom(zoom);
        onZoomChange(zoom);
        e.preventDefault();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        fabricCanvas.setCursor('default');
      }
    };

    fabricCanvas.on('mouse:wheel', handleWheel);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      fabricCanvas.off('mouse:wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [fabricCanvas, onZoomChange]);
};