from __future__ import annotations

import argparse
import os
import sys
from pathlib import Path


def main() -> None:
    parser = argparse.ArgumentParser(description="Run the Paddy Forecasting API (FastAPI/Uvicorn).")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8000)
    parser.add_argument("--reload", action="store_true")
    args = parser.parse_args()

    # Ensure repo root is on sys.path even if launched from a different CWD.
    repo_root = Path(__file__).resolve().parents[1]
    if str(repo_root) not in sys.path:
        sys.path.insert(0, str(repo_root))

    # Also switch CWD so reload watches the repo (not the caller's directory)
    # and relative paths behave consistently.
    os.chdir(str(repo_root))

    import uvicorn

    uvicorn.run(
        "python_api.api.main:app",
        host=args.host,
        port=args.port,
        reload=args.reload,
        log_level="info",
    )


if __name__ == "__main__":
    main()
