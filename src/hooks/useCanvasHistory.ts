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
  const historyStateRef = useRef<HistoryState>({ history: [], currentIndex: -1 });
  const isUndoRedo = useRef(false);
  const suspendUntil = useRef<number>(0);
  const MAX_HISTORY = 50;

  // Keep ref in sync with state
  historyStateRef.current = historyState;

  const saveState = useCallback(() => {
    if (!fabricCanvas) return;
    const now = Date.now();
    if (isUndoRedo.current || now < suspendUntil.current) return;

    try {
      const json = JSON.stringify(fabricCanvas.toJSON());
      const viewportTransform = [...fabricCanvas.viewportTransform!];
      const newState: CanvasState = { json, viewportTransform };

      setHistoryState(prev => {
        // Drop any redo states and append the new state
        const base = prev.history.slice(0, prev.currentIndex + 1);
        const pushed = [...base, newState];
        const trimmed = pushed.slice(-MAX_HISTORY);
        const next = {
          history: trimmed,
          currentIndex: trimmed.length - 1
        };
        // Keep ref in sync immediately for consumers reading synchronously
        historyStateRef.current = next;
        return next;
      });
    } catch (error) {
      console.error('Failed to save canvas state:', error);
    }
  }, [fabricCanvas]);

  const undo = useCallback(async () => {
    if (!fabricCanvas) return false;
    if (isUndoRedo.current) return false;

    const currentState = historyStateRef.current;
    if (currentState.currentIndex <= 0) return false;

    try {
      console.log('Undo triggered, currentIndex:', currentState.currentIndex);
      isUndoRedo.current = true;
      // Suspend any state saving briefly to avoid re-entrancy from Fabric events
      suspendUntil.current = Date.now() + 300;

      const prevState = currentState.history[currentState.currentIndex - 1];
      await fabricCanvas.loadFromJSON(prevState.json);
      fabricCanvas.setViewportTransform(prevState.viewportTransform as [number, number, number, number, number, number]);
      fabricCanvas.renderAll();

      setHistoryState(prev => {
        const next = { ...prev, currentIndex: prev.currentIndex - 1 };
        historyStateRef.current = next;
        console.log('Undo: updating currentIndex from', prev.currentIndex, 'to', next.currentIndex);
        return next;
      });
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
  }, [fabricCanvas]);

  const redo = useCallback(async () => {
    if (!fabricCanvas) return false;
    if (isUndoRedo.current) return false;
    
    const currentState = historyStateRef.current;
    if (currentState.currentIndex >= currentState.history.length - 1) return false;

    try {
      console.log('Redo triggered, currentIndex:', currentState.currentIndex);
      isUndoRedo.current = true;
      // Suspend any state saving briefly to avoid re-entrancy from Fabric events
      suspendUntil.current = Date.now() + 300;
      const nextState = currentState.history[currentState.currentIndex + 1];
      
      await fabricCanvas.loadFromJSON(nextState.json);
      fabricCanvas.setViewportTransform(nextState.viewportTransform as [number, number, number, number, number, number]);
      fabricCanvas.renderAll();
      
      setHistoryState(prev => {
        const next = { ...prev, currentIndex: prev.currentIndex + 1 };
        historyStateRef.current = next;
        console.log('Redo: updating currentIndex from', prev.currentIndex, 'to', next.currentIndex);
        return next;
      });
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
  }, [fabricCanvas]);

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