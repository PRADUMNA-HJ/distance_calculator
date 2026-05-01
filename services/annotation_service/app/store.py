from __future__ import annotations

from datetime import datetime, timezone
import json
import os
import sqlite3
from pathlib import Path

from app.schemas import AnnotationPayload


DATABASE_PATH = os.getenv("DATABASE_PATH", "./data/annotation_service.db")


def _connect() -> sqlite3.Connection:
    db_path = Path(DATABASE_PATH)
    db_path.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(db_path)
    connection.row_factory = sqlite3.Row
    return connection


def _ensure_table(connection: sqlite3.Connection) -> None:
    connection.execute(
        """
        CREATE TABLE IF NOT EXISTS annotations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            image_id TEXT NOT NULL,
            image_uri TEXT NOT NULL,
            mark_type TEXT NOT NULL,
            analysis_mode TEXT,
            target_object_type TEXT,
            true_distance_cm REAL NOT NULL,
            source TEXT NOT NULL,
            box_json TEXT,
            polygon_json TEXT,
            created_at TEXT NOT NULL
        )
        """
    )
    connection.commit()


def add_annotation(payload: AnnotationPayload) -> dict:
    created_at = datetime.now(timezone.utc).isoformat()
    with _connect() as connection:
        _ensure_table(connection)
        connection.execute(
            """
            INSERT INTO annotations (
                image_id,
                image_uri,
                mark_type,
                analysis_mode,
                target_object_type,
                true_distance_cm,
                source,
                box_json,
                polygon_json,
                created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                payload.image_id,
                payload.image_uri,
                payload.mark_type,
                payload.analysis_mode,
                payload.target_object_type,
                payload.true_distance_cm,
                payload.source,
                json.dumps(payload.box) if payload.box is not None else None,
                json.dumps(payload.polygon) if payload.polygon is not None else None,
                created_at,
            ),
        )
        connection.commit()

        total = connection.execute("SELECT COUNT(*) AS total FROM annotations").fetchone()["total"]

    return {"message": "stored", "count": int(total), "image_id": payload.image_id}


def get_annotations(limit: int = 20) -> dict:
    safe_limit = max(1, min(limit, 200))
    with _connect() as connection:
        _ensure_table(connection)
        rows = connection.execute(
            """
            SELECT image_id, image_uri, mark_type, analysis_mode, target_object_type, true_distance_cm, source, box_json, polygon_json, created_at
            FROM annotations
            ORDER BY id DESC
            LIMIT ?
            """,
            (safe_limit,),
        ).fetchall()
        total = connection.execute("SELECT COUNT(*) AS total FROM annotations").fetchone()["total"]

    items = []
    for row in rows:
        items.append(
            {
                "image_id": row["image_id"],
                "image_uri": row["image_uri"],
                "mark_type": row["mark_type"],
                "analysis_mode": row["analysis_mode"],
                "target_object_type": row["target_object_type"],
                "true_distance_cm": row["true_distance_cm"],
                "source": row["source"],
                "box": json.loads(row["box_json"]) if row["box_json"] else None,
                "polygon": json.loads(row["polygon_json"]) if row["polygon_json"] else None,
                "created_at": row["created_at"],
            }
        )

    return {"total": int(total), "items": items}
