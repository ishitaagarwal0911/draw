import { Canvas as FabricCanvas } from 'fabric';

export const useFitToContent = (fabricCanvas: FabricCanvas | null) => {
  const fitToContent = () => {
    if (!fabricCanvas) return;

    const objects = fabricCanvas.getObjects();
    if (objects.length === 0) {
      // Reset to center if no objects
      fabricCanvas.setZoom(1);
      fabricCanvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
      return;
    }

    // Calculate bounding box of all objects
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    objects.forEach(obj => {
      const bounds = obj.getBoundingRect();
      minX = Math.min(minX, bounds.left);
      minY = Math.min(minY, bounds.top);
      maxX = Math.max(maxX, bounds.left + bounds.width);
      maxY = Math.max(maxY, bounds.top + bounds.height);
    });

    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;
    const contentCenterX = minX + contentWidth / 2;
    const contentCenterY = minY + contentHeight / 2;

    // Get canvas dimensions
    const canvasWidth = fabricCanvas.getWidth();
    const canvasHeight = fabricCanvas.getHeight();

    // Calculate zoom to fit content with padding
    const padding = 50;
    const zoomX = (canvasWidth - padding * 2) / contentWidth;
    const zoomY = (canvasHeight - padding * 2) / contentHeight;
    const zoom = Math.min(zoomX, zoomY, 2); // Max zoom of 2x

    // Calculate pan to center content
    const panX = canvasWidth / 2 - contentCenterX * zoom;
    const panY = canvasHeight / 2 - contentCenterY * zoom;

    // Apply zoom and pan
    fabricCanvas.setZoom(zoom);
    fabricCanvas.setViewportTransform([zoom, 0, 0, zoom, panX, panY]);
  };

  return fitToContent;
};