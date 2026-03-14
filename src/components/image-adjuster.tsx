
"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

interface ImageAdjusterProps {
  state: {
    file: File;
    type: "photo" | "cover";
    aspectRatio: number;
  } | null;
  onClose: () => void;
  onSave: (dataUrl: string) => void;
}

export function ImageAdjuster({ state, onClose, onSave }: ImageAdjusterProps) {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(new Image());
  const containerRef = useRef<HTMLDivElement>(null);
  
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (state?.file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = imageRef.current;
        img.onload = () => {
             // Reset state for new image
            setZoom(1);
            setPosition({ x: 0, y: 0 });
            setImageSrc(e.target?.result as string);
        }
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(state.file);
    } else {
        setImageSrc(null);
    }
  }, [state?.file]);

  const drawImage = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const container = containerRef.current;
    if (!ctx || !container || !imageSrc) return;

    const img = imageRef.current;
    const { width: containerWidth, height: containerHeight } = container.getBoundingClientRect();
    
    canvas.width = containerWidth;
    canvas.height = containerHeight;

    let imgWidth = img.width;
    let imgHeight = img.height;

    // Scale image to fit container while maintaining aspect ratio
    const hRatio = containerWidth / imgWidth;
    const vRatio = containerHeight / imgHeight;
    const initialZoom = Math.max(hRatio, vRatio);
    
    const scaledWidth = imgWidth * initialZoom * zoom;
    const scaledHeight = imgHeight * initialZoom * zoom;

    // Clamp position
    const maxX = Math.max(0, (scaledWidth - containerWidth) / 2);
    const maxY = Math.max(0, (scaledHeight - containerHeight) / 2);

    const clampedX = Math.max(-maxX, Math.min(maxX, position.x));
    const clampedY = Math.max(-maxY, Math.min(maxY, position.y));

    if(clampedX !== position.x || clampedY !== position.y){
        setPosition({x: clampedX, y: clampedY});
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(containerWidth / 2 + clampedX, containerHeight / 2 + clampedY);
    ctx.drawImage(img, -scaledWidth / 2, -scaledHeight / 2, scaledWidth, scaledHeight);
    ctx.restore();

  }, [imageSrc, zoom, position]);

  useEffect(() => {
    drawImage();
  }, [drawImage]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDragging.current = true;
    dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    e.currentTarget.style.cursor = 'grabbing';
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging.current) return;
    const newX = e.clientX - dragStart.current.x;
    const newY = e.clientY - dragStart.current.y;
    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDragging.current = false;
    e.currentTarget.style.cursor = 'grab';
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      onSave(canvas.toDataURL("image/png"));
    }
  };

  const reset = () => {
    setZoom(1);
    setPosition({x: 0, y: 0});
  }

  return (
    <Dialog open={!!state} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Adjust Image</DialogTitle>
          <DialogDescription>
            Pan and zoom to get the perfect fit for your image.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4">
          <div ref={containerRef} className="w-full rounded-md overflow-hidden" style={{aspectRatio: state?.aspectRatio}}>
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{ cursor: 'grab' }}
            />
          </div>
          
          <div className="w-full flex items-center gap-4">
              <ZoomOut className="h-5 w-5 text-muted-foreground" />
              <Slider
                min={1}
                max={3}
                step={0.01}
                value={[zoom]}
                onValueChange={([val]) => setZoom(val)}
              />
              <ZoomIn className="h-5 w-5 text-muted-foreground" />
              <Button variant="ghost" size="icon" onClick={reset}><RotateCcw className="h-4 w-4" /></Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Image</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

    