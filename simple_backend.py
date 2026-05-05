from fastapi import FastAPI
from pydantic import BaseModel
import math

app = FastAPI(title="Simple Distance Backend")

# 1. In-memory storage for our annotations
annotations_db = []

# --- Data Models (defines the expected JSON structure) ---

class Point(BaseModel):
    x: float
    y: float

class AnnotationPayload(BaseModel):
    image_name: str
    shape_type: str  # e.g., "box", "circle", "polygon"
    points: list[Point]

class DistancePayload(BaseModel):
    point1: Point
    point2: Point

# --- API Endpoints ---

@app.post("/api/v1/annotations")
def save_annotation(payload: AnnotationPayload):
    """
    Saves the incoming annotation data to our in-memory list.
    """
    # Convert the payload to a dictionary and store it
    annotations_db.append(payload.model_dump())
    
    return {
        "message": "Annotation saved successfully!",
        "total_saved_so_far": len(annotations_db),
        "saved_data": payload
    }

@app.post("/api/v1/predict-distance")
def predict_distance(payload: DistancePayload):
    """
    Calculates the straight-line (Euclidean) distance between two points.
    Formula: sqrt((x2 - x1)^2 + (y2 - y1)^2)
    """
    p1 = payload.point1
    p2 = payload.point2
    
    # Calculate distance
    distance = math.sqrt((p2.x - p1.x)**2 + (p2.y - p1.y)**2)
    
    return {
        "message": "Distance calculated successfully!",
        "distance_pixels": round(distance, 2)
    }
