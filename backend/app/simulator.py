
"""
PS-025 Virtual ESP32 Sensor Simulator

IMPORTANT:
This module generates software-simulated sensor readings.
It does NOT connect to real ESP32 hardware or CNC machines.
"""

import random
from datetime import datetime, timezone


def generate_sensor_reading():
    """Generate one set of simulated CNC sensor readings."""

    reading = {
        "device": "VIRTUAL-ESP32-01",
        "mode": "SIMULATED",
        "connected": True,
        "timestamp": datetime.now(timezone.utc).isoformat(),

        "toolWear": round(random.uniform(5, 35), 2),
        "operatingTime": round(random.uniform(10, 120), 2),
        "cuttingTemp": round(random.uniform(55, 95), 2),
        "vibration": round(random.uniform(0.15, 0.65), 3),
        "cuttingForce": round(random.uniform(1200, 2200), 2),
        "feedRate": round(random.uniform(700, 1000), 2),
        "spindleSpeed": round(random.uniform(3500, 5000), 2),
        "powerConsumption": round(random.uniform(10, 18), 2),
    }

    return reading
