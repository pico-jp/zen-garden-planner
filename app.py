import base64
import io
import os
from flask import Flask, abort, jsonify, render_template, request, send_file

app = Flask(__name__)

CURRENT_PLAN = {"steps": []}

ROCK_IMAGE_PATH = os.environ.get(
    "ROCK_IMAGE_PATH", "/Users/masahikon/work/251206_zen/rock.png"
)
KARESANSUI_IMAGE_PATH = os.environ.get(
    "KARESANSUI_IMAGE_PATH", "/Users/masahikon/work/251206_zen/karesansui.png"
)
ROCK_IMAGE_BASE64 = os.environ.get("ROCK_IMAGE_BASE64")

# Inline SVG fallback (base64) so the app always has a rock asset without
# committing binaries. Replace ROCK_IMAGE_BASE64 or ROCK_IMAGE_PATH to supply a
# custom image (like the provided rock.png) while keeping the repo text-only.
DEFAULT_ROCK_SVG_BASE64 = (
    "PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNTYiIGhlaWdodD0iMjU2Ii"
    "B2aWV3Qm94PSIwIDAgMjU2IDI1NiI+CiAgPGRlZnM+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIw"
    "IiB4Mj0iMSIgeTE9IjAiIHkyPSIxIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI2I3Yjli"
    "NyIvPgogICAgICA8c3RvcCBvZmZzZXQ9IjUwJSIgc3RvcC1jb2xvcj0iI2E0YTZhNCIvPgogICAgICA8c3RvcCBv"
    "ZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiM4YjhmOGMiLz4KICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgPC9kZWZz"
    "PgogIDxyZWN0IHdpZHRoPSIyNTYiIGhlaWdodD0iMjU2IiBmaWxsPSJyZ2JhKDAsMCwwLDApIi8+CiAgPHBhdGgg"
    "ZmlsbD0idXJsKCNnKSIgc3Ryb2tlPSIjNmU2ZjZlIiBzdHJva2Utd2lkdGg9IjMiIGQ9Ik03NiA2MGMyOC0xOCA1"
    "NC0yNiA4Mi04IDE4IDEwIDMwIDIzIDM0IDQwIDQgMTgtMiAzMS02IDQ2LTUgMjAtMjAgMzYtMzggNDYtMTYgMTAt"
    "NDYgMTgtNzQgNi0yMi0xMC00Mi0zOC00Mi02NCAwLTIwIDE2LTQ2IDQ0LTY2eiIvPgogIDxwYXRoIGZpbGw9InJn"
    "YmEoMjU1LDI1NSwyNTUsMC4xNCkiIGQ9Ik0xMDAgNzRjMTItMTAgMzYtMTYgNTYtOCAxOCA3IDMyIDIyIDMyIDM4"
    "IDAgOC00IDEwLTEwIDYtMTItOC0yNC0xNC00Mi0xNC0yMCAwLTM0LTgtNDAtMTYtMi0yIDAtNCA0LTZ6Ii8+Cjwv"
    "c3ZnPgo="
)


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


@app.route("/rock-image")
def rock_image():
    """Serve a rock image from a local path or built-in base64 fallback."""

    if ROCK_IMAGE_PATH and os.path.exists(ROCK_IMAGE_PATH):
        return send_file(ROCK_IMAGE_PATH, mimetype="image/png")

    payload = ROCK_IMAGE_BASE64 or DEFAULT_ROCK_SVG_BASE64
    if payload:
        try:
            data = base64.b64decode(payload.split(",")[-1])
        except (ValueError, TypeError):
            abort(404)
        buffer = io.BytesIO(data)
        buffer.seek(0)
        # Default fallback is an SVG asset.
        return send_file(buffer, mimetype="image/svg+xml")

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
