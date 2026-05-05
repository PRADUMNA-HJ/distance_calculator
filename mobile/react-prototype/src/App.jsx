import { useState } from "react";
import { Canvas } from "./components/Canvas";
import { Toolbar } from "./components/Toolbar";
import { api } from "./services/api";

export default function App() {
  const [tool, setTool] = useState("box");
  const [annotation, setAnnotation] = useState(null);
  const [status, setStatus] = useState("Ready");

  // Format shape data to match backend API schema
  const buildApiPayload = () => ({
    image_uri: "demo.jpg",
    mark_type: tool,
    box: (tool === "box" || tool === "circle") ? { x: annotation.x, y: annotation.y, width: annotation.w || annotation.r * 2, height: annotation.h || annotation.r * 2 } : null,
    polygon: tool === "polygon" ? annotation.points : null
  });

  const handlePredict = async () => {
    if (!annotation) return setStatus("Draw a shape first!");
    try {
      setStatus("Predicting...");
      const result = await api.predictDistance(buildApiPayload());
      setStatus(`Predicted Distance: ${result.distance_pixels || result.distance_cm} px/cm`);
    } catch (e) {
      setStatus("Error predicting distance.");
    }
  };

  const handleSave = async () => {
    if (!annotation) return setStatus("Draw a shape first!");
    try {
      setStatus("Saving...");
      await api.saveAnnotation({ ...buildApiPayload(), image_id: "img123", source: "react-ui", true_distance_cm: 85 });
      setStatus("Saved successfully!");
    } catch (e) {
      setStatus("Error saving annotation.");
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "20px auto", fontFamily: "sans-serif" }}>
      <Toolbar tool={tool} setTool={setTool} onPredict={handlePredict} onSave={handleSave} />
      <div style={{ marginTop: 20 }}>
        <Canvas tool={tool} onDrawComplete={setAnnotation} />
      </div>
      <p style={{ marginTop: 10, color: "#555" }}>Status: {status}</p>
    </div>
  );
}
