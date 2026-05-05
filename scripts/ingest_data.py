"""
Data Ingestion Pipeline for distance_calculator.
Implements DATA-001: kaggle + mobile ingestion script.
Downloads (mocks), normalizes, merges, and splits datasets for ML.
"""

from __future__ import annotations

import csv
import json
import random
from datetime import datetime, timezone
from pathlib import Path
import os

# Project root paths
ROOT_DIR = Path(__file__).parent.parent
DATA_DIR = ROOT_DIR / "data"
RAW_DATA_DIR = DATA_DIR / "raw"
PROCESSED_DATA_DIR = DATA_DIR / "processed"

def setup_directories():
    """Ensure data directories exist."""
    RAW_DATA_DIR.mkdir(parents=True, exist_ok=True)
    PROCESSED_DATA_DIR.mkdir(parents=True, exist_ok=True)

def mock_download_kaggle() -> list[dict]:
    """Simulate downloading and parsing a Kaggle dataset (units in meters)."""
    print("Downloading mocked Kaggle dataset...")
    kaggle_data = []
    
    # Generate some kaggle samples
    for i in range(100):
        # Kaggle dataset might use standard types and meters
        distance_m = random.uniform(0.5, 5.0)
        kaggle_data.append({
            "image_id": f"kgl_{i:04d}",
            "image_uri": f"images/kaggle/img_{i:04d}.jpg",
            "mark_type": "box",
            "box_x": random.randint(10, 500),
            "box_y": random.randint(10, 500),
            "box_width": random.randint(50, 300),
            "box_height": random.randint(50, 300),
            "polygon_points_json": "",
            "raw_distance_m": distance_m,  # Raw unit
            "source": "kaggle",
            "analysis_mode": "distance",
            "target_object_type": random.choice(["car", "person", "sign"]),
            "captured_at": datetime.now(timezone.utc).isoformat()
        })
    return kaggle_data

def mock_capture_mobile() -> list[dict]:
    """Simulate mobile dataset with specific short-range ranges (20-100cm)."""
    print("Harvesting mocked Mobile dataset...")
    mobile_data = []
    
    # Generate short-range specific mobile samples
    for i in range(150):
        # Mobile data focuses heavily on 20-100 cm
        distance_cm = random.uniform(20.0, 100.0)
        mobile_data.append({
            "image_id": f"mob_{i:04d}",
            "image_uri": f"images/mobile/img_{i:04d}.jpg",
            "mark_type": "polygon",
            "box_x": "",
            "box_y": "",
            "box_width": "",
            "box_height": "",
            "polygon_points_json": "[{x:10,y:20},{x:30,y:40}]",
            "raw_distance_cm": distance_cm,  # Ready unit
            "source": "mobile-camera",
            "analysis_mode": "distance",
            "target_object_type": random.choice(["box", "table", "chair"]),
            "captured_at": datetime.now(timezone.utc).isoformat()
        })
    return mobile_data

def normalize_and_merge(kaggle_raw: list[dict], mobile_raw: list[dict]) -> list[dict]:
    """Map to our shared schema and convert all distances to cm."""
    print("Normalizing units to cm and mapping to shared schema...")
    merged_data = []
    
    # Process Kaggle (Convert meters to cm)
    for record in kaggle_raw:
        dist_cm = round(record.pop("raw_distance_m") * 100.0, 2)
        record["true_distance_cm"] = dist_cm
        merged_data.append(record)
        
    # Process Mobile (Already in cm)
    for record in mobile_raw:
        dist_cm = round(record.pop("raw_distance_cm"), 2)
        record["true_distance_cm"] = dist_cm
        merged_data.append(record)
        
    return merged_data

def split_and_write(dataset: list[dict]):
    """Split into train/val by source/scene and write outputs."""
    print("Splitting train/val and saving pipeline outputs...")
    random.shuffle(dataset)
    
    split_idx = int(len(dataset) * 0.8)
    train_data = dataset[:split_idx]
    val_data = dataset[split_idx:]
    
    # Output annotations
    annotations_path = PROCESSED_DATA_DIR / "annotations.csv"
    with open(annotations_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=dataset[0].keys())
        writer.writeheader()
        writer.writerows(dataset)
        
    # Output images index
    images_index_path = PROCESSED_DATA_DIR / "images_index.json"
    images = [r["image_uri"] for r in dataset]
    with open(images_index_path, "w") as f:
        json.dump({"total": len(images), "images": images}, f, indent=2)
        
    # Output train/val splits
    splits_path = PROCESSED_DATA_DIR / "splits.json"
    with open(splits_path, "w") as f:
        json.dump({
            "train": [r["image_id"] for r in train_data],
            "val": [r["image_id"] for r in val_data],
            "train_count": len(train_data),
            "val_count": len(val_data)
        }, f, indent=2)
        
    print(f"[OK] Ingestion complete.")
    print(f"  - Total records: {len(dataset)}")
    print(f"  - Train: {len(train_data)} | Val: {len(val_data)}")
    print(f"  - Output folder: {PROCESSED_DATA_DIR}")

def main():
    setup_directories()
    
    kaggle_data = mock_download_kaggle()
    mobile_data = mock_capture_mobile()
    
    merged_dataset = normalize_and_merge(kaggle_data, mobile_data)
    
    split_and_write(merged_dataset)

if __name__ == "__main__":
    main()
