"""
Generate sample training data for baseline model development.
This creates synthetic annotations with varying box dimensions and distances.
"""

from __future__ import annotations

import csv
from datetime import datetime, timedelta, timezone
from pathlib import Path

import numpy as np

# Configuration
NUM_SAMPLES = 150
OUTPUT_CSV = Path(__file__).parent / "sample_training_data.csv"

# Distribution parameters
SOURCES = ["mobile-camera", "kaggle"]
SOURCE_WEIGHTS = [0.7, 0.3]

MARK_TYPES = ["box", "polygon", "circle"]
MARK_WEIGHTS = [0.6, 0.25, 0.15]

OBJECT_TYPES = ["car", "person", "box", "truck", "bicycle"]

# Distance ranges in cm
DISTANCE_RANGES = [
    (5, 25, "0_20_cm"),
    (20, 45, "20_40_cm"),
    (40, 65, "40_60_cm"),
    (60, 85, "60_80_cm"),
    (80, 105, "80_100_cm"),
    (100, 250, "100_300_cm"),
]


def generate_sample_data() -> list[dict]:
    """Generate realistic training samples."""
    samples = []
    rng = np.random.RandomState(42)
    start_date = datetime(2026, 4, 1, tzinfo=timezone.utc)

    for i in range(NUM_SAMPLES):
        # Random distance in cm
        distance_min, distance_max, band = DISTANCE_RANGES[i % len(DISTANCE_RANGES)]
        true_distance = rng.uniform(distance_min, distance_max)

        # Box dimensions (pixels) - correlate with distance
        # Farther objects appear smaller
        scale_factor = 300 / (true_distance + 30)
        box_width = rng.uniform(40, 150) * scale_factor
        box_height = rng.uniform(40, 150) * scale_factor

        # Box position within a typical image (1920x1080)
        box_x = rng.uniform(100, 1920 - box_width - 100)
        box_y = rng.uniform(50, 1080 - box_height - 50)

        # Metadata
        source = rng.choice(SOURCES, p=SOURCE_WEIGHTS)
        mark_type = rng.choice(MARK_TYPES, p=MARK_WEIGHTS)
        target_object_type = rng.choice(OBJECT_TYPES)
        captured_at = start_date + timedelta(
            hours=rng.randint(0, NUM_SAMPLES * 24)
        )

        samples.append({
            "image_id": f"sample_{i:04d}",
            "image_uri": f"samples/{source}/image_{i:04d}.jpg",
            "mark_type": mark_type,
            "box_x": round(box_x, 2),
            "box_y": round(box_y, 2),
            "box_width": round(box_width, 2),
            "box_height": round(box_height, 2),
            "true_distance_cm": round(true_distance, 2),
            "source": source,
            "captured_at": captured_at.isoformat(),
            "analysis_mode": "distance",
            "target_object_type": target_object_type,
        })

    return samples


def main() -> None:
    """Generate and save sample data."""
    print(f"Generating {NUM_SAMPLES} sample training records...")
    samples = generate_sample_data()

    # Write to CSV
    OUTPUT_CSV.parent.mkdir(parents=True, exist_ok=True)

    with open(OUTPUT_CSV, "w", newline="", encoding="utf-8") as f:
        fieldnames = [
            "image_id",
            "image_uri",
            "mark_type",
            "box_x",
            "box_y",
            "box_width",
            "box_height",
            "true_distance_cm",
            "source",
            "captured_at",
            "analysis_mode",
            "target_object_type",
        ]
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(samples)

    print(f"[OK] Sample data saved to: {OUTPUT_CSV}")
    print(f"  - Total records: {len(samples)}")
    print(f"  - Sources: mobile-camera ({int(len(samples) * 0.7)}), kaggle ({int(len(samples) * 0.3)})")
    print(f"  - Mark types: box (60%), polygon (25%), circle (15%)")
    print(f"  - Distance range: 5-250 cm")


if __name__ == "__main__":
    main()
