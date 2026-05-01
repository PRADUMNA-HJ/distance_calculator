from __future__ import annotations

import argparse
import json
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.dummy import DummyRegressor
from sklearn.ensemble import RandomForestRegressor
from sklearn.impute import SimpleImputer
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder


REQUIRED_COLUMNS = {
    "mark_type",
    "box_x",
    "box_y",
    "box_width",
    "box_height",
    "true_distance_cm",
}

DISTANCE_BANDS = [
    (0.0, 20.0, "0_20_cm"),
    (20.0, 40.0, "20_40_cm"),
    (40.0, 60.0, "40_60_cm"),
    (60.0, 80.0, "60_80_cm"),
    (80.0, 100.0, "80_100_cm"),
    (100.0, 300.0, "100_300_cm"),
]
DISTANCE_BAND_ABOVE = "300_plus_cm"
UNKNOWN_SOURCE = "unknown"


@dataclass
class TrainingArtifacts:
    model_path: Path
    metrics_path: Path
    model_card_path: Path


def _prepare_features(df: pd.DataFrame) -> pd.DataFrame:
    features = df.copy()

    # Derived geometry features help bootstrap baseline quality.
    features["box_area"] = features["box_width"] * features["box_height"]
    features["box_aspect_ratio"] = np.where(
        features["box_height"] > 0,
        features["box_width"] / features["box_height"],
        0.0,
    )
    return features


def _build_model() -> Pipeline:
    numeric_features = [
        "box_x",
        "box_y",
        "box_width",
        "box_height",
        "box_area",
        "box_aspect_ratio",
    ]
    categorical_features = ["mark_type"]

    preprocessor = ColumnTransformer(
        transformers=[
            (
                "num",
                Pipeline(steps=[("imputer", SimpleImputer(strategy="median"))]),
                numeric_features,
            ),
            (
                "cat",
                Pipeline(
                    steps=[
                        ("imputer", SimpleImputer(strategy="most_frequent")),
                        (
                            "onehot",
                            OneHotEncoder(handle_unknown="ignore", sparse_output=False),
                        ),
                    ]
                ),
                categorical_features,
            ),
        ]
    )

    regressor = RandomForestRegressor(
        n_estimators=250,
        max_depth=12,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1,
    )

    return Pipeline(steps=[("preprocessor", preprocessor), ("regressor", regressor)])


def _validate_schema(df: pd.DataFrame) -> None:
    missing = REQUIRED_COLUMNS.difference(df.columns)
    if missing:
        missing_sorted = ", ".join(sorted(missing))
        raise ValueError(f"Dataset missing required columns: {missing_sorted}")


def _safe_r2(y_true: pd.Series, y_pred: np.ndarray) -> float | None:
    if len(y_true) < 2:
        return None
    return float(r2_score(y_true, y_pred))


def _distance_band(distance_cm: float) -> str:
    for start, end, label in DISTANCE_BANDS:
        if start <= distance_cm < end:
            return label
    return DISTANCE_BAND_ABOVE


def _metric_bundle(y_true: pd.Series, y_pred: np.ndarray) -> dict:
    return {
        "rows": int(len(y_true)),
        "mae_cm": float(mean_absolute_error(y_true, y_pred)),
        "rmse_cm": float(np.sqrt(mean_squared_error(y_true, y_pred))),
        "r2": _safe_r2(y_true, y_pred),
    }


def _metrics_by_group(
    y_true: pd.Series,
    y_pred: np.ndarray,
    group_values: pd.Series,
) -> dict[str, dict]:
    metrics: dict[str, dict] = {}
    pred_series = pd.Series(y_pred, index=y_true.index)

    for group_value in sorted([str(v) for v in group_values.dropna().unique()]):
        mask = group_values.astype(str) == group_value
        if int(mask.sum()) == 0:
            continue
        group_true = y_true[mask]
        group_pred = pred_series[mask].to_numpy()
        metrics[group_value] = _metric_bundle(group_true, group_pred)

    return metrics


def train(data_csv: Path, output_dir: Path, model_name: str = "distance_baseline") -> TrainingArtifacts:
    df = pd.read_csv(data_csv)
    _validate_schema(df)

    df = df.dropna(subset=["true_distance_cm"])
    if df.empty:
        raise ValueError("No rows available after filtering missing true_distance_cm")

    features = _prepare_features(df)
    if "source" not in features.columns:
        features["source"] = UNKNOWN_SOURCE
    else:
        features["source"] = features["source"].fillna(UNKNOWN_SOURCE).astype(str)
    features["distance_band"] = features["true_distance_cm"].astype(float).map(_distance_band)

    target = features["true_distance_cm"].astype(float)

    x = features[
        [
            "mark_type",
            "box_x",
            "box_y",
            "box_width",
            "box_height",
            "box_area",
            "box_aspect_ratio",
        ]
    ]

    if len(x) >= 10:
        train_idx, val_idx = train_test_split(
            x.index,
            test_size=0.2,
            random_state=42,
        )

        x_train, x_val = x.loc[train_idx], x.loc[val_idx]
        y_train, y_val = target.loc[train_idx], target.loc[val_idx]
        model = _build_model()
        model.fit(x_train, y_train)
        val_pred = model.predict(x_val)
        eval_meta = features.loc[val_idx, ["source", "distance_band"]].copy()
    else:
        # Fallback keeps pipeline usable while dataset is still very small.
        model = Pipeline(
            steps=[("preprocessor", "passthrough"), ("regressor", DummyRegressor(strategy="mean"))]
        )
        model.fit(x, target)
        x_val, y_val = x, target
        val_pred = model.predict(x_val)
        eval_meta = features.loc[x_val.index, ["source", "distance_band"]].copy()

    overall_metrics = _metric_bundle(y_val, val_pred)
    source_metrics = _metrics_by_group(y_val, val_pred, eval_meta["source"])
    band_metrics = _metrics_by_group(y_val, val_pred, eval_meta["distance_band"])

    created_at = datetime.now(timezone.utc).isoformat()
    model_version = datetime.now(timezone.utc).strftime("%Y.%m.%d.%H%M")

    output_dir.mkdir(parents=True, exist_ok=True)
    model_path = output_dir / f"{model_name}.joblib"
    metrics_path = output_dir / "metrics.json"
    model_card_path = output_dir / "model_card.json"

    joblib.dump(model, model_path)

    metrics = {
        "mae_cm": overall_metrics["mae_cm"],
        "rmse_cm": overall_metrics["rmse_cm"],
        "r2": overall_metrics["r2"],
        "rows": int(len(df)),
        "eval_rows": overall_metrics["rows"],
        "by_source": source_metrics,
        "by_distance_band": band_metrics,
        "created_at": created_at,
    }
    metrics_path.write_text(json.dumps(metrics, indent=2), encoding="utf-8")

    model_card = {
        "model_name": model_name,
        "model_version": model_version,
        "input_format": {
            "schema": "shared/schemas/annotation_schema.csv",
            "required_fields": sorted(list(REQUIRED_COLUMNS)),
        },
        "output_format": {
            "distance_cm": "float",
            "confidence": "float_0_to_1",
            "model_version": "string",
            "label_position": "optional_object",
        },
        "train_data_summary": {
            "rows": int(len(df)),
            "sources": sorted([str(v) for v in df.get("source", pd.Series(dtype=str)).dropna().unique()]),
            "source_counts": {
                str(k): int(v)
                for k, v in features["source"].value_counts(dropna=False).sort_index().items()
            },
            "analysis_mode_counts": {
                str(k): int(v)
                for k, v in df.get("analysis_mode", pd.Series(dtype=str)).fillna("distance").astype(str).value_counts().sort_index().items()
            } if "analysis_mode" in df else {},
            "target_object_type_counts": {
                str(k): int(v)
                for k, v in df.get("target_object_type", pd.Series(dtype=str)).fillna("object").astype(str).value_counts().sort_index().items()
            } if "target_object_type" in df else {},
            "distance_band_counts": {
                str(k): int(v)
                for k, v in features["distance_band"].value_counts(dropna=False).sort_index().items()
            },
            "captured_at_min": str(df.get("captured_at", pd.Series(dtype=str)).min()) if "captured_at" in df else None,
            "captured_at_max": str(df.get("captured_at", pd.Series(dtype=str)).max()) if "captured_at" in df else None,
        },
        "known_limitations": [
            "Baseline model uses only annotation geometry, not image pixels.",
            "Performance is unstable for very small training sets.",
            "Camera-specific calibration drift may affect predictions.",
        ],
        "metrics": metrics,
    }
    model_card_path.write_text(json.dumps(model_card, indent=2), encoding="utf-8")

    return TrainingArtifacts(
        model_path=model_path,
        metrics_path=metrics_path,
        model_card_path=model_card_path,
    )


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Train baseline distance model")
    parser.add_argument(
        "--data-csv",
        default="shared/schemas/annotation_schema.csv",
        help="Path to annotation CSV with true_distance_cm",
    )
    parser.add_argument(
        "--output-dir",
        default="ml/artifacts",
        help="Directory to save model artifacts",
    )
    parser.add_argument(
        "--model-name",
        default="distance_baseline",
        help="Model name used for artifact naming",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    artifacts = train(
        data_csv=Path(args.data_csv),
        output_dir=Path(args.output_dir),
        model_name=args.model_name,
    )

    print(f"Saved model: {artifacts.model_path}")
    print(f"Saved metrics: {artifacts.metrics_path}")
    print(f"Saved model card: {artifacts.model_card_path}")


if __name__ == "__main__":
    main()
