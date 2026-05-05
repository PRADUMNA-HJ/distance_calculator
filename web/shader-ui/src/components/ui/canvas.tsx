import { useCallback, useEffect, useRef, useState } from "react";

export type Point = { x: number; y: number };
export type Box = { x: number; y: number; width: number; height: number };

export type Annotation = {
  mark_type: "box" | "circle" | "polygon";
  box?: Box | null;
  polygon?: Point[] | null;
};

interface CanvasProps {
  selectedFile: File | null;
  tool: "box" | "circle" | "polygon";
  onAnnotationChange: (annotation: Annotation | null) => void;
  predictedLabelPosition?: Point | null;
  predictionText?: string | null;
}

export function Canvas({
  selectedFile,
  tool,
  onAnnotationChange,
  predictedLabelPosition,
  predictionText,
}: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageBitmap, setImageBitmap] = useState<HTMLImageElement | null>(null);
  const [selectedBox, setSelectedBox] = useState<Box | null>(null);
  const [selectedPolygon, setSelectedPolygon] = useState<Point[]>([]);
  const [draftPolygon, setDraftPolygon] = useState<Point[]>([]);
  const [draftShape, setDraftShape] = useState<Box | null>(null);
  const isDrawingRef = useRef(false);
  const dragStartRef = useRef<Point | null>(null);
  // rAF handle to throttle pointer-move redraws
  const rafRef = useRef<number>(0);

  // ── Image Loading ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!selectedFile) {
      setImageBitmap(null);
      return;
    }

    const imageUrl = URL.createObjectURL(selectedFile);
    const img = new Image();
    img.onload = () => setImageBitmap(img);
    img.onerror = () => console.error("[Canvas] Failed to load image:", selectedFile.name);
    img.src = imageUrl;

    return () => URL.revokeObjectURL(imageUrl);
  }, [selectedFile]);

  // Reset draft state on tool switch
  useEffect(() => {
    setDraftPolygon([]);
    setDraftShape(null);
    isDrawingRef.current = false;
    dragStartRef.current = null;
  }, [tool]);

  // ── Canvas Resize (only on mount + resize) ───────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeObserver = new ResizeObserver(() => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        // Save annotation pixel coords are in canvas-space, so we must NOT
        // rescale existing annotations on resize in this MVP. Just resize.
        canvas.width = Math.round(rect.width);
        canvas.height = Math.round(rect.height);
      }
    });
    resizeObserver.observe(canvas);
    return () => resizeObserver.disconnect();
  }, []);

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const getCanvasPoint = (event: React.PointerEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  };

  const normalizeBox = (start: Point, current: Point): Box => ({
    x: Math.min(start.x, current.x),
    y: Math.min(start.y, current.y),
    width: Math.max(2, Math.abs(start.x - current.x)),
    height: Math.max(2, Math.abs(start.y - current.y)),
  });

  const circleToBox = (center: Point, edge: Point): Box => {
    const radius = Math.max(2, Math.hypot(edge.x - center.x, edge.y - center.y));
    return { x: center.x - radius, y: center.y - radius, width: radius * 2, height: radius * 2 };
  };

  // ── Pointer handlers ─────────────────────────────────────────────────────────
  const onPointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    (event.target as HTMLCanvasElement).setPointerCapture(event.pointerId);
    const point = getCanvasPoint(event);

    if (tool === "polygon") {
      const next = [...draftPolygon, point];
      setDraftPolygon(next);
      if (next.length >= 3) onAnnotationChange({ mark_type: "polygon", polygon: next });
      return;
    }

    isDrawingRef.current = true;
    dragStartRef.current = point;
    setDraftShape({ ...point, width: 2, height: 2 });
  };

  const onPointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !dragStartRef.current || tool === "polygon") return;

    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const point = getCanvasPoint(event);
      setDraftShape(
        tool === "circle"
          ? circleToBox(dragStartRef.current!, point)
          : normalizeBox(dragStartRef.current!, point)
      );
    });
  };

  const onPointerUp = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (tool === "polygon" || !isDrawingRef.current || !dragStartRef.current) return;

    const point = getCanvasPoint(event);
    const finalBox =
      tool === "circle"
        ? circleToBox(dragStartRef.current, point)
        : normalizeBox(dragStartRef.current, point);

    isDrawingRef.current = false;
    dragStartRef.current = null;

    setSelectedBox(finalBox);
    setSelectedPolygon([]);
    setDraftPolygon([]);
    setDraftShape(null);
    onAnnotationChange({ mark_type: tool, box: finalBox });
  };

  // ── Draw function (memoised) ─────────────────────────────────────────────────
  const drawPolygon = useCallback(
    (ctx: CanvasRenderingContext2D, points: Point[], stroke: string, fill: string) => {
      if (!points.length) return;
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      points.slice(1).forEach((p) => ctx.lineTo(p.x, p.y));
      if (points.length > 2) ctx.closePath();
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 2;
      ctx.stroke();
      if (points.length > 2) { ctx.fillStyle = fill; ctx.fill(); }
    },
    []
  );

  // ── Main draw effect ─────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background / image
    if (imageBitmap) {
      ctx.drawImage(imageBitmap, 0, 0, canvas.width, canvas.height);
    } else {
      ctx.fillStyle = "rgba(19,38,53,0.08)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Committed box annotation
    if (selectedBox) {
      ctx.strokeStyle = "#00c8be";
      ctx.lineWidth = 2;
      ctx.strokeRect(selectedBox.x, selectedBox.y, selectedBox.width, selectedBox.height);
      ctx.fillStyle = "rgba(0,200,190,0.14)";
      ctx.fillRect(selectedBox.x, selectedBox.y, selectedBox.width, selectedBox.height);
    }

    // Committed polygon
    drawPolygon(ctx, selectedPolygon, "#e87f2e", "rgba(232,127,46,0.16)");

    // Draft polygon (in-progress clicks)
    drawPolygon(ctx, draftPolygon, "#f15b2a", "rgba(241,91,42,0.10)");

    // Draft box/circle (being dragged)
    if (draftShape) {
      ctx.strokeStyle = "#f15b2a";
      ctx.lineWidth = 2;
      if (tool === "circle") {
        const r = draftShape.width / 2;
        ctx.beginPath();
        ctx.arc(draftShape.x + r, draftShape.y + r, r, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.strokeRect(draftShape.x, draftShape.y, draftShape.width, draftShape.height);
      }
    }

    // Prediction label indicator
    if (predictedLabelPosition) {
      ctx.fillStyle = "#f15b2a";
      ctx.beginPath();
      ctx.arc(predictedLabelPosition.x, predictedLabelPosition.y, 6, 0, Math.PI * 2);
      ctx.fill();

      if (predictionText) {
        ctx.font = "bold 15px system-ui, sans-serif";
        const tw = ctx.measureText(predictionText).width;
        const bw = tw + 18;
        const bh = 28;
        const bx = predictedLabelPosition.x - bw / 2;
        const by = predictedLabelPosition.y - 42;

        ctx.fillStyle = "rgba(0,0,0,0.78)";
        ctx.beginPath();
        // @ts-ignore – roundRect available in all modern browsers
        if (ctx.roundRect) ctx.roundRect(bx, by, bw, bh, 6);
        else ctx.rect(bx, by, bw, bh);
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(predictionText, predictedLabelPosition.x, by + bh / 2);

        // Connector line
        ctx.strokeStyle = "#f15b2a";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(predictedLabelPosition.x, by + bh);
        ctx.lineTo(predictedLabelPosition.x, predictedLabelPosition.y - 7);
        ctx.stroke();
      }
    }
  }, [
    imageBitmap,
    selectedBox,
    selectedPolygon,
    draftPolygon,
    draftShape,
    tool,
    predictedLabelPosition,
    predictionText,
    drawPolygon,
  ]);

  return (
    <canvas
      ref={canvasRef}
      className="h-full w-full cursor-crosshair touch-none select-none"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    />
  );
}
