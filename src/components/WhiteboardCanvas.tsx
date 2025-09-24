import { useState, useRef, useEffect, useCallback } from "react";
import { Canvas as FabricCanvas, PencilBrush, Object as FabricObject } from "fabric";
import { Toolbar } from "./Toolbar";
import { ZoomControls } from "./ZoomControls";
import { PropertiesPanel } from "./PropertiesPanel";
import { TextPropertiesPanel } from "./TextPropertiesPanel";
import { HorizontalTextPropertiesPanel } from "./HorizontalTextPropertiesPanel";
import { ContextMenu } from "./ContextMenu";
import { AutoSaveStatus } from "./AutoSaveStatus";
import { useCanvasPersistence } from "../hooks/useCanvasPersistence";
import { useCanvasInitialization } from "../hooks/useCanvasInitialization";
import { useCanvasEventHandlers } from "../hooks/useCanvasEventHandlers";
import { useEnhancedCanvasNavigation } from "../hooks/useEnhancedCanvasNavigation";
import { useFitToContent } from "../hooks/useFitToContent";
import { useCanvasHistory } from "../hooks/useCanvasHistory";
import { useObjectMovement } from "../hooks/useObjectMovement";
import { useSmartPropertiesPosition } from "../hooks/useSmartPropertiesPosition";

import { useTheme } from "../hooks/useTheme";

import { ShapeType } from "./ShapesPanel";
import { toast } from "sonner";

// Extend Canvas interface for custom properties
declare module "fabric" {
  interface Canvas {
    isDragging?: boolean;
    lastPosX?: number;
    lastPosY?: number;
  }
}

export type DrawingTool = "select" | "pen" | "pan" | "text" | "shape";

export const WhiteboardCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  
  // Memoize getDefaultColor to prevent unnecessary re-renders
  const getDefaultColor = useCallback(() => {
    return theme === 'dark' ? '#FFFFFF' : '#000000';
  }, [theme]);
  
  // Core canvas state
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  
  // Tool state
  const [activeTool, setActiveTool] = useState<DrawingTool>("select");
  const [activeShape, setActiveShape] = useState<ShapeType | null>(null);
  const [selectedObject, setSelectedObject] = useState<FabricObject | null>(null);
  const [isObjectMoving, setIsObjectMoving] = useState(false);
  
  // Drawing state
  const [brushColor, setBrushColor] = useState("transparent");
  const [brushSize, setBrushSize] = useState(2);
  
  // Text state
  const [fontSize, setFontSize] = useState(16);
  const [fontFamily, setFontFamily] = useState("Inter, sans-serif");
  const [textColor, setTextColor] = useState("transparent");
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderlined, setIsUnderlined] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  
  // Click position for context menu paste
  const [lastClickPosition, setLastClickPosition] = useState<{ x: number; y: number } | null>(null);
  const [lastRightClickPosition, setLastRightClickPosition] = useState<{ x: number; y: number } | null>(null);
  
  // UI tick to force re-renders when text properties change
  const [uiTick, setUiTick] = useState(0);
  
  // Canvas state
  const [zoom, setZoom] = useState(1);
  const [isDirty, setIsDirty] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    object?: FabricObject;
  } | null>(null);

  // Shape drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPointer, setStartPointer] = useState<{ x: number; y: number } | null>(null);
  const [currentShape, setCurrentShape] = useState<FabricObject | null>(null);
  const [strokeWidth, setStrokeWidth] = useState(2);
  
  // Copy/paste state
  const copiedObjectRef = useRef<FabricObject | null>(null);
  const lastClipboardSourceRef = useRef<'internal' | 'system' | null>(null);
  const lastClipboardTimestamp = useRef<number>(0);
  const lastPastedSignatureRef = useRef<string>('');
  
  // Alt key tracking (simplified, no duplication logic)
  const altKeyPressed = useRef(false);
  
  const { saveCanvas, loadCanvas } = useCanvasPersistence();
  const { saveState, undo, redo, canUndo, canRedo } = useCanvasHistory(fabricCanvas);
  
  // Smart positioning for properties panel
  const propertiesPosition = useSmartPropertiesPosition({
    selectedObject,
    panelWidth: 280,
    panelHeight: (selectedObject?.type === 'i-text' || selectedObject?.type === 'text') ? 56 : 200
  });

  // Initialize canvas
  useCanvasInitialization({
    containerRef,
    canvasRef,
    brushColor,
    brushSize,
    onCanvasReady: setFabricCanvas,
    onDirtyChange: setIsDirty,
    onSelectionChange: setSelectedObject,
    loadCanvas
  });

  // Setup event handlers
  useCanvasEventHandlers({
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
    onIsDrawingChange: setIsDrawing,
    onStartPointerChange: (pointer) => {
      setStartPointer(pointer);
      if (pointer) {
        setLastClickPosition(pointer);
      }
    },
    onCurrentShapeChange: setCurrentShape,
    onActivateSelect: () => {
      setActiveTool("select");
      setActiveShape(null);
    },
    onDirtyChange: setIsDirty,
    onZoomChange: setZoom,
    onSelectedObjectChange: setSelectedObject,
    saveState,
    themeDefault: getDefaultColor(),
    altKeyPressed
  });

  // Setup enhanced navigation
  useEnhancedCanvasNavigation({
    fabricCanvas,
    onZoomChange: setZoom,
    isTextEditing: activeTool === 'text',
    backgroundElement: containerRef.current,
    onHistoryCheckpoint: saveState
  });

  // Object movement tracking
  useObjectMovement({
    fabricCanvas,
    onObjectMoveStart: () => setIsObjectMoving(true),
    onObjectMoveEnd: () => setIsObjectMoving(false)
  });

  // Setup fit to content functionality
  const fitToContent = useFitToContent(fabricCanvas);

  // Update canvas properties based on active tool
  useEffect(() => {
    if (!fabricCanvas) return;

    try {
      if (activeTool === "pen") {
        fabricCanvas.isDrawingMode = true;
        fabricCanvas.selection = false;
        fabricCanvas.skipTargetFind = true; // Prevent object selection during pen drawing
        
        const brush = fabricCanvas.freeDrawingBrush as PencilBrush;
        if (brush) {
          brush.color = brushColor === "transparent" ? getDefaultColor() : brushColor;
          brush.width = brushSize;
        }
        
        if (fabricCanvas.getElement()) {
          fabricCanvas.setCursor("crosshair");
        }
      } else if (activeTool === "pan") {
        fabricCanvas.isDrawingMode = false;
        fabricCanvas.selection = false;
        if (fabricCanvas.getElement()) {
          fabricCanvas.setCursor("grab");
        }
      } else if (activeTool === "shape") {
        fabricCanvas.isDrawingMode = false;
        fabricCanvas.selection = false;
        if (fabricCanvas.getElement()) {
          fabricCanvas.setCursor("crosshair");
        }
      } else if (activeTool === "text") {
        fabricCanvas.isDrawingMode = false;
        fabricCanvas.selection = false;
        if (fabricCanvas.getElement()) {
          fabricCanvas.setCursor("text");
        }
      } else {
        fabricCanvas.isDrawingMode = false;
        fabricCanvas.selection = true;
        fabricCanvas.skipTargetFind = false; // Re-enable object selection
        fabricCanvas.selectionBorderColor = 'rgba(100, 150, 255, 0.8)';
        fabricCanvas.selectionLineWidth = 2;
        fabricCanvas.selectionColor = 'rgba(100, 150, 255, 0.1)';
        if (fabricCanvas.getElement()) {
          fabricCanvas.setCursor("default");
        }
      }
    } catch (error) {
      console.warn("Error updating cursor:", error);
    }
  }, [activeTool, brushColor, brushSize, fabricCanvas]);

  // Auto-save state
  const [saveError, setSaveError] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    if (!isDirty || !fabricCanvas) return;

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await saveCanvas(fabricCanvas);
        setIsDirty(false);
        setSaveError(false);
      } catch (error) {
        console.error("Auto-save failed:", error);
        setSaveError(true);
        // Retry after 5 seconds
        setTimeout(() => {
          setIsDirty(true);
        }, 5000);
      }
    }, 2000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [isDirty, fabricCanvas, saveCanvas]);
  
  // Save initial state when canvas is ready and setup history tracking
  useEffect(() => {
    if (!fabricCanvas) return;
    
    // Initial state
    setTimeout(() => {
      saveState();
    }, 100);
    
    // Setup history tracking for canvas events with debouncing to prevent excessive saves
    let historyTimeoutId: NodeJS.Timeout | null = null;
    
    const debouncedSaveState = () => {
      if (historyTimeoutId) {
        clearTimeout(historyTimeoutId);
      }
      historyTimeoutId = setTimeout(() => saveState(), 100);
    };
    
    const handleObjectModified = () => {
      debouncedSaveState();
    };
    
    const handleObjectAdded = (e: any) => {
      // Don't save history for preview shapes
      if (e.target && e.target.selectable === false && e.target.evented === false) {
        return;
      }
      debouncedSaveState();
    };
    
    const handleObjectRemoved = () => {
      debouncedSaveState();
    };
    
    const handlePathCreated = () => {
      debouncedSaveState();
    };
    
    fabricCanvas.on('object:modified', handleObjectModified);
    fabricCanvas.on('object:added', handleObjectAdded);
    fabricCanvas.on('object:removed', handleObjectRemoved);
    fabricCanvas.on('path:created', handlePathCreated);
    
    return () => {
      if (historyTimeoutId) {
        clearTimeout(historyTimeoutId);
      }
      fabricCanvas.off('object:modified', handleObjectModified);
      fabricCanvas.off('object:added', handleObjectAdded);
      fabricCanvas.off('object:removed', handleObjectRemoved);
      fabricCanvas.off('path:created', handlePathCreated);
    };
  }, [fabricCanvas, saveState]);

  // Calculate viewport center for image positioning
  const getViewportCenter = useCallback(() => {
    if (!fabricCanvas) return { x: 0, y: 0 };
    
    const vpt = fabricCanvas.viewportTransform!;
    const zoom = fabricCanvas.getZoom();
    const canvasWidth = fabricCanvas.getWidth();
    const canvasHeight = fabricCanvas.getHeight();
    
    // Calculate center of visible viewport in canvas coordinates
    const centerX = (canvasWidth / 2 - vpt[4]) / zoom;
    const centerY = (canvasHeight / 2 - vpt[5]) / zoom;
    
    return { x: centerX, y: centerY };
  }, [fabricCanvas]);

  // Helper function to insert image from data URL
  const insertImageFromDataURL = useCallback(async (dataURL: string, useRightClickPosition: boolean = false) => {
    if (!fabricCanvas) return;

    try {
      const { FabricImage } = await import('fabric');
      const img = await FabricImage.fromURL(dataURL);
      
      // Scale image to fit canvas if too large
      const maxWidth = fabricCanvas.getWidth() * 0.8;
      const maxHeight = fabricCanvas.getHeight() * 0.8;
      
      if (img.width! > maxWidth || img.height! > maxHeight) {
        const scale = Math.min(maxWidth / img.width!, maxHeight / img.height!);
        img.scale(scale);
      }
      
      // Use right-click position if available and requested, otherwise center in viewport
      let position;
      if (useRightClickPosition && lastRightClickPosition) {
        const vpt = fabricCanvas.viewportTransform!;
        const zoom = fabricCanvas.getZoom();
        position = {
          x: (lastRightClickPosition.x - vpt[4]) / zoom,
          y: (lastRightClickPosition.y - vpt[5]) / zoom
        };
        setLastRightClickPosition(null); // Clear after use
      } else {
        position = getViewportCenter();
      }
      
      img.set({
        left: position.x - (img.width! * img.scaleX!) / 2,
        top: position.y - (img.height! * img.scaleY!) / 2,
        selectable: true,
        hasControls: true,
        hasBorders: true,
      });
      
      fabricCanvas.add(img);
      fabricCanvas.setActiveObject(img);
      fabricCanvas.renderAll();
      setSelectedObject(img);
      setIsDirty(true);
      saveState();
      
      return true;
    } catch (error) {
      console.error('Failed to insert image:', error);
      return false;
    }
  }, [fabricCanvas, lastRightClickPosition, getViewportCenter, saveState]);

  // Unified paste function that handles all sources with proper priority
  const pasteFromSources = useCallback(async (useRightClickPosition: boolean = false, clipboardEvent?: ClipboardEvent) => {
    if (!fabricCanvas) return false;

    // Helper function to generate signature for "paste once" logic
    const generateSignature = (source: string, data: string) => `${source}:${data}`;

    // Priority 1: Check for internal clipboard marker (from system clipboard text)
    try {
      // Check clipboard event first if available
      let clipboardText = '';
      if (clipboardEvent?.clipboardData) {
        clipboardText = clipboardEvent.clipboardData.getData('text/plain') || '';
      } else if ('clipboard' in navigator && 'readText' in navigator.clipboard) {
        clipboardText = await navigator.clipboard.readText();
      }
      
      if (clipboardText.startsWith('WBCLIP:')) {
        const timestamp = clipboardText.replace('WBCLIP:', '');
        const signature = generateSignature('internal', timestamp);
        
        // Check if we haven't already pasted this signature
        if (signature !== lastPastedSignatureRef.current && copiedObjectRef.current) {
          try {
            const cloned = await copiedObjectRef.current.clone();
            
            // Use right-click position if available and requested, otherwise offset from original
            let position;
            if (useRightClickPosition && lastRightClickPosition) {
              const vpt = fabricCanvas.viewportTransform!;
              const zoom = fabricCanvas.getZoom();
              position = {
                x: (lastRightClickPosition.x - vpt[4]) / zoom,
                y: (lastRightClickPosition.y - vpt[5]) / zoom
              };
              setLastRightClickPosition(null);
            } else {
              position = {
                x: (cloned.left || 0) + 20,
                y: (cloned.top || 0) + 20
              };
            }
            
            cloned.set({
              left: position.x,
              top: position.y,
              evented: true,
            });
            
            fabricCanvas.add(cloned);
            fabricCanvas.setActiveObject(cloned);
            fabricCanvas.renderAll();
            setSelectedObject(cloned);
            setIsDirty(true);
            saveState();
            
            // Mark this signature as pasted and clear internal object for "paste once"
            lastPastedSignatureRef.current = signature;
            copiedObjectRef.current = null;
            
            toast("Object pasted");
            return true;
          } catch (error) {
            console.error('Failed to paste internal object:', error);
          }
        }
      }
    } catch (error) {
      console.log('Could not read clipboard text:', error);
    }

    // Priority 2: Check event.clipboardData for web/direct paste images
    const items = clipboardEvent?.clipboardData?.items;
    if (items && items.length > 0) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            try {
              const { fileToDataURL } = await import('@/utils/imageUtils');
              const dataURL = await fileToDataURL(file);
              const signature = generateSignature('clipboard-image', dataURL.substring(0, 100)); // Use first 100 chars as signature
              
              // Check if we haven't already pasted this signature
              if (signature !== lastPastedSignatureRef.current) {
                const success = await insertImageFromDataURL(dataURL, useRightClickPosition);
                if (success) {
                  lastClipboardSourceRef.current = 'system';
                  lastClipboardTimestamp.current = Date.now();
                  lastPastedSignatureRef.current = signature;
                  toast('Image pasted!');
                  return true;
                }
              }
            } catch (error) {
              toast('Failed to load image');
            }
          }
        }
      }
    }

    // Priority 3: Check system clipboard via navigator.clipboard.read() (desktop images)
    try {
      if ('clipboard' in navigator && 'read' in navigator.clipboard) {
        const clipboardItems = await navigator.clipboard.read();
        for (const clipboardItem of clipboardItems) {
          for (const type of clipboardItem.types) {
            if (type.startsWith('image/')) {
              const blob = await clipboardItem.getType(type);
              const { fileToDataURL } = await import('@/utils/imageUtils');
              const dataURL = await fileToDataURL(blob);
              const signature = generateSignature('system-image', dataURL.substring(0, 100)); // Use first 100 chars as signature
              
              // Check if we haven't already pasted this signature
              if (signature !== lastPastedSignatureRef.current) {
                const success = await insertImageFromDataURL(dataURL, useRightClickPosition);
                if (success) {
                  lastClipboardSourceRef.current = 'system';
                  lastClipboardTimestamp.current = Date.now();
                  lastPastedSignatureRef.current = signature;
                  toast('Image pasted!');
                  return true;
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('System clipboard access failed:', error);
    }

    return false;
  }, [fabricCanvas, insertImageFromDataURL, saveState, lastRightClickPosition]);

  // Handle keyboard shortcuts, global paste, and drag-drop
  useEffect(() => {
    if (!fabricCanvas) return;
    
    // Global paste handler - unified logic
    const handleGlobalPaste = async (e: ClipboardEvent) => {
      // Don't interfere with text editing
      const isTextEditing = (fabricCanvas?.getActiveObject() as any)?.isEditing === true ||
                           document.activeElement?.tagName === 'TEXTAREA' ||
                           (document.activeElement as HTMLElement)?.contentEditable === 'true';
      
      if (isTextEditing) return;

      // Use unified paste logic with clipboard event data
      e.preventDefault();
      const success = await pasteFromSources(false, e);
      if (!success) {
        // Optionally show a message if nothing was pasted
        console.log('Nothing to paste');
      }
    };
    
    // Drag and drop handler
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.dataTransfer!.dropEffect = 'copy';
    };
    
    const handleDrop = async (e: DragEvent) => {
      e.preventDefault();
      
      const files = e.dataTransfer?.files;
      if (!files) return;
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith('image/')) {
          try {
            // Convert to data URL for persistence
            const { fileToDataURL } = await import('@/utils/imageUtils');
            const dataURL = await fileToDataURL(file);
            
            import('fabric').then(({ FabricImage }) => {
              FabricImage.fromURL(dataURL).then((img) => {
              if (!fabricCanvas) return;
              
              // Get drop position relative to canvas
              const canvasElement = fabricCanvas.getElement();
              const canvasRect = canvasElement.getBoundingClientRect();
              const pointer = fabricCanvas.getPointer(e);
              
              // Scale image to fit canvas if too large
              const maxWidth = fabricCanvas.getWidth() * 0.8;
              const maxHeight = fabricCanvas.getHeight() * 0.8;
              
              if (img.width! > maxWidth || img.height! > maxHeight) {
                const scale = Math.min(maxWidth / img.width!, maxHeight / img.height!);
                img.scale(scale);
              }
              
              img.set({
                left: pointer.x - (img.width! * img.scaleX!) / 2,
                top: pointer.y - (img.height! * img.scaleY!) / 2,
                selectable: true,
                hasControls: true,
                hasBorders: true,
              });
              
                fabricCanvas.add(img);
                fabricCanvas.setActiveObject(img);
                fabricCanvas.renderAll();
                setSelectedObject(img);
                setIsDirty(true);
                saveState();
                lastClipboardSourceRef.current = 'system';
                lastClipboardTimestamp.current = Date.now();
                toast("Image added!");
              }).catch(() => {
                toast("Failed to load image");
              });
            });
          } catch (error) {
            toast("Failed to load image");
          }
        }
      }
    };
    
    
    const keyHandler = (e: KeyboardEvent) => {
      const isTextEditing = (fabricCanvas?.getActiveObject() as any)?.isEditing === true ||
                           document.activeElement?.tagName === 'TEXTAREA' ||
                           (document.activeElement as HTMLElement)?.contentEditable === 'true';
      
      // Track Alt key for duplication
      if (e.key === 'Alt') {
        altKeyPressed.current = true;
      }
      
      // Copy/Cut/Paste/Duplicate shortcuts
      if ((e.ctrlKey || e.metaKey) && !isTextEditing) {
        if (e.key === 'c' || e.key === 'C') {
          // Ctrl/Cmd + C = Copy selected object
          copySelectedObject();
          e.preventDefault();
          return;
        } else if (e.key === 'x' || e.key === 'X') {
          // Ctrl/Cmd + X = Cut selected object
          cutSelectedObject();
          e.preventDefault();
          return;
        } else if (e.key === 'd' || e.key === 'D') {
          // Ctrl/Cmd + D = Duplicate selected object
          duplicateSelectedObject();
          e.preventDefault();
          return;
        } else if (e.key === 'a' || e.key === 'A') {
          // Ctrl/Cmd + A = Select all objects
          selectAllObjects();
          e.preventDefault();
          return;
        }
      }
      
      // Undo/Redo shortcuts (normalize keys and prioritize redo)
      if ((e.ctrlKey || e.metaKey) && !isTextEditing) {
        const key = e.key.toLowerCase();
        if ((key === 'z' && e.shiftKey) || key === 'y') {
          // Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y = Redo
          e.preventDefault();
          e.stopPropagation();
          redo();
          return;
        }
        if (key === 'z') {
          // Ctrl/Cmd + Z = Undo
          e.preventDefault();
          e.stopPropagation();
          undo();
          return;
        }
      }
      
      if (e.key === 'Escape') {
        setActiveTool('select');
        setActiveShape(null);
        fabricCanvas.discardActiveObject();
        fabricCanvas.renderAll();
        setSelectedObject(null);
        e.preventDefault();
      }
      
      // Delete key
      if ((e.key === "Delete" || e.key === "Backspace") && !isTextEditing) {
        const activeObjects = fabricCanvas?.getActiveObjects();
        if (!activeObjects || activeObjects.length === 0) return;
        
        // Remove all selected objects
        activeObjects.forEach((obj: any) => {
          fabricCanvas.remove(obj);
        });
        
        fabricCanvas.discardActiveObject();
        fabricCanvas.renderAll();
        setSelectedObject(null);
        setIsDirty(true);
        saveState();
        
        const count = activeObjects.length;
        toast(`${count} object${count > 1 ? 's' : ''} deleted`);
        e.preventDefault();
        return;
      }
    };
    
    // Handle Alt key release for duplication
    const keyUpHandler = (e: KeyboardEvent) => {
      if (e.key === 'Alt') {
        altKeyPressed.current = false;
      }
    };
    
    // Using native listeners on Fabric's upper canvas for context menu and dblclick
    const canvasElement = fabricCanvas?.upperCanvasEl as HTMLCanvasElement | undefined;

    const handleCanvasContextMenu = (e: MouseEvent) => {
      // Skip if editing text to allow default interactions
      const isTextEditing = (fabricCanvas?.getActiveObject() as any)?.isEditing === true ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        (document.activeElement as HTMLElement)?.contentEditable === 'true';
      if (isTextEditing) return;
      e.preventDefault();
      e.stopPropagation();
      if (!canvasElement || !fabricCanvas) return;

      const rect = canvasElement.getBoundingClientRect();
      const canvasX = e.clientX - rect.left;
      const canvasY = e.clientY - rect.top;

      // Temporarily allow target finding to detect object under cursor
      const originalSkipTargetFind = fabricCanvas.skipTargetFind;
      fabricCanvas.skipTargetFind = false;
      const target = fabricCanvas.findTarget(e as any);
      fabricCanvas.skipTargetFind = originalSkipTargetFind;

      if (target) {
        fabricCanvas.setActiveObject(target);
        setSelectedObject(target as any);
        fabricCanvas.renderAll();
      } else {
        fabricCanvas.discardActiveObject();
        setSelectedObject(null);
        fabricCanvas.renderAll();
      }

      setLastRightClickPosition({ x: canvasX, y: canvasY });
      setContextMenu({ x: e.clientX, y: e.clientY, object: (target as any) || undefined });
    };

    const handleCanvasDblClick = (e: MouseEvent) => {
      const isTextEditing = (fabricCanvas?.getActiveObject() as any)?.isEditing === true ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        (document.activeElement as HTMLElement)?.contentEditable === 'true';
      if (isTextEditing) return;
      e.preventDefault();
      e.stopPropagation();
      if (!canvasElement || !fabricCanvas) return;

      const originalSkipTargetFind = fabricCanvas.skipTargetFind;
      fabricCanvas.skipTargetFind = false;
      const target = fabricCanvas.findTarget(e as any);
      fabricCanvas.skipTargetFind = originalSkipTargetFind;

      // Only handle text editing on double-click, don't open context menu
      if (target && (target.type === 'i-text' || target.type === 'text')) {
        fabricCanvas.setActiveObject(target);
        setSelectedObject(target as any);
        fabricCanvas.renderAll();
        setTimeout(() => {
          (target as any).enterEditing();
          (target as any).selectAll();
        }, 10);
      }
    };

    // Close context menu on any click
    const handleGlobalClick = () => {
      if (contextMenu) {
        setContextMenu(null);
      }
    };

    if (canvasElement) {
      // Important: use non-passive to allow preventDefault
      canvasElement.addEventListener('contextmenu', handleCanvasContextMenu, { passive: false });
      canvasElement.addEventListener('dblclick', handleCanvasDblClick, { passive: false } as any);
    }

    window.addEventListener('keydown', keyHandler);
    window.addEventListener('keyup', keyUpHandler);
    window.addEventListener('paste', handleGlobalPaste);
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('drop', handleDrop);
    window.addEventListener('click', handleGlobalClick);
    
    return () => {
      if (canvasElement) {
        canvasElement.removeEventListener('contextmenu', handleCanvasContextMenu as any);
        canvasElement.removeEventListener('dblclick', handleCanvasDblClick as any);
      }
      window.removeEventListener('keydown', keyHandler);
      window.removeEventListener('keyup', keyUpHandler);
      window.removeEventListener('paste', handleGlobalPaste);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('drop', handleDrop);
      window.removeEventListener('click', handleGlobalClick);
    };
  }, [fabricCanvas, selectedObject, saveState, lastRightClickPosition, getViewportCenter, contextMenu]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (fabricCanvas && containerRef.current) {
        fabricCanvas.setWidth(containerRef.current.clientWidth);
        fabricCanvas.setHeight(containerRef.current.clientHeight);
        fabricCanvas.renderAll();
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [fabricCanvas]);

  // Handle tool clicks
  const handleToolClick = useCallback((tool: DrawingTool) => {
    console.log('Tool clicked:', tool, 'Current colors:', { brushColor, textColor });
    setActiveTool(tool);
    if (tool !== "shape") {
      setActiveShape(null);
    }
    
      // Update brush color for pen tool
      if (tool === 'pen' && fabricCanvas && fabricCanvas.freeDrawingBrush) {
        const effectiveColor = brushColor === "transparent" ? getDefaultColor() : brushColor;
        fabricCanvas.freeDrawingBrush.color = effectiveColor;
        fabricCanvas.freeDrawingBrush.width = brushSize;
      }
    
    // Save state for undo/redo when switching tools
    if (fabricCanvas) {
      saveState();
    }
  }, [fabricCanvas, saveState, brushColor, textColor]);

  const handleShapeSelect = useCallback((shape: ShapeType) => {
    setActiveShape(shape);
    setActiveTool("shape");
    if (fabricCanvas) {
      saveState();
    }
  }, [fabricCanvas, saveState]);

  const handleClear = useCallback(() => {
    if (!fabricCanvas) return;
    saveState(); // Save state before clearing for undo
    fabricCanvas.clear();
    fabricCanvas.renderAll();
    setIsDirty(true);
    toast("Canvas cleared");
  }, [fabricCanvas, saveState]);

  const handleExport = useCallback(() => {
    if (!fabricCanvas) return;
    
    const dataURL = fabricCanvas.toDataURL({
      format: "png",
      quality: 1,
      multiplier: 2,
    });
    
    const link = document.createElement("a");
    link.download = `whiteboard-${new Date().toISOString().split("T")[0]}.png`;
    link.href = dataURL;
    link.click();
    
    toast("Canvas exported as PNG");
  }, [fabricCanvas]);

  // Read text properties when selection changes to a text object
  useEffect(() => {
    if (!selectedObject || !fabricCanvas) return;
    
    if (selectedObject.type === 'i-text' || selectedObject.type === 'text') {
      const textObject = selectedObject as any;
      // Read the text object's current properties into UI state
      setFontFamily(textObject.fontFamily || fontFamily);
      setFontSize(textObject.fontSize || fontSize);
      setTextColor(textObject.fill === getDefaultColor() ? "transparent" : textObject.fill || textColor);
      setIsBold(textObject.fontWeight === 'bold');
      setIsItalic(textObject.fontStyle === 'italic');
      setIsUnderlined(textObject.underline || false);
      setIsStrikethrough(textObject.linethrough || false);
    }
  }, [selectedObject, fabricCanvas, getDefaultColor]);

  // Update pen color when selecting drawn objects
  useEffect(() => {
    if (!selectedObject) return;
    
    if (selectedObject.type === 'path') {
      const pathObject = selectedObject as any;
      const pathColor = pathObject.stroke;
      if (pathColor && pathColor !== getDefaultColor()) {
        setBrushColor(pathColor);
      } else {
        setBrushColor("transparent");
      }
    }
  }, [selectedObject, getDefaultColor]);

  const handleZoom = useCallback((direction: "in" | "out" | "fit") => {
    if (!fabricCanvas) return;

    if (direction === "fit") {
      fitToContent();
      setZoom(fabricCanvas.getZoom());
      return;
    }

    let newZoom = fabricCanvas.getZoom();
    
    if (direction === "in") {
      newZoom = Math.min(newZoom * 1.2, 20);
    } else if (direction === "out") {
      newZoom = Math.max(newZoom / 1.2, 0.01);
    }

    fabricCanvas.setZoom(newZoom);
    setZoom(newZoom);
    fabricCanvas.renderAll();
  }, [fabricCanvas, fitToContent]);

  const handleObjectUpdate = useCallback((object: FabricObject, updates: any) => {
    if (!object || !fabricCanvas) return;

    // For text objects, preserve existing properties and only update the specified ones
    if (object.type === 'i-text' || object.type === 'text') {
      const textObject = object as any;
      
      // Update local state to match the changes
      if ('fontSize' in updates) setFontSize(updates.fontSize);
      if ('fontFamily' in updates) setFontFamily(updates.fontFamily);
      if ('fill' in updates) {
        setTextColor(updates.fill === getDefaultColor() ? "transparent" : updates.fill);
      }
      if ('fontWeight' in updates) setIsBold(updates.fontWeight === 'bold');
      if ('fontStyle' in updates) setIsItalic(updates.fontStyle === 'italic');
      if ('underline' in updates) setIsUnderlined(updates.underline);
      if ('linethrough' in updates) setIsStrikethrough(updates.linethrough);
      
      // Apply updates while preserving existing properties
      const currentProps = {
        fontSize: textObject.fontSize,
        fontFamily: textObject.fontFamily,
        fill: textObject.fill,
        fontWeight: textObject.fontWeight,
        fontStyle: textObject.fontStyle,
        underline: textObject.underline,
        linethrough: textObject.linethrough
      };
      
      object.set({ ...currentProps, ...updates });
    } else {
      object.set(updates);
    }
    
    fabricCanvas.renderAll();
    setIsDirty(true);
    setUiTick(prev => prev + 1); // Force UI re-render
    saveState();
  }, [fabricCanvas, getDefaultColor, saveState]);

  const handleDeselect = useCallback(() => {
    if (fabricCanvas) {
      fabricCanvas.discardActiveObject();
      fabricCanvas.renderAll();
    }
    setSelectedObject(null);
  }, [fabricCanvas]);

  // Object manipulation functions
  const copySelectedObject = useCallback(async () => {
    const activeObject = fabricCanvas?.getActiveObject();
    if (!activeObject) {
      toast("No object selected to copy");
      return;
    }
    
    // Store in internal clipboard for canvas-to-canvas operations (preserves vector format)
    copiedObjectRef.current = activeObject;
    lastClipboardSourceRef.current = 'internal';
    const timestamp = Date.now();
    lastClipboardTimestamp.current = timestamp;
    
    // Reset paste signature so this can be pasted again
    lastPastedSignatureRef.current = '';
    
    // Write internal marker to system clipboard so both Cmd+V and context menu recognize internal objects
    try {
      if ('clipboard' in navigator && 'writeText' in navigator.clipboard) {
        await navigator.clipboard.writeText(`WBCLIP:${timestamp}`);
      }
    } catch (error) {
      console.log('Could not write to system clipboard:', error);
    }
    
    toast("Object copied");
  }, [fabricCanvas]);

  const cutSelectedObject = useCallback(async () => {
    const activeObject = fabricCanvas?.getActiveObject();
    if (!activeObject || !fabricCanvas) {
      toast("No object selected to cut");
      return;
    }
    
    copiedObjectRef.current = activeObject;
    lastClipboardSourceRef.current = 'internal';
    const timestamp = Date.now();
    lastClipboardTimestamp.current = timestamp;
    
    // Reset paste signature so this can be pasted again
    lastPastedSignatureRef.current = '';
    
    // Write internal marker to system clipboard
    try {
      if ('clipboard' in navigator && 'writeText' in navigator.clipboard) {
        await navigator.clipboard.writeText(`WBCLIP:${timestamp}`);
      }
    } catch (error) {
      console.log('Could not write to system clipboard:', error);
    }
    
    fabricCanvas.remove(activeObject);
    fabricCanvas.discardActiveObject();
    fabricCanvas.renderAll();
    setSelectedObject(null);
    setIsDirty(true);
    saveState();
    toast("Object cut");
  }, [fabricCanvas, saveState]);

  const handleSystemClipboardPaste = useCallback(async (useRightClickPosition: boolean = false) => {
    await pasteFromSources(useRightClickPosition);
  }, [pasteFromSources]);

  const duplicateSelectedObject = useCallback(() => {
    const activeObject = fabricCanvas?.getActiveObject();
    if (!activeObject || !fabricCanvas) {
      toast("No object selected to duplicate");
      return;
    }

    activeObject.clone().then((cloned: FabricObject) => {
      cloned.set({
        left: (cloned.left || 0) + 20,
        top: (cloned.top || 0) + 20,
        evented: true,
      });
      
      fabricCanvas.add(cloned);
      fabricCanvas.setActiveObject(cloned);
      fabricCanvas.renderAll();
      setSelectedObject(cloned);
      setIsDirty(true);
      saveState();
      toast("Object duplicated");
    });
  }, [fabricCanvas, saveState]);

  const selectAllObjects = useCallback(() => {
    if (!fabricCanvas) return;
    
    const objects = fabricCanvas.getObjects();
    if (objects.length === 0) {
      toast("No objects to select");
      return;
    }
    
    if (objects.length === 1) {
      fabricCanvas.setActiveObject(objects[0]);
      setSelectedObject(objects[0]);
      fabricCanvas.renderAll();
    } else {
      // Create selection for multiple objects
      import('fabric').then(({ ActiveSelection }) => {
        const selection = new ActiveSelection(objects, {
          canvas: fabricCanvas,
        });
        fabricCanvas.setActiveObject(selection);
        setSelectedObject(selection);
        fabricCanvas.renderAll();
      });
    }
    
    toast(`Selected ${objects.length} object${objects.length > 1 ? 's' : ''}`);
  }, [fabricCanvas]);

  const bringToFront = useCallback(() => {
    const activeObject = fabricCanvas?.getActiveObject();
    if (!activeObject || !fabricCanvas) {
      toast("No object selected");
      return;
    }

    fabricCanvas.bringObjectToFront(activeObject);
    fabricCanvas.renderAll();
    setIsDirty(true);
    saveState();
    toast("Object brought to front");
  }, [fabricCanvas, saveState]);

  const sendToBack = useCallback(() => {
    const activeObject = fabricCanvas?.getActiveObject();
    if (!activeObject || !fabricCanvas) {
      toast("No object selected");
      return;
    }

    fabricCanvas.sendObjectToBack(activeObject);
    fabricCanvas.renderAll();
    setIsDirty(true);
    saveState();
    toast("Object sent to back");
  }, [fabricCanvas, saveState]);

  const handleContextMenuCopy = useCallback(() => {
    const activeObject = fabricCanvas?.getActiveObject();
    if (activeObject) {
      copySelectedObject();
    } else {
      // Fallback to copying entire canvas
      if (!fabricCanvas) return;
      
      const dataURL = fabricCanvas.toDataURL({
        format: 'png',
        quality: 1,
        multiplier: 2
      });
      
      // Copy to clipboard
      fetch(dataURL)
        .then(res => res.blob())
        .then(blob => {
          navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          toast("Canvas copied to clipboard!");
        })
        .catch(() => {
          toast("Failed to copy canvas");
        });
    }
  }, [fabricCanvas, copySelectedObject]);

  const handleContextMenuPaste = useCallback(async () => {
    // For context menu, we need to access clipboard directly since we don't have clipboardEvent
    try {
      // First try to read clipboard directly for better desktop image support
      if ('clipboard' in navigator && 'read' in navigator.clipboard) {
        const clipboardItems = await navigator.clipboard.read();
        for (const clipboardItem of clipboardItems) {
          for (const type of clipboardItem.types) {
            if (type.startsWith('image/')) {
              // Found an image, create a synthetic clipboardEvent-like structure
              const blob = await clipboardItem.getType(type);
              const file = new File([blob], 'clipboard-image', { type });
              
              // Create a synthetic clipboardData structure
              const syntheticClipboardData = {
                items: [{
                  type,
                  getAsFile: () => file
                }],
                getData: () => ''
              };
              
              // Create a synthetic clipboard event
              const syntheticEvent = {
                clipboardData: syntheticClipboardData
              } as unknown as ClipboardEvent;
              
              // Use pasteFromSources with the synthetic event
              const success = await pasteFromSources(true, syntheticEvent);
              if (success) return;
            }
          }
        }
      }
    } catch (error) {
      console.error('Direct clipboard access failed:', error);
    }
    
    // Fallback to original method
    const success = await pasteFromSources(true);
    if (!success) {
      toast("Nothing to paste");
    }
  }, [pasteFromSources]);

  const handleContextMenuDownload = useCallback(() => {
    handleExport();
    toast("Canvas downloaded!");
  }, [handleExport]);

  return (
    <div ref={containerRef} className="relative h-screen w-screen overflow-hidden whiteboard-canvas" style={{ minHeight: '100vh', minWidth: '100vw' }}>
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full"
        onContextMenu={(e) => {
          // Handle right-click context menu (enhanced with object selection)
          if (!((e.nativeEvent.target as HTMLElement)?.closest('[data-text-editing]'))) {
            e.preventDefault();
            e.stopPropagation();
            const rect = canvasRef.current?.getBoundingClientRect();
            if (rect && fabricCanvas) {
              const canvasX = e.clientX - rect.left;
              const canvasY = e.clientY - rect.top;
              
              // Temporarily disable skipTargetFind to ensure we can find objects
              const originalSkipTargetFind = fabricCanvas.skipTargetFind;
              fabricCanvas.skipTargetFind = false;
              
              // Check if there's an object under the cursor
              const target = fabricCanvas.findTarget(e.nativeEvent);
              
              // Restore original skipTargetFind setting
              fabricCanvas.skipTargetFind = originalSkipTargetFind;
              
              if (target) {
                // Select the object first, then show context menu
                fabricCanvas.setActiveObject(target);
                setSelectedObject(target);
                fabricCanvas.renderAll();
              } else {
                // Clear selection if clicking on empty canvas
                fabricCanvas.discardActiveObject();
                setSelectedObject(null);
                fabricCanvas.renderAll();
              }
              
              setLastRightClickPosition({ x: canvasX, y: canvasY });
              setContextMenu({
                x: e.clientX,
                y: e.clientY,
                object: target || undefined
              });
            }
          }
        }}
        onDoubleClick={(e) => {
          // Handle double-click to select object and show context menu (all platforms)
          if (!((e.nativeEvent.target as HTMLElement)?.closest('[data-text-editing]'))) {
            e.preventDefault();
            e.stopPropagation();
            
            if (fabricCanvas) {
              const rect = canvasRef.current?.getBoundingClientRect();
              if (!rect) return;
              const canvasX = e.clientX - rect.left;
              const canvasY = e.clientY - rect.top;

              // Temporarily disable skipTargetFind to ensure we can find objects
              const originalSkipTargetFind = fabricCanvas.skipTargetFind;
              fabricCanvas.skipTargetFind = false;
              
              // Use fabric canvas event system for better accuracy
              const target = fabricCanvas.findTarget(e.nativeEvent);
              
              // Restore original skipTargetFind setting
              fabricCanvas.skipTargetFind = originalSkipTargetFind;
              
              if (target) {
                // Select the object first
                fabricCanvas.setActiveObject(target);
                setSelectedObject(target);
                fabricCanvas.renderAll();
                
                // Show context menu for object
                setLastRightClickPosition({ x: canvasX, y: canvasY });
                setContextMenu({
                  x: e.clientX,
                  y: e.clientY,
                  object: target
                });
              } else {
                // Clear selection and show general context menu if no object
                fabricCanvas.discardActiveObject();
                setSelectedObject(null);
                fabricCanvas.renderAll();
                
                setLastRightClickPosition({ x: canvasX, y: canvasY });
                setContextMenu({
                  x: e.clientX,
                  y: e.clientY,
                  object: undefined
                });
              }
            }
          }
        }}
      />
      
      {/* Fixed Toolbar at bottom center */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
        <Toolbar
          activeTool={activeTool}
          activeShape={activeShape}
          brushColor={brushColor}
          brushSize={brushSize}
          strokeWidth={strokeWidth}
          fontSize={fontSize}
          fontFamily={fontFamily}
          textColor={textColor}
          isBold={isBold}
          isItalic={isItalic}
          isUnderlined={isUnderlined}
          isStrikethrough={isStrikethrough}
          onToolClick={handleToolClick}
          onShapeSelect={handleShapeSelect}
          onColorChange={setBrushColor}
          onSizeChange={setBrushSize}
          onStrokeWidthChange={setStrokeWidth}
          onFontSizeChange={setFontSize}
          onFontFamilyChange={setFontFamily}
          onTextColorChange={setTextColor}
          onBoldToggle={() => setIsBold(!isBold)}
          onItalicToggle={() => setIsItalic(!isItalic)}
          onUnderlineToggle={() => setIsUnderlined(!isUnderlined)}
          onStrikethroughToggle={() => setIsStrikethrough(!isStrikethrough)}
          onClear={handleClear}
          onExport={handleExport}
          onUndo={undo}
          onRedo={redo}
          canUndo={canUndo}
          canRedo={canRedo}
        />
      </div>
      
      <ZoomControls
        zoom={zoom}
        onZoom={handleZoom}
      />
      
      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onCopy={handleContextMenuCopy}
          onPaste={handleContextMenuPaste}
          onCut={cutSelectedObject}
          onDuplicate={duplicateSelectedObject}
          onBringToFront={bringToFront}
          onSendToBack={sendToBack}
          onDownload={handleContextMenuDownload}
          hasSelectedObject={!!contextMenu.object}
        />
      )}

      {selectedObject && !isObjectMoving && (
        <>
          {(selectedObject.type === 'i-text' || selectedObject.type === 'text') ? (
            <HorizontalTextPropertiesPanel
              fontSize={(selectedObject as any).fontSize || fontSize}
              fontFamily={(selectedObject as any).fontFamily || fontFamily}
              textColor={(selectedObject as any).fill === getDefaultColor() ? "transparent" : (selectedObject as any).fill as string || textColor}
              isBold={((selectedObject as any).fontWeight === 'bold') || false}
              isItalic={((selectedObject as any).fontStyle === 'italic') || false}
              isUnderlined={(selectedObject as any).underline || false}
              isStrikethrough={(selectedObject as any).linethrough || false}
              onFontSizeChange={(newSize) => handleObjectUpdate(selectedObject, { fontSize: newSize })}
              onFontFamilyChange={(newFamily) => handleObjectUpdate(selectedObject, { fontFamily: newFamily })}
              onTextColorChange={(newColor) => handleObjectUpdate(selectedObject, { fill: newColor })}
              onBoldToggle={() => handleObjectUpdate(selectedObject, { 
                fontWeight: (selectedObject as any).fontWeight === 'bold' ? 'normal' : 'bold' 
              })}
              onItalicToggle={() => handleObjectUpdate(selectedObject, { 
                fontStyle: (selectedObject as any).fontStyle === 'italic' ? 'normal' : 'italic' 
              })}
              onUnderlineToggle={() => handleObjectUpdate(selectedObject, { underline: !(selectedObject as any).underline })}
              onStrikethroughToggle={() => handleObjectUpdate(selectedObject, { linethrough: !(selectedObject as any).linethrough })}
              left={propertiesPosition.left}
              top={propertiesPosition.top - 10}
              uiTick={uiTick}
            />
          ) : (
            <PropertiesPanel
              selectedObject={selectedObject}
              onObjectUpdate={handleObjectUpdate}
              onDeselect={handleDeselect}
            />
          )}
        </>
      )}

      <AutoSaveStatus isDirty={isDirty || saveError} />
    </div>
  );
};