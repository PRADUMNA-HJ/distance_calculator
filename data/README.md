# Data Directory

## Structure
- kaggle/: external downloaded datasets
- mobile_short_range/: custom camera captures (< 100 cm)
- labels/: CSV or JSON labels

## Important
Raw images are usually large; avoid committing full datasets to Git.
Use this folder as local staging and use cloud/object storage for large files.

## Mobile Capture Protocol (< 100 cm)
1. Measure true distance with measuring tape.
2. Capture image from app.
3. Mark target object.
4. Save annotation with true_distance_cm.
5. Add source=mobile-camera.
