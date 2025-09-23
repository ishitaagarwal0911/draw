import { useState, useCallback, useRef } from 'react';
import { Canvas as FabricCanvas } from 'fabric';

interface CanvasState {
  json: string;
  viewportTransform: number[];
}

interface HistoryState {
  history: CanvasState[];
  currentIndex: number;
}

export const useCanvasHistory = (fabricCanvas: FabricCanvas | null) => {
  const [historyState, setHistoryState] = useState<HistoryState>({ history: [], currentIndex: -1 });
  const isUndoRedo = useRef(false);
  const MAX_HISTORY = 10;

  const saveState = useCallback(() => {
    if (!fabricCanvas || isUndoRedo.current) return;

    try {
      const json = JSON.stringify(fabricCanvas.toJSON());
      const viewportTransform = [...fabricCanvas.viewportTransform!];
      const newState: CanvasState = { json, viewportTransform };

      setHistoryState(prev => {
        // Drop any redo states and append the new state
        const base = prev.history.slice(0, prev.currentIndex + 1);
        const pushed = [...base, newState];
        const trimmed = pushed.slice(-MAX_HISTORY);
        return {
          history: trimmed,
          currentIndex: trimmed.length - 1
        };
      });
    } catch (error) {
      console.error('Failed to save canvas state:', error);
    }
  }, [fabricCanvas]);

  const undo = useCallback(async () => {
    if (!fabricCanvas || historyState.currentIndex <= 0) return false;

    try {
      isUndoRedo.current = true;
      const prevState = historyState.history[historyState.currentIndex - 1];
      
      await fabricCanvas.loadFromJSON(prevState.json);
      fabricCanvas.setViewportTransform(prevState.viewportTransform as [number, number, number, number, number, number]);
      fabricCanvas.renderAll();
      
      setHistoryState(prev => ({ ...prev, currentIndex: prev.currentIndex - 1 }));
      return true;
    } catch (error) {
      console.error('Failed to undo:', error);
      return false;
    } finally {
      // Defer allowing saves until after render completes
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          isUndoRedo.current = false;
        });
      });
    }
  }, [fabricCanvas, historyState]);

  const redo = useCallback(async () => {
    if (!fabricCanvas || historyState.currentIndex >= historyState.history.length - 1) return false;

    try {
      isUndoRedo.current = true;
      const nextState = historyState.history[historyState.currentIndex + 1];
      
      await fabricCanvas.loadFromJSON(nextState.json);
      fabricCanvas.setViewportTransform(nextState.viewportTransform as [number, number, number, number, number, number]);
      fabricCanvas.renderAll();
      
      setHistoryState(prev => ({ ...prev, currentIndex: prev.currentIndex + 1 }));
      return true;
    } catch (error) {
      console.error('Failed to redo:', error);
      return false;
    } finally {
      // Defer allowing saves until after render completes
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          isUndoRedo.current = false;
        });
      });
    }
  }, [fabricCanvas, historyState]);

  const canUndo = historyState.currentIndex > 0;
  const canRedo = historyState.currentIndex < historyState.history.length - 1;

  return {
    saveState,
    undo: fabricCanvas ? undo : async () => false,
    redo: fabricCanvas ? redo : async () => false,
    canUndo: fabricCanvas ? canUndo : false,
    canRedo: fabricCanvas ? canRedo : false
  };
};