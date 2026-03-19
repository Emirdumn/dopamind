"""
ADHD ML Predictor - Loads trained models and runs predictions.
Singleton pattern to load models only once at startup.
"""
import os
import numpy as np
import pandas as pd
import joblib

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MODELS_DIR = os.path.join(BASE_DIR, "ml_models")


class ADHDPredictor:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._loaded = False
        return cls._instance

    def load_models(self):
        if self._loaded:
            return
        self.wids_model = joblib.load(os.path.join(MODELS_DIR, "wids_female_adhd.joblib"))
        self.hyperaktiv_model = joblib.load(os.path.join(MODELS_DIR, "hyperaktiv_adhd.joblib"))
        self._loaded = True

    def predict_child(self, data: dict) -> dict:
        """Predict ADHD for children using WiDS model."""
        self.load_models()
        art = self.wids_model

        df = pd.DataFrame([data])
        feature_cols = art["scaler"].feature_names_in_
        for col in feature_cols:
            if col not in df.columns:
                df[col] = 0
        df = df[feature_cols]
        df[:] = art["scaler"].transform(df)
        df[:] = art["imputer"].transform(df)

        sex_proba = art["model_sex"].predict_proba(df[art["features_sex"]])[:, 1]
        df["sex_proba"] = sex_proba
        for inter in art["interactions"]:
            df[f"I_{inter}"] = df[inter] * df["sex_proba"]

        adhd_proba = float(art["model_adhd"].predict_proba(df[art["features_adhd"]])[:, 1][0])

        return {
            "adhd_probability": round(adhd_proba, 4),
            "adhd_risk": self._risk_level(adhd_proba),
            "sex_probability": round(float(sex_proba[0]), 4),
            "model": "wids_female_adhd",
            "threshold": art["threshold_adhd"],
        }

    def predict_adult(self, data: dict) -> dict:
        """Predict ADHD for adults using HYPERAKTIV model."""
        self.load_models()
        art = self.hyperaktiv_model

        df = pd.DataFrame([data])
        for col in art["features"]:
            if col not in df.columns:
                df[col] = 0
        df = df[art["features"]]
        df[:] = art["imputer"].transform(df)
        df = pd.DataFrame(art["scaler"].transform(df), columns=art["features"])

        adhd_proba = float(art["model_adhd"].predict_proba(df)[:, 1][0])

        return {
            "adhd_probability": round(adhd_proba, 4),
            "adhd_risk": self._risk_level(adhd_proba),
            "model": "hyperaktiv_adhd",
            "threshold": art["threshold_adhd"],
        }

    def _risk_level(self, prob):
        if prob >= 0.70:
            return "high"
        elif prob >= 0.45:
            return "moderate"
        return "low"


predictor = ADHDPredictor()
