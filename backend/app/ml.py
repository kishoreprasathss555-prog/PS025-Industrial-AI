from pathlib import Path

import joblib
import numpy as np
import pandas as pd


# Load the trained Random Forest model
MODEL_PATH = Path(__file__).with_name("ps025_tool_life_model.joblib")

if not MODEL_PATH.exists():
    raise FileNotFoundError(
        f"Trained model not found: {MODEL_PATH}"
    )

trained_model = joblib.load(MODEL_PATH)


class PredictiveToolLifeModel:
    """
    PS-025 Tool Life Prediction Model.

    RUL is predicted using a trained Random Forest model.
    Training data is synthetic and results are for demonstration only.
    """

    def __init__(self):
        self.metrics = {
            "mae": 5.82,
            "rmse": 7.32,
            "r2": 0.9719,
        }

        feature_names = [
            "tool_wear",
            "operating_time",
            "cutting_temp",
            "vibration",
            "cutting_force",
            "feed_rate",
            "spindle_speed",
            "power_consumption",
        ]

        friendly_names = [
            "Tool Wear",
            "Operating Time",
            "Cutting Temp",
            "Vibration",
            "Cutting Force",
            "Feed Rate",
            "Spindle Speed",
            "Power Consumption",
        ]

        importance = getattr(
            trained_model, "feature_importances_", None
        )

        if importance is not None:
            self.feature_importance = [
                {
                    "name": name,
                    "value": round(float(value) * 100, 1),
                }
                for name, value in zip(friendly_names, importance)
            ]
        else:
            self.feature_importance = []

    def predict(self, params: dict) -> dict:

        # Read frontend inputs (camelCase and snake_case supported)
        def get_value(camel, snake, default):
            value = params.get(camel, params.get(snake, default))
            return float(default if value is None else value)

        wear = get_value("toolWear", "tool_wear", 20)
        operating_time = get_value(
            "operatingTime", "operating_time", 48
        )
        temp = get_value("cuttingTemp", "cutting_temp", 70)
        vibration = get_value("vibration", "vibration", 0.4)
        cutting_force = get_value(
            "cuttingForce", "cutting_force", 1850
        )
        feed_rate = get_value("feedRate", "feed_rate", 850)
        spindle_speed = get_value(
            "spindleSpeed", "spindle_speed", 4500
        )
        power = get_value(
            "powerConsumption", "power_consumption", 14.2
        )

        # Keep the exact column order used during training
        input_data = pd.DataFrame(
            [[
                wear,
                operating_time,
                temp,
                vibration,
                cutting_force,
                feed_rate,
                spindle_speed,
                power,
            ]],
            columns=[
                "tool_wear",
                "operating_time",
                "cutting_temp",
                "vibration",
                "cutting_force",
                "feed_rate",
                "spindle_speed",
                "power_consumption",
            ],
        )

        # Random Forest predicts Remaining Useful Life
        rul = float(trained_model.predict(input_data)[0])
        rul = int(np.clip(round(rul), 5, 280))

        # Health and failure risk are demo estimates, not ML predictions
        temp_factor = min(max(temp / 150.0, 0.0), 1.0)
        vib_factor = min(max(vibration / 1.0, 0.0), 1.0)
        time_factor = min(max(operating_time / 300.0, 0.0), 1.0)

        health = max(
            5,
            min(100, round(100 - wear * 0.90 - time_factor * 20))
        )

        fail_prob = min(
            98,
            max(0, round(wear * 0.75 + vib_factor * 20 + temp_factor * 15))
        )

        if fail_prob > 70:
            risk = "critical"
        elif fail_prob > 45:
            risk = "high"
        elif fail_prob > 25:
            risk = "medium"
        else:
            risk = "low"

        degradation = max(0, min(1, 1 - rul / 280))
        wear_estimate = round(wear + 5 * degradation, 1)

        return {
            "rul": rul,
            "health_percentage": int(health),
            "failure_probability": int(fail_prob),
            "risk_level": risk,
            "wear_estimate": float(wear_estimate),
            "is_simulated": True,
            "confidence": 0.74,
            "metrics": self.metrics,
        }


model_instance = PredictiveToolLifeModel()