from pathlib import Path

MAX_LINES = 300
ROOT = Path(__file__).resolve().parents[1]
TARGETS = [ROOT / "services", ROOT / "backend"]
EXCLUDE_SUFFIXES = {".html", ".js", ".css", ".md", ".yaml", ".yml"}


def should_check(path: Path) -> bool:
    if path.suffix in EXCLUDE_SUFFIXES:
        return False
    return path.suffix in {".py", ".txt"}


def main() -> int:
    violations: list[tuple[Path, int]] = []

    for target in TARGETS:
        if not target.exists():
            continue
        for path in target.rglob("*"):
            if path.is_file() and should_check(path):
                line_count = sum(1 for _ in path.open("r", encoding="utf-8"))
                if line_count > MAX_LINES:
                    violations.append((path, line_count))

    if not violations:
        print("OK: backend file line limits are satisfied")
        return 0

    print(f"FAIL: found {len(violations)} files exceeding {MAX_LINES} lines")
    for path, count in violations:
        print(f"- {path.relative_to(ROOT)}: {count} lines")
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
