const API_BASE_URL = "http://localhost:8000/api/v1";

export const api = {
  saveAnnotation: async (payload) => {
    const res = await fetch(`${API_BASE_URL}/annotations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Save failed");
    return res.json();
  },
  predictDistance: async (payload) => {
    const res = await fetch(`${API_BASE_URL}/predict-distance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Prediction failed");
    return res.json();
  }
};
