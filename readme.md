# Zen Garden Planner

A minimal Flask + p5.js demo for visualizing Zen garden plans with interactive rake patterns and rocks.

## Prerequisites
- Python 3.9+
- `pip` for installing dependencies

## Setup and Run
1. (Optional) Create and activate a virtual environment.
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\\Scripts\\activate
   ```
2. Install dependencies from `requirements.txt`.
   ```bash
   pip install -r requirements.txt
   ```
3. Start the development server from the project root.
   ```bash
   python app.py
   ```
4. Open the app in your browser at `http://127.0.0.1:5000/` to use the planner UI.

## Project Structure
- `app.py` — Flask app with simple in-memory plan storage and API endpoints.
- `templates/index.html` — UI layout, buttons for adding steps, and plan save/load hooks.
- `static/sketch.js` — p5.js sketch that renders sand shading and applies rake patterns from the plan.
- `static/assets/` — optional local-only storage for image assets (e.g., rock or logo files) you do not want to commit; pair with the environment variables below or update the bundled base64 text sources.
- `static/rock.png` — optional transparent PNG used as the garden rock (not committed to avoid binary attachment warnings). If absent, the p5 sketch renders a placeholder shape instead.

## Local images (rock and karesansui logo)
The app loads images from local paths or committed base64 text files so you can keep binaries out of the repository.

* Rock: download your preferred rock image (including the one you shared) somewhere on your machine and set `ROCK_IMAGE_PATH` before running the app. Binaries are not committed to this repo, so you need to point the app at your local file.
  ```bash
  export ROCK_IMAGE_PATH="/Users/masahikon/work/251206_zen/rock.png"
  python app.py
  ```
  If present, the browser loads it from the `/rock-image` endpoint; otherwise, the app falls back to the bundled base64 rock asset (`static/assets/rock_base64.txt`) so you still see a stone in the preview without checking binaries into git. You can also provide a base64 string directly via `ROCK_IMAGE_BASE64` (omit the `data:` prefix):
  ```bash
  export ROCK_IMAGE_BASE64="<base64-string>"
  python app.py
  ```
  Another zero-config option is to drop your base64 string into `static/assets/rock_base64.txt`; the server will read that file automatically if `ROCK_IMAGE_PATH` and `ROCK_IMAGE_BASE64` are unset. The committed file is expected to hold the latest shared base64 rock; update it locally if you prefer a different stone.

* Karesansui logo: served from the committed base64 payload at `static/assets/karesansui_base64.txt`. Update that file locally to swap the logo without shipping binaries. You may also override the payload via `KARESANSUI_IMAGE_BASE64` (with or without a `data:image/png;base64,` prefix) to test alternate logos without editing the file. The `/karesansui-image` endpoint reads whichever payload is available and displays it beneath the preview title.

You can also drop images into `static/assets/` and point the environment variables at those files for the rock if you prefer keeping assets next to the project without committing binaries.

