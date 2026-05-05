import json
import os
from pathlib import Path

import joblib
import pandas as pd


class DistancePredictor:
    """Wraps the baseline model for inference inside the model service."""

    def __init__(self, artifacts_dir: Path | str) -> None:
        self.artifacts_dir = Path(artifacts_dir)
        self.model_path = self.artifacts_dir / "distance_baseline.joblib"
        self.model = None
        self.model_card = None
        self._load_model()

    def _load_model(self) -> None:
        if not self.model_path.exists():
            print(f"Warning: Model not found at {self.model_path}")
            return

        self.model = joblib.load(self.model_path)

        card_path = self.artifacts_dir / "model_card.json"
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
        if not self.model:
            raise RuntimeError("Model not loaded")

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

        prediction = self.model.predict(features)[0]

        try:
            preprocessor = self.model.named_steps["preprocessor"]
            regressor = self.model.named_steps["regressor"]
            
            X_transformed = preprocessor.transform(features)
            tree_predictions = [tree.predict(X_transformed)[0] for tree in regressor.estimators_]
            variance = sum((p - prediction) ** 2 for p in tree_predictions) / len(tree_predictions)
            
            confidence = max(0.0, min(1.0, 1.0 - (variance / 500.0)))
        except Exception:
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
        if not self.model_card:
            return {"status": "model_not_loaded"}
        return {
            "model_name": self.model_card.get("model_name"),
            "model_version": self.model_card.get("model_version"),
            "framework": "scikit-learn",
        }


# Global predictor instance
# For local dev, fallback to parent directory's ml/artifacts if nothing specified
_default_artifacts = os.getenv("MODEL_ARTIFACTS_DIR", str(Path(__file__).parent.parent.parent.parent / "ml" / "artifacts"))
predictor = DistancePredictor(_default_artifacts)
