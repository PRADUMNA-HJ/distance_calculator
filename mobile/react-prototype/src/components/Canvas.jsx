import { useRef, useState, useEffect } from "react";

export function Canvas({ tool, onDrawComplete }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState(null);
  const [currentShape, setCurrentShape] = useState(null);
  const [polygonPoints, setPolygonPoints] = useState([]);

  // Draw loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.strokeStyle = "#f15b2a";
    ctx.lineWidth = 2;

    const drawShape = (shape) => {
      if (!shape) return;
      if (shape.type === "box") ctx.strokeRect(shape.x, shape.y, shape.w, shape.h);
      else if (shape.type === "circle") {
        ctx.beginPath();
        ctx.arc(shape.x, shape.y, shape.r, 0, Math.PI * 2);
        ctx.stroke();
      } else if (shape.type === "polygon" && shape.points.length > 0) {
        ctx.beginPath();
        ctx.moveTo(shape.points[0].x, shape.points[0].y);
        shape.points.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.stroke();
      }
    };

    drawShape(currentShape);
    if (tool === "polygon" && polygonPoints.length > 0) {
      drawShape({ type: "polygon", points: polygonPoints });
    }
  }, [currentShape, polygonPoints, tool]);

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handlePointerDown = (e) => {
    const pos = getPos(e);
    if (tool === "polygon") {
      const newPts = [...polygonPoints, pos];
      setPolygonPoints(newPts);
      if (newPts.length >= 3) onDrawComplete({ type: "polygon", points: newPts });
    } else {
      setIsDrawing(true);
      setStartPos(pos);
    }
  };

  const handlePointerMove = (e) => {
    if (!isDrawing || tool === "polygon") return;
    const pos = getPos(e);
    if (tool === "box") {
      setCurrentShape({ type: "box", x: startPos.x, y: startPos.y, w: pos.x - startPos.x, h: pos.y - startPos.y });
    } else if (tool === "circle") {
      setCurrentShape({ type: "circle", x: startPos.x, y: startPos.y, r: Math.hypot(pos.x - startPos.x, pos.y - startPos.y) });
    }
  };

  const handlePointerUp = () => {
    if (tool === "polygon") return;
    setIsDrawing(false);
    if (currentShape) onDrawComplete(currentShape);
  };

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={400}
      style={{ border: "1px solid #ccc", cursor: "crosshair", touchAction: "none", background: "#fafafa", width: "100%" }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    />
  );
}
