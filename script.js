console.log("🔥 script.js loaded");

const form = document.getElementById("prediction-form");
const resultDiv = document.getElementById("result-container");
const errorDiv = document.getElementById("error-msg");
const tipsDiv = document.getElementById("health-tips");
const featureBox = document.getElementById("feature-importance");
const btn = form.querySelector("button");

form.addEventListener("submit", function (e) {
    e.preventDefault();

    // 🔄 Loading state
    btn.innerText = "⏳ Predicting...";
    btn.disabled = true;

    const formData = new FormData(form);

    const data = {
        Pregnancies: Number(formData.get("Pregnancies")),
        Glucose: Number(formData.get("Glucose")),
        BloodPressure: Number(formData.get("BloodPressure")),
        SkinThickness: Number(formData.get("SkinThickness")),
        Insulin: Number(formData.get("Insulin")),
        BMI: Number(formData.get("BMI")),
        DiabetesPedigreeFunction: Number(formData.get("DiabetesPedigreeFunction")),
        Age: Number(formData.get("Age"))
    };

    errorDiv.innerHTML = "";
    tipsDiv.innerHTML = "";
    resultDiv.innerHTML = "";
    featureBox.innerHTML = "";

    // ✅ INPUT VALIDATION
    if (data.Glucose < 50 || data.Glucose > 300) {
        showError("⚠️ Glucose must be between 50–300");
        return;
    }

    if (data.BMI < 10 || data.BMI > 60) {
        showError("⚠️ BMI value looks unrealistic");
        return;
    }

    if (data.Age < 1 || data.Age > 120) {
        showError("⚠️ Age must be between 1–120");
        return;
    }

    fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(result => {

        const diabeticPercent = ((result.confidence_scores?.Diabetic) || 0) * 100;

        let riskText = "";
        let riskClass = "";

        if (diabeticPercent < 30) {
            riskText = "🟢 LOW RISK";
            riskClass = "low";
        } else if (diabeticPercent < 70) {
            riskText = "🟡 MEDIUM RISK";
            riskClass = "medium";
        } else {
            riskText = "🔴 HIGH RISK";
            riskClass = "high";
        }

        resultDiv.innerHTML = `
            <h3>Prediction Result</h3>
            <div class="risk-badge ${riskClass}">${riskText}</div>
            <p><b>Outcome:</b> ${result.prediction_label}</p>
            <p>Non-Diabetic: ${(100 - diabeticPercent).toFixed(2)}%</p>
            <p>Diabetic: ${diabeticPercent.toFixed(2)}%</p>
        `;

        // 📊 Feature importance (rule-based)
        const glucoseImpact = Math.min((data.Glucose / 200) * 100, 100);
        const bmiImpact = Math.min((data.BMI / 40) * 100, 100);
        const ageImpact = Math.min((data.Age / 80) * 100, 100);

        featureBox.innerHTML = `
            <h3>📊 Top Risk Factors</h3>

            <div class="feature">
                <span>Glucose Level (${glucoseImpact.toFixed(1)}%)</span>
                <div class="bar">
                    <div class="bar-fill" style="width:${glucoseImpact}%; background:#ff4d4d"></div>
                </div>
            </div>

            <div class="feature">
                <span>BMI (${bmiImpact.toFixed(1)}%)</span>
                <div class="bar">
                    <div class="bar-fill" style="width:${bmiImpact}%; background:#ffa500"></div>
                </div>
            </div>

            <div class="feature">
                <span>Age (${ageImpact.toFixed(1)}%)</span>
                <div class="bar">
                    <div class="bar-fill" style="width:${ageImpact}%; background:#4facfe"></div>
                </div>
            </div>
        `;

        // 💡 Health tips
        if (result.prediction_label === "Diabetic") {
            tipsDiv.innerHTML = `
                <h3>💡 Health Tips</h3>
                <ul>
                    <li>Maintain a balanced diet rich in fiber and low in sugar.</li>
                    <li>Engage in regular physical activity.</li>
                    <li>Monitor blood sugar levels regularly.</li>
                    <li>Consult a healthcare professional.</li>
                </ul>
            `;
        } else {
            tipsDiv.innerHTML = `
                <h3>💡 Health Tips</h3>
                <ul>
                    <li>Continue a healthy lifestyle.</li>
                    <li>Exercise regularly.</li>
                    <li>Avoid excess sugar & junk food.</li>
                    <li>Go for routine health check-ups.</li>
                </ul>
            `;
        }

        // 👇 Smooth scroll to result
        resultDiv.scrollIntoView({ behavior: "smooth" });

        // 🔄 Reset button
        btn.innerText = "🔍 Predict";
        btn.disabled = false;
    })
    .catch(err => {
        console.error(err);
        showError("❌ Error getting prediction");
    });
});

// 🔧 Helper function
function showError(msg) {
    errorDiv.innerHTML = msg;
    btn.innerText = "🔍 Predict";
    btn.disabled = false;
}