FROM python:3.11-slim

# Non-root user for security
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app

# Model artifacts must live at ml/artifacts inside the image
COPY ml/artifacts ./ml/artifacts

USER appuser

ENV MODEL_ARTIFACTS_DIR=/app/ml/artifacts

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8004", "--workers", "1"]
