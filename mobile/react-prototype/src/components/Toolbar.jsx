export function Toolbar({ tool, setTool, onPredict, onSave }) {
  return (
    <div style={{ display: "flex", gap: "10px", padding: "10px", background: "#f4f4f5", borderRadius: "8px" }}>
      <button onClick={() => setTool("box")} style={{ fontWeight: tool === "box" ? "bold" : "normal" }}>Box</button>
      <button onClick={() => setTool("circle")} style={{ fontWeight: tool === "circle" ? "bold" : "normal" }}>Circle</button>
      <button onClick={() => setTool("polygon")} style={{ fontWeight: tool === "polygon" ? "bold" : "normal" }}>Polygon</button>
      
      <div style={{ flex: 1 }}></div>
      <button onClick={onPredict}>Predict</button>
      <button onClick={onSave}>Save</button>
    </div>
  );
}
