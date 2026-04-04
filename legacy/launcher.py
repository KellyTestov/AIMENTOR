from __future__ import annotations

import os
import shutil
import sys
import webbrowser
from datetime import datetime
from pathlib import Path

ASSETS = [
    "index.html",
    "styles.css",
    "app.js",
    "MMB-89.png",
    "RB-34.png",
    "premium.jpg",
    "premium_2.jpg",
]


def run_log_path() -> Path:
    temp_dir = Path(os.getenv("TEMP", Path.home()))
    return temp_dir / "AIMentorDemo_run.log"


def write_run_log(message: str) -> None:
    log_file = run_log_path()
    timestamp = datetime.now().isoformat()
    log_file.parent.mkdir(parents=True, exist_ok=True)
    with log_file.open("a", encoding="utf-8") as stream:
        stream.write(f"[{timestamp}] {message}\n")


def bundled_path(relative: str) -> Path:
    base = Path(getattr(sys, "_MEIPASS", Path(__file__).resolve().parent))
    return base / relative


def target_root() -> Path:
    local_app_data = os.getenv("LOCALAPPDATA")
    if local_app_data:
        return Path(local_app_data) / "AIMentorDemo"
    return Path.home() / "AIMentorDemo"


def copy_assets(destination: Path) -> None:
    destination.mkdir(parents=True, exist_ok=True)
    for asset in ASSETS:
        source = bundled_path(asset)
        target = destination / asset
        if not source.exists():
            raise FileNotFoundError(f"Asset not found: {source}")
        shutil.copy2(source, target)
        write_run_log(f"Copied: {source} -> {target}")


def main() -> int:
    write_run_log("Launcher started")
    destination = target_root()
    write_run_log(f"Destination: {destination}")
    copy_assets(destination)
    index_file = (destination / "index.html").resolve()
    write_run_log(f"Opening: {index_file.as_uri()}")
    webbrowser.open(index_file.as_uri(), new=1)
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:  # noqa: BLE001
        desktop = Path.home() / "Desktop"
        log_file = desktop / "AIMentorDemo_error.log"
        log_file.write_text(
            f"[{datetime.now().isoformat()}] {exc!r}\n",
            encoding="utf-8",
        )
        try:
            import ctypes

            ctypes.windll.user32.MessageBoxW(
                0,
                f"Не удалось запустить AI-Ментор.\nЛог: {log_file}",
                "AIMentorDemo",
                0x10,
            )
        except Exception:
            pass
        raise
