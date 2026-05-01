from __future__ import annotations

from datetime import datetime, timezone
import os
import sqlite3
from pathlib import Path

from app.schemas import DatasetIngestPayload


DATABASE_PATH = os.getenv("DATABASE_PATH", "./data/dataset_service.db")


def _connect() -> sqlite3.Connection:
    db_path = Path(DATABASE_PATH)
    db_path.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(db_path)
    connection.row_factory = sqlite3.Row
    return connection


def _ensure_table(connection: sqlite3.Connection) -> None:
    connection.execute(
        """
        CREATE TABLE IF NOT EXISTS ingest_jobs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            source TEXT NOT NULL,
            analysis_mode TEXT,
            target_object_type TEXT,
            dataset_name TEXT NOT NULL,
            version TEXT NOT NULL,
            records INTEGER NOT NULL,
            notes TEXT,
            ingested_at TEXT NOT NULL
        )
        """
    )
    connection.commit()


def add_ingest_job(payload: DatasetIngestPayload) -> dict:
    ingested_at = datetime.now(timezone.utc).isoformat()
    with _connect() as connection:
        _ensure_table(connection)
        cursor = connection.execute(
            """
            INSERT INTO ingest_jobs (
                source,
                analysis_mode,
                target_object_type,
                dataset_name,
                version,
                records,
                notes,
                ingested_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                payload.source,
                payload.analysis_mode,
                payload.target_object_type,
                payload.dataset_name,
                payload.version,
                payload.records,
                payload.notes,
                ingested_at,
            ),
        )
        connection.commit()
        job_id = f"ingest-{cursor.lastrowid}"

    return {"message": "ingest accepted", "job_id": job_id}


def list_ingest_jobs() -> dict:
    with _connect() as connection:
        _ensure_table(connection)
        rows = connection.execute(
            """
            SELECT id, source, analysis_mode, target_object_type, dataset_name, version, records, notes, ingested_at
            FROM ingest_jobs
            ORDER BY id DESC
            """
        ).fetchall()

    items = []
    for row in rows:
        items.append(
            {
                "job_id": f"ingest-{row['id']}",
                "source": row["source"],
                "analysis_mode": row["analysis_mode"],
                "target_object_type": row["target_object_type"],
                "dataset_name": row["dataset_name"],
                "version": row["version"],
                "records": row["records"],
                "notes": row["notes"],
                "ingested_at": row["ingested_at"],
            }
        )

    return {"total": len(items), "items": items}
