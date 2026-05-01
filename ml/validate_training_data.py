from __future__ import annotations

import argparse
import json
from dataclasses import dataclass
from pathlib import Path

import pandas as pd


REQUIRED_COLUMNS = {
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
}

OPTIONAL_COLUMNS = {
    "analysis_mode",
    "target_object_type",
}

ALLOWED_SOURCES = {"kaggle", "mobile-camera", "mobile-shared"}
ALLOWED_SOURCE_QUALITY = {"original", "compressed", "blurry", "low-light"}


@dataclass
class ValidationResult:
    rows: int
    errors: list[str]
    warnings: list[str]



def _distance_band(value: float) -> str:
    if value < 20:
        return "0_20_cm"
    if value < 40:
        return "20_40_cm"
    if value < 60:
        return "40_60_cm"
    if value < 80:
        return "60_80_cm"
    if value < 100:
        return "80_100_cm"
    if value < 300:
        return "100_300_cm"
    return "300_plus_cm"



def validate_dataframe(df: pd.DataFrame) -> ValidationResult:
    errors: list[str] = []
    warnings: list[str] = []

    missing_columns = REQUIRED_COLUMNS.difference(df.columns)
    if missing_columns:
        errors.append(f"Missing required columns: {', '.join(sorted(missing_columns))}")
        return ValidationResult(rows=int(len(df)), errors=errors, warnings=warnings)

    if df.empty:
        errors.append("Dataset is empty.")
        return ValidationResult(rows=0, errors=errors, warnings=warnings)

    invalid_distances = df["true_distance_cm"].isna() | (df["true_distance_cm"].astype(float) <= 0)
    if int(invalid_distances.sum()) > 0:
        errors.append(f"Rows with invalid true_distance_cm: {int(invalid_distances.sum())}")

    invalid_box = (
        df["box_width"].astype(float) <= 0
    ) | (
        df["box_height"].astype(float) <= 0
    )
    if int(invalid_box.sum()) > 0:
        errors.append(f"Rows with non-positive box_width/box_height: {int(invalid_box.sum())}")

    bad_source_mask = ~df["source"].fillna("").astype(str).isin(ALLOWED_SOURCES)
    if int(bad_source_mask.sum()) > 0:
        errors.append(f"Rows with unsupported source values: {int(bad_source_mask.sum())}")

    if "source_quality" in df.columns:
        bad_quality_mask = ~df["source_quality"].fillna("").astype(str).isin(ALLOWED_SOURCE_QUALITY)
        if int(bad_quality_mask.sum()) > 0:
            warnings.append(
                f"Rows with unsupported source_quality values: {int(bad_quality_mask.sum())}"
            )

    if "distance_band" in df.columns:
        expected_band = df["true_distance_cm"].astype(float).map(_distance_band)
        mismatch = expected_band != df["distance_band"].fillna("").astype(str)
        if int(mismatch.sum()) > 0:
            warnings.append(f"Rows with distance_band mismatch: {int(mismatch.sum())}")

    source_counts = df["source"].value_counts().to_dict()
    for source_name in ["kaggle", "mobile-camera", "mobile-shared"]:
        if source_counts.get(source_name, 0) == 0:
            warnings.append(f"No rows found for source='{source_name}'.")

    return ValidationResult(rows=int(len(df)), errors=errors, warnings=warnings)



def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Validate ML training intake CSV")
    parser.add_argument(
        "--data-csv",
        required=True,
        help="Path to training data CSV",
    )
    parser.add_argument(
        "--output-json",
        default="",
        help="Optional output JSON path for validation summary",
    )
    return parser.parse_args()



def main() -> None:
    args = parse_args()
    data_path = Path(args.data_csv)
    df = pd.read_csv(data_path)
    result = validate_dataframe(df)

    payload = {
        "rows": result.rows,
        "errors": result.errors,
        "warnings": result.warnings,
        "status": "failed" if result.errors else "passed",
    }

    print(json.dumps(payload, indent=2))

    if args.output_json:
        output_json_path = Path(args.output_json)
        output_json_path.parent.mkdir(parents=True, exist_ok=True)
        output_json_path.write_text(json.dumps(payload, indent=2), encoding="utf-8")

    if result.errors:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
