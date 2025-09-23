import { useEffect, useRef } from 'react';
import { Canvas as FabricCanvas } from 'fabric';

interface UseObjectMovementProps {
  fabricCanvas: FabricCanvas | null;
  onObjectMoveStart: () => void;
  onObjectMoveEnd: () => void;
}

export const useObjectMovement = ({
  fabricCanvas,
  onObjectMoveStart,
  onObjectMoveEnd
}: UseObjectMovementProps) => {
  const isMoving = useRef(false);

  useEffect(() => {
    if (!fabricCanvas) return;

    const handleObjectMoving = () => {
      if (!isMoving.current) {
        isMoving.current = true;
        onObjectMoveStart();
      }
    };

    const handleObjectMoved = () => {
      if (isMoving.current) {
        isMoving.current = false;
        setTimeout(() => {
          onObjectMoveEnd();
        }, 100);
      }
    };

    fabricCanvas.on('object:moving', handleObjectMoving);
    fabricCanvas.on('object:modified', handleObjectMoved);

    return () => {
      fabricCanvas.off('object:moving', handleObjectMoving);
      fabricCanvas.off('object:modified', handleObjectMoved);
    };
  }, [fabricCanvas, onObjectMoveStart, onObjectMoveEnd]);
};