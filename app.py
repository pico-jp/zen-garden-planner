import base64
import io
import os
from typing import Optional, Tuple
from flask import Flask, abort, jsonify, render_template, request, send_file

app = Flask(__name__)

CURRENT_PLAN = {"steps": []}

ROCK_IMAGE_PATH = os.environ.get(
    "ROCK_IMAGE_PATH", "/Users/masahikon/work/251206_zen/rock.png"
)
KARESANSUI_IMAGE_PATH = os.environ.get(
    "KARESANSUI_IMAGE_PATH", "/Users/masahikon/work/251206_zen/karesansui_in.png"
)
ROCK_IMAGE_BASE64 = os.environ.get("ROCK_IMAGE_BASE64")
ROCK_BASE64_FILE = os.path.join(app.root_path, "static", "assets", "rock_base64.txt")


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/plan", methods=["GET"])
def get_plan():
    return jsonify(CURRENT_PLAN)


@app.route("/api/plan", methods=["POST"])
def update_plan():
    global CURRENT_PLAN
    data = request.get_json(force=True, silent=True) or {}
    if not isinstance(data, dict):
        return jsonify({"status": "error", "message": "Invalid payload"}), 400
    if "steps" not in data or not isinstance(data["steps"], list):
        return jsonify({"status": "error", "message": "Plan must include steps list"}), 400
    CURRENT_PLAN = {"steps": data.get("steps", [])}
    return jsonify({"status": "ok", "plan": CURRENT_PLAN})


def _load_base64_from_file(path: Optional[str]) -> Optional[str]:
    if not path or not os.path.exists(path):
        return None
    try:
        with open(path, "r", encoding="utf-8") as f:
            return f.read().strip()
    except OSError:
        return None


def _decode_base64_payload(payload: Optional[str]) -> Tuple[Optional[io.BytesIO], Optional[str]]:
    """Return (BytesIO, mimetype) for a given base64 payload."""

    if not payload:
        return None, None

    mimetype = "image/png"
    cleaned = payload

    if payload.startswith("data:image"):
        try:
            header, encoded = payload.split(",", 1)
            cleaned = encoded
            if ";" in header:
                mimetype = header.split(":", 1)[1].split(";", 1)[0]
            else:
                mimetype = header.split(":", 1)[1]
        except ValueError:
            return None, None

    try:
        data = base64.b64decode(cleaned)
    except (ValueError, TypeError):
        return None, None

    buffer = io.BytesIO(data)
    buffer.seek(0)
    return buffer, mimetype


@app.route("/rock-image")
def rock_image():
    """Serve a rock image from a local path or built-in/base64 fallback."""

    if ROCK_IMAGE_PATH and os.path.exists(ROCK_IMAGE_PATH):
        return send_file(ROCK_IMAGE_PATH, mimetype="image/png")

    payload = ROCK_IMAGE_BASE64 or _load_base64_from_file(ROCK_BASE64_FILE)
    buffer, mimetype = _decode_base64_payload(payload)
    if buffer and mimetype:
        return send_file(buffer, mimetype=mimetype)

    abort(404)


@app.route("/karesansui-image")
def karesansui_image():
    """Serve a local karesansui logo if available.

    The image path is configured via the KARESANSUI_IMAGE_PATH environment variable.
    Defaults to /Users/masahikon/work/251206_zen/karesansui.png to allow using a
    local asset without committing it to the repository.
    """

    if not KARESANSUI_IMAGE_PATH or not os.path.exists(KARESANSUI_IMAGE_PATH):
        abort(404)

    return send_file(KARESANSUI_IMAGE_PATH, mimetype="image/png")


if __name__ == "__main__":
    app.run(debug=True)
