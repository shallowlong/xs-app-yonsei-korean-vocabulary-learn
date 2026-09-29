#!/usr/bin/env python3
"""Convert open-yonsei-korean-vocabulary JSON data into a single SQLite database.

Usage:
    python scripts/build-db.py [--data ../open-yonsei-korean-vocabulary/data/json] [--output public/data/vocabulary.sqlite]

The generated database contains:
  - volumes  : per-volume metadata (accent color, units per chapter, row count)
  - chapters : per-chapter trilingual titles (ko/zh/en)
  - entries  : the 4,445 vocabulary records

Source data is published under CC BY-SA 3.0 by the Open Yonsei Korean Vocabulary
contributors. Any redistribution of this database must keep the CC BY-SA 3.0
notice and attribution (see README.md and SOURCES.md).
"""

from __future__ import annotations

import argparse
import json
import sqlite3
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_DATA = PROJECT_ROOT / "../open-yonsei-korean-vocabulary/data/json"
DEFAULT_OUTPUT = PROJECT_ROOT / "public/data/vocabulary.sqlite"

ENTRY_FIELDS = [
    "entry_id", "volume", "chapter", "unit", "sequence", "source_order",
    "korean", "chinese", "english", "entry_kind", "pos", "pos_zh",
    "origin_type", "origin_detail", "pronunciation", "dictionary_source",
    "dictionary_candidate_count", "match_method", "english_method",
    "match_confidence", "review_status", "revision_note",
]


def build_db(data_dir: Path, output: Path) -> None:
    conn = sqlite3.connect(output)
    cur = conn.cursor()

    cur.executescript(
        """
        PRAGMA journal_mode=MEMORY;

        CREATE TABLE volumes (
            volume INTEGER PRIMARY KEY,
            units_per_chapter INTEGER NOT NULL,
            accent TEXT NOT NULL,
            row_count INTEGER NOT NULL,
            custom_wordbook INTEGER NOT NULL DEFAULT 0,
            title TEXT
        );

        CREATE TABLE chapters (
            volume INTEGER NOT NULL,
            chapter INTEGER NOT NULL,
            ko TEXT NOT NULL,
            zh TEXT NOT NULL,
            en TEXT NOT NULL,
            PRIMARY KEY (volume, chapter)
        );

        CREATE TABLE entries (
            entry_id TEXT PRIMARY KEY,
            volume INTEGER NOT NULL,
            chapter INTEGER NOT NULL,
            unit INTEGER NOT NULL,
            sequence INTEGER NOT NULL,
            source_order INTEGER NOT NULL,
            korean TEXT NOT NULL,
            chinese TEXT NOT NULL,
            english TEXT NOT NULL,
            entry_kind TEXT NOT NULL,
            pos TEXT,
            pos_zh TEXT,
            origin_type TEXT NOT NULL,
            origin_detail TEXT,
            pronunciation TEXT,
            dictionary_source TEXT,
            dictionary_candidate_count INTEGER NOT NULL DEFAULT 0,
            match_method TEXT,
            english_method TEXT,
            match_confidence REAL NOT NULL DEFAULT 0,
            review_status TEXT NOT NULL,
            revision_note TEXT
        );

        CREATE INDEX idx_entries_vol_chap ON entries (volume, chapter, unit, sequence);
        CREATE INDEX idx_entries_chap ON entries (chapter);
        """
    )

    volume_files = sorted(data_dir.glob("vol-*.json"))
    if not volume_files:
        raise SystemExit(f"No vol-*.json found under {data_dir}")

    total = 0
    for path in volume_files:
        payload = json.loads(path.read_text(encoding="utf-8"))
        meta = payload["metadata"]
        volume = int(meta["volume"])
        rows = payload["rows"]

        cur.execute(
            "INSERT INTO volumes VALUES (?,?,?,?,?,?)",
            (
                volume,
                int(meta["units_per_chapter"]),
                meta["accent"],
                len(rows),
                1 if meta.get("custom_wordbook") else 0,
                meta.get("title"),
            ),
        )
        for chapter in meta.get("chapters", []):
            cur.execute(
                "INSERT INTO chapters (volume, chapter, ko, zh, en) VALUES (?,?,?,?,?)",
                (
                    volume,
                    int(chapter["chapter"]),
                    chapter["ko"],
                    chapter["zh"],
                    chapter["en"],
                ),
            )

        for row in rows:
            cur.execute(
                f"""
                INSERT INTO entries ({",".join(ENTRY_FIELDS)})
                VALUES ({",".join("?" for _ in ENTRY_FIELDS)})
                """,
                [row.get(field, "" if field != "dictionary_candidate_count" else 0)
                 for field in ENTRY_FIELDS],
            )
        total += len(rows)

    conn.commit()
    cur.execute("ANALYZE")
    conn.commit()
    conn.close()

    print(f"OK: {total} entries from {len(volume_files)} volumes -> {output}")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--data", type=Path, default=DEFAULT_DATA)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    args = parser.parse_args()
    args.output.parent.mkdir(parents=True, exist_ok=True)
    if args.output.exists():
        args.output.unlink()
    build_db(args.data.resolve(), args.output)


if __name__ == "__main__":
    main()
