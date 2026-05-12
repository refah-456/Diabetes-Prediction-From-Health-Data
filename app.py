
from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd

app = Flask(__name__)
CORS(app)

pipeline_path = "diabetes_pipeline.joblib"
model = joblib.load(pipeline_path)

@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "Diabetes Prediction API running"})

@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()
    df = pd.DataFrame([data])

    prediction = model.predict(df)
    probabilities = model.predict_proba(df)[0]

    return jsonify({
        "prediction_label": "Diabetic" if prediction[0] == 1 else "Non-Diabetic",
        "confidence_scores": {
            "Non-Diabetic": float(probabilities[0]),
            "Diabetic": float(probabilities[1])
        }
    })

if __name__ == "__main__":
    app.run(debug=True)
