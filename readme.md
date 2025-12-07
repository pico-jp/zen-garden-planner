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
- `static/assets/` — optional local-only storage for image assets (e.g., rock or logo files) you do not want to commit; pair with the environment variables below.
- `static/rock.png` — optional transparent PNG used as the garden rock (not committed to avoid binary attachment warnings). If absent, the p5 sketch renders a placeholder shape instead.

## Local images (rock and karesansui logo)
The app loads images from local paths so you can keep the binaries outside the repository.

* Rock: download your preferred rock image (including the one you shared) somewhere on your machine and set `ROCK_IMAGE_PATH` before running the app. Binaries are not committed to this repo, so you need to point the app at your local file.
  ```bash
  export ROCK_IMAGE_PATH="/Users/masahikon/work/251206_zen/rock.png"
  python app.py
  ```
  If present, the browser loads it from the `/rock-image` endpoint; otherwise, the app falls back to an embedded base64 rock asset so you still see a stone in the preview without checking binaries into git. You can also provide a base64 string directly via `ROCK_IMAGE_BASE64` (omit the `data:` prefix):
  ```bash
  export ROCK_IMAGE_BASE64="<base64-string>"
  python app.py
  ```

* Karesansui logo: set `KARESANSUI_IMAGE_PATH` before running the app.
  ```bash
  export KARESANSUI_IMAGE_PATH="/Users/masahikon/work/251206_zen/karesansui.png"
  python app.py
  ```
  When available, the right preview header will display the logo beneath the title using the `/karesansui-image` endpoint.

You can also drop images into `static/assets/` and point the environment variables at those files if you prefer keeping assets next to the project without committing binaries.

