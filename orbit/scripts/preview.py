#!/usr/bin/env python3
"""Serve the built lab on this computer only, and optionally open its browser."""
import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.request import urlopen
import webbrowser

ROOT = Path(__file__).resolve().parent.parent / "dist"
URL = "http://127.0.0.1:8782/"


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--no-browser", action="store_true")
    args = parser.parse_args()
    if not (ROOT / "index.html").is_file():
        raise SystemExit("The built lab is missing. Run npm run build first.")
    try:
        server = ThreadingHTTPServer(
            ("127.0.0.1", 8782), partial(SimpleHTTPRequestHandler, directory=str(ROOT))
        )
    except OSError as error:
        try:
            with urlopen(URL, timeout=2) as response:
                existing = response.read(8192).decode("utf-8", errors="replace")
            if "Orbit Lab" not in existing:
                raise ValueError("Different application on this port")
        except Exception:
            raise SystemExit(f"Cannot start Orbit Lab on port 8782: {error}") from error
        print(f"Orbit Lab is already running: {URL}", flush=True)
        if not args.no_browser:
            webbrowser.open(URL)
        return
    print(f"Orbit Lab is ready: {URL}", flush=True)
    print("Local only. Keep this window open while studying. Press Control-C to stop.", flush=True)
    if not args.no_browser:
        webbrowser.open(URL)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nOrbit Lab stopped.", flush=True)
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
