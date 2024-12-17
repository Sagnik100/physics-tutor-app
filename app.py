from flask import Flask, render_template, request, jsonify
from rdflib import Graph, Namespace, RDF, RDFS
import sqlite3
import os

app = Flask(__name__)

# Load the ontology
ontology_graph = Graph()
ontology_graph.parse("ontology.owl", format="xml")
EX = Namespace("http://example.org/ontology#")

# Initialize database
DB_FILE = "database.db"
if not os.path.exists(DB_FILE):
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE calculations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            calculation_type TEXT,
            input_data TEXT,
            result TEXT
        )
    """)
    conn.commit()
    conn.close()

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/calculate-force", methods=["POST"])
def calculate_force():
    try:
        mass = float(request.json["mass"])
        acceleration = float(request.json["acceleration"])
        force = mass * acceleration

        # Save to database
        save_calculation("Force Calculation", f"Mass={mass}, Acceleration={acceleration}", f"Force={force} N")

        return jsonify({"result": f"{force} N"})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route("/calculate-energy", methods=["POST"])
def calculate_energy():
    try:
        mass = float(request.json["mass"])
        velocity = float(request.json.get("velocity", 0))
        height = float(request.json.get("height", 0))

        kinetic_energy = 0.5 * mass * velocity**2 if velocity else None
        potential_energy = mass * 9.81 * height if height else None

        results = {
            "kineticEnergy": f"{kinetic_energy} J" if kinetic_energy else None,
            "potentialEnergy": f"{potential_energy} J" if potential_energy else None,
        }

        # Save to database
        save_calculation(
            "Energy Calculation",
            f"Mass={mass}, Velocity={velocity}, Height={height}",
            f"Kinetic={results['kineticEnergy']}, Potential={results['potentialEnergy']}"
        )

        return jsonify(results)
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route("/ontology", methods=["GET"])
def fetch_ontology():
    ontology_structure = {}
    for s, p, o in ontology_graph:
        ontology_structure[str(s)] = ontology_structure.get(str(s), []) + [str(o)]
    return jsonify(ontology_structure)

@app.route("/history", methods=["GET"])
def fetch_history():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM calculations")
    rows = cursor.fetchall()
    conn.close()
    return jsonify(rows)

def save_calculation(calculation_type, input_data, result):
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO calculations (calculation_type, input_data, result) VALUES (?, ?, ?)",
        (calculation_type, input_data, result)
    )
    conn.commit()
    conn.close()

if __name__ == "__main__":
    app.run(debug=True)
