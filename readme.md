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
- `static/rock.png` — optional transparent PNG used as the garden rock (not committed to avoid binary attachment warnings). If absent, the p5 sketch renders a placeholder shape instead.

## Rock image from a local path
The app tries to load a rock image from a local path so you can keep the binary outside the repository.

* Set an environment variable `ROCK_IMAGE_PATH` before running the app to point at your local file.
  ```bash
  export ROCK_IMAGE_PATH="/Users/masahikon/work/251206_zen/rock.png"
  python app.py
  ```
* If the file exists, the browser will load it from the `/rock-image` endpoint. If it is missing, the p5 sketch shows a placeholder.

