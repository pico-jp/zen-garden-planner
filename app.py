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
    """Serve a local rock image if available.

    The image path is configured via the ROCK_IMAGE_PATH environment variable.
    Defaults to /Users/masahikon/work/251206_zen/rock.png so the caller can
    keep using a local asset without checking it into the repository.
    """

    if not ROCK_IMAGE_PATH or not os.path.exists(ROCK_IMAGE_PATH):
        abort(404)

    return send_file(ROCK_IMAGE_PATH, mimetype="image/png")


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
