# Mobile Labeling Setup (Up to 1000 Photos)

This setup is for collecting and labeling your own mobile photos with true distance values for model training.

## Goal
- Capture up to 1000 photos.
- Label each photo with a consistent `true_distance_cm` value.
- Keep data ready for `ml/validate_training_data.py` and `ml/train_baseline.py`.

## Distance Bands and Target Counts
Use this target split:
- 0 to 20 cm: 200 photos
- 20 to 40 cm: 200 photos
- 40 to 60 cm: 200 photos
- 60 to 80 cm: 200 photos
- 80 to 100 cm: 200 photos

Total: 1000 photos

## Folder Structure
Store photos in one location, for example:
- `data/mobile_images/`

Example file names:
- `img_0001.jpg`
- `img_0002.jpg`
- `img_0003.jpg`

## Labeling Rule (Most Important)
For every photo, set `true_distance_cm` as:
- Distance from camera lens center to the object front-center point.

Keep this same rule for all photos.

## Capture Procedure (Per Photo)
1. Place object at known distance.
2. Measure with tape from camera lens center to object front-center.
3. Take photo.
4. Annotate object with bounding box (or polygon if needed).
5. Add one row to the labeling CSV.

## CSV You Should Fill
Use this template:
- `ml/templates/mobile_labeling_template.csv`

Required columns to fill for each photo:
- `image_id`
- `image_uri`
- `mark_type`
- `box_x`
- `box_y`
- `box_width`
- `box_height`
- `true_distance_cm`
- `source` (always `mobile-camera` for your direct photos)
- `source_quality` (`original` or `compressed`)
- `distance_band`
- `captured_at`
- `device_id`

## Example Row
```csv
img_0001,data/mobile_images/img_0001.jpg,box,120,140,200,180,62.4,mobile-camera,original,60_80_cm,2026-04-26T16:20:00Z,phone_a
```

## Daily Plan (Easy Execution)
If you want to finish in 10 days:
- Capture and label 100 photos per day.
- Keep all 5 distance bands represented each day.

## Before Training
Run validation first:

```powershell
c:/Users/Hp/Desktop/distance_calculator/.venv/Scripts/python.exe ml/validate_training_data.py --data-csv ml/templates/mobile_labeling_template.csv --output-json ml/artifacts/mobile_validation_report.json
```

If validation passes, train:

```powershell
c:/Users/Hp/Desktop/distance_calculator/.venv/Scripts/python.exe ml/train_baseline.py --data-csv ml/templates/mobile_labeling_template.csv --output-dir ml/artifacts
```
