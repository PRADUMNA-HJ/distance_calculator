"""
Baseline inference module for distance estimation.
Loads the trained model and makes predictions.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Optional

import joblib
import pandas as pd


class DistancePredictor:
    """Wraps the baseline model for inference."""

    def __init__(self, model_path: Path | str) -> None:
        """Initialize with trained model artifact."""
        self.model_path = Path(model_path)
        self.model = None
        self.model_card = None
        self._load_model()

    def _load_model(self) -> None:
        """Load model and metadata from disk."""
        if not self.model_path.exists():
            raise FileNotFoundError(f"Model not found: {self.model_path}")

        self.model = joblib.load(self.model_path)

        # Load model card for versioning
        model_dir = self.model_path.parent
        card_path = model_dir / "model_card.json"
        if card_path.exists():
            with open(card_path, "r", encoding="utf-8") as f:
                self.model_card = json.load(f)

    def predict(
        self,
        mark_type: str,
        box_x: float,
        box_y: float,
        box_width: float,
        box_height: float,
    ) -> dict:
        """
        Predict distance from annotation geometry.

        Args:
            mark_type: 'box', 'polygon', 'circle'
            box_x, box_y: top-left corner
            box_width, box_height: dimensions in pixels

        Returns:
            dict with distance_cm, confidence, model_version
        """
        if not self.model:
            raise RuntimeError("Model not loaded")

        # Prepare features (must match training pipeline)
        box_area = box_width * box_height
        box_aspect_ratio = box_width / box_height if box_height > 0 else 0.0

        features = pd.DataFrame({
            "box_x": [box_x],
            "box_y": [box_y],
            "box_width": [box_width],
            "box_height": [box_height],
            "box_area": [box_area],
            "box_aspect_ratio": [box_aspect_ratio],
            "mark_type": [mark_type],
        })

        # Predict using the full pipeline
        prediction = self.model.predict(features)[0]

        # Confidence estimation (based on prediction uncertainty)
        # For RandomForest, use prediction probabilities/variance if available
        # Simple approach: use standard prediction variance
        try:
            # Get all tree predictions and compute variance
            preprocessor = self.model.named_steps["preprocessor"]
            regressor = self.model.named_steps["regressor"]
            
            # Transform features through preprocessor
            X_transformed = preprocessor.transform(features)
            
            # Get predictions from all trees
            tree_predictions = [tree.predict(X_transformed)[0] for tree in regressor.estimators_]
            variance = sum((p - prediction) ** 2 for p in tree_predictions) / len(tree_predictions)
            
            # Convert variance to confidence score (0-1)
            # Lower variance = higher confidence
            confidence = max(0.0, min(1.0, 1.0 - (variance / 500.0)))
        except Exception:
            # Fallback to fixed confidence if variance calculation fails
            confidence = 0.75

        model_version = "unknown"
        if self.model_card:
            model_version = self.model_card.get("model_version", "unknown")

        return {
            "distance_cm": float(prediction),
            "confidence": float(confidence),
            "model_version": model_version,
            "label_position": {
                "x": float(box_x + box_width / 2),
                "y": float(box_y + box_height / 2),
            },
        }

    def get_model_info(self) -> dict:
        """Return model metadata."""
        if not self.model_card:
            return {"status": "model_loaded"}
        return {
            "model_name": self.model_card.get("model_name"),
            "model_version": self.model_card.get("model_version"),
            "train_data_summary": self.model_card.get("train_data_summary"),
            "metrics": self.model_card.get("metrics"),
        }


def load_predictor(artifacts_dir: Path | str = "ml/artifacts") -> DistancePredictor:
    """Load the baseline predictor from artifacts directory."""
    artifacts_dir = Path(artifacts_dir)
    model_path = artifacts_dir / "distance_baseline.joblib"
    return DistancePredictor(model_path)


if __name__ == "__main__":
    # Example usage
    predictor = load_predictor()

    # Test prediction
    result = predictor.predict(
        mark_type="box",
        box_x=120.0,
        box_y=90.0,
        box_width=240.0,
        box_height=180.0,
    )

    print("Prediction result:")
    print(json.dumps(result, indent=2))

    print("\nModel info:")
    print(json.dumps(predictor.get_model_info(), indent=2))
