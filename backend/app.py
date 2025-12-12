# backend/app.py
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from solver import solve_maze_bfs

import os
import pandas as pd

app = Flask(__name__, static_folder="../frontend", static_url_path="/")
CORS(app)  # allow cross-origin requests (safe for demo)

@app.route("/feedback", methods=["POST"])
def feedback():
    data = request.json
    if not data:
        return jsonify({"error": "Missing JSON body"}), 400

    name = data.get("name")
    email = data.get("email")
    problem = data.get("problem")
    suggestion = data.get("suggestion")

    if not name or not email or not problem:
        return jsonify({"error": "Name, email, and problem are required"}), 400

    # Save to Excel
    file_path = os.path.join(os.path.dirname(__file__), "feedback.xlsx")
    new_entry = {
        "Name": [name],
        "Email": [email],
        "Problem": [problem],
        "Suggestion": [suggestion]
    }
    df_new = pd.DataFrame(new_entry)

    if os.path.exists(file_path):
        try:
            df_existing = pd.read_excel(file_path)
            df_combined = pd.concat([df_existing, df_new], ignore_index=True)
            df_combined.to_excel(file_path, index=False)
        except Exception as e:
            return jsonify({"error": f"Failed to update Excel: {str(e)}"}), 500
    else:
        try:
            df_new.to_excel(file_path, index=False)
        except Exception as e:
            return jsonify({"error": f"Failed to create Excel: {str(e)}"}), 500

    return jsonify({"message": "Feedback received"}), 200

@app.route("/solve", methods=["POST"])
def solve():
    data = request.json
    if not data:
        return jsonify({"error": "Missing JSON body"}), 400

    grid = data.get("grid")
    start = data.get("start")
    end = data.get("end")

    if grid is None or start is None or end is None:
        return jsonify({"error": "grid, start, and end required"}), 400

    # validate types
    try:
        # ensure start/end are tuples of ints
        sr, sc = int(start[0]), int(start[1])
        er, ec = int(end[0]), int(end[1])
    except Exception:
        return jsonify({"error": "start and end must be [r,c]"}), 400

    path = solve_maze_bfs(grid, (sr, sc), (er, ec))
    if path is None:
        return jsonify({"path": None, "message": "No path found"})
    else:
        return jsonify({"path": path, "length": len(path)})

# Optional: serve frontend static files from / (for simple fullstack deploy)
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path):
    # serve files from ../frontend
    root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend"))
    if path != "" and os.path.exists(os.path.join(root, path)):
        return send_from_directory(root, path)
    else:
        return send_from_directory(root, "index.html")

if __name__ == "__main__":
    # production: use gunicorn via Dockerfile; this is for local dev
    app.run(host="0.0.0.0", port=5000, debug=True)
