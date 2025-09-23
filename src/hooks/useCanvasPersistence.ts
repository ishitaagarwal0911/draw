import { useCallback } from "react";
import { Canvas as FabricCanvas, FabricImage } from "fabric";
import { blobURLToDataURL, isBlobURL } from "@/utils/imageUtils";

export const useCanvasPersistence = () => {
  const saveCanvas = useCallback(async (canvas: FabricCanvas) => {
    try {
      // Convert any blob URLs to data URLs before saving
      const objects = canvas.getObjects();
      const imageConversions: Promise<void>[] = [];
      
      objects.forEach((obj) => {
        if (obj instanceof FabricImage && obj.getSrc && isBlobURL(obj.getSrc())) {
          imageConversions.push(
            blobURLToDataURL(obj.getSrc()).then((dataURL) => {
              obj.setSrc(dataURL);
            }).catch((error) => {
              console.warn('Failed to convert blob URL to data URL:', error);
            })
          );
        }
      });
      
      // Wait for all image conversions to complete
      await Promise.all(imageConversions);
      
      const canvasData = canvas.toJSON();
      const viewportTransform = canvas.viewportTransform;
      
      const state = {
        canvasData,
        viewportTransform,
        timestamp: Date.now(),
      };

      // Use Chrome storage API if available, otherwise localStorage
      if (typeof (globalThis as any).chrome !== "undefined" && (globalThis as any).chrome.storage) {
        try {
          await (globalThis as any).chrome.storage.local.set({ whiteboardState: state });
        } catch (error) {
          console.warn("Chrome storage failed, falling back to localStorage:", error);
          // Fallback to localStorage if Chrome storage fails
          localStorage.setItem("whiteboardState", JSON.stringify(state));
        }
      } else {
        localStorage.setItem("whiteboardState", JSON.stringify(state));
      }
    } catch (error) {
      console.error("Failed to save canvas:", error);
    }
  }, []);

  const loadCanvas = useCallback(async (canvas: FabricCanvas) => {
    try {
      let state = null;

      // Use Chrome storage API if available, otherwise localStorage
      if (typeof (globalThis as any).chrome !== "undefined" && (globalThis as any).chrome.storage) {
        const result = await (globalThis as any).chrome.storage.local.get("whiteboardState");
        state = result.whiteboardState;
      } else {
        const saved = localStorage.getItem("whiteboardState");
        state = saved ? JSON.parse(saved) : null;
      }

      if (state?.canvasData) {
        await canvas.loadFromJSON(state.canvasData);
        
        if (state.viewportTransform) {
          canvas.setViewportTransform(state.viewportTransform);
        }
        
        canvas.renderAll();
      }
    } catch (error) {
      console.error("Failed to load canvas:", error);
    }
  }, []);

  return { saveCanvas, loadCanvas };
};