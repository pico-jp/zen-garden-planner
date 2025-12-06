from flask import Flask, jsonify, render_template, request

app = Flask(__name__)

CURRENT_PLAN = {"steps": []}


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


if __name__ == "__main__":
    app.run(debug=True)
