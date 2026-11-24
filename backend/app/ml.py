import numpy as np

class PredictiveToolLifeModel:
    """
    Industrial Tool Life Degradation & Remaining Useful Life (RUL) Model.
    All outputs are labelled as SIMULATED for Hackathon demonstration.
    """
    def __init__(self):
        self.metrics = {"mae": 8.4, "rmse": 11.2, "r2": 0.891}
        self.feature_importance = [
            {"name": "Tool Wear", "value": 28.4},
            {"name": "Operating Time", "value": 22.1},
            {"name": "Cutting Temp", "value": 16.8},
            {"name": "Vibration", "value": 12.5},
            {"name": "Cutting Force", "value": 9.3},
            {"name": "Feed Rate", "value": 5.7},
            {"name": "Spindle Speed", "value": 3.2},
            {"name": "Power Consumption", "value": 2.0},
        ]

    def predict(self, params: dict) -> dict:
        wear = float(params.get("toolWear", params.get("tool_wear", 20)))
        time_hours = float(params.get("operatingTime", params.get("operating_time", 48)))
        temp = float(params.get("cuttingTemp", params.get("cutting_temp", 70)))
        vibration = float(params.get("vibration", 0.4))
        spindle_rpm = float(params.get("spindleSpeed", params.get("spindle_speed", 4500)))

        # Multi-factor empirical degradation calculation
        temp_factor = min(temp / 150.0, 1.0)
        vib_factor = min(vibration / 1.0, 1.0)
        speed_factor = min(spindle_rpm / 10000.0, 1.0)
        time_factor = min(time_hours / 300.0, 1.0)

        degradation = (
            wear * 0.40 +
            time_factor * 100 * 0.30 +
            temp_factor * 100 * 0.15 +
            vib_factor * 100 * 0.10 +
            speed_factor * 100 * 0.05
        ) / 100.0

        rul = max(5, round(280 * (1.0 - min(degradation, 0.95))))
        health = max(5, round(100.0 - (wear * 0.90) - (time_factor * 20.0)))
        fail_prob = min(98, round((wear * 0.75) + (vib_factor * 20.0) + (temp_factor * 15.0)))

        if fail_prob > 70:
            risk = "critical"
        elif fail_prob > 45:
            risk = "high"
        elif fail_prob > 25:
            risk = "medium"
        else:
            risk = "low"

        wear_est = round(wear + (5.0 * degradation), 1)

        return {
            "rul": int(rul),
            "health_percentage": int(health),
            "failure_probability": int(fail_prob),
            "risk_level": risk,
            "wear_estimate": float(wear_est),
            "is_simulated": True,
            "confidence": 0.74,
            "metrics": self.metrics,
        }

model_instance = PredictiveToolLifeModel()
