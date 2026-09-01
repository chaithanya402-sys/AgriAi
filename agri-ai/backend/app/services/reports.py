"""Farm report service. Builds a summary from stored data and renders a PDF."""
from typing import Dict, List, Optional
from sqlalchemy.orm import Session

from app.models.analytics import FarmAlert, IrrigationRecommendation, YieldPrediction
from app.models.farm import Farm
from app.models.soil_record import SoilRecord


class ReportService:
    def generate_farm_report(
        self, db: Session, farm_id: int, user_id: int
    ) -> Dict:
        """Gather the farm's stored context and build the report.

        Returns a dict with a 'pdf' key holding PDF bytes (when reportlab is
        available) plus 'summary' and 'pdf_available' flags. Never crashes:
        falls back to returning a plain summary when PDF generation is not
        possible.
        """
        farm = (
            db.query(Farm).filter(Farm.id == farm_id, Farm.user_id == user_id).first()
        )
        if not farm:
            return {"error": "Farm not found", "pdf_available": False}

        soil_records = (
            db.query(SoilRecord)
            .filter(SoilRecord.farm_id == farm_id)
            .order_by(SoilRecord.created_at.desc())
            .all()
        )
        yield_predictions = (
            db.query(YieldPrediction)
            .filter(YieldPrediction.farm_id == farm_id)
            .order_by(YieldPrediction.created_at.desc())
            .all()
        )
        irrigation_recs = (
            db.query(IrrigationRecommendation)
            .filter(IrrigationRecommendation.farm_id == farm_id)
            .order_by(IrrigationRecommendation.created_at.desc())
            .all()
        )
        alerts = (
            db.query(FarmAlert)
            .filter(FarmAlert.farm_id == farm_id)
            .order_by(FarmAlert.created_at.desc())
            .all()
        )

        summary = self._build_summary(
            farm, soil_records, yield_predictions, irrigation_recs, alerts
        )

        try:
            from reportlab.pdfgen import canvas
            pdf_bytes = self._render_pdf(canvas, summary)
            return {
                "pdf": pdf_bytes,
                "summary": summary,
                "pdf_available": True,
                "fallback": False,
            }
        except Exception:
            # reportlab missing or rendering failed - graceful fallback
            return {
                "pdf": None,
                "summary": summary,
                "pdf_available": False,
                "fallback": True,
            }

    def _build_summary(
        self,
        farm: Farm,
        soil_records: List[SoilRecord],
        yield_predictions: List[YieldPrediction],
        irrigation_recs: List[IrrigationRecommendation],
        alerts: List[FarmAlert],
    ) -> Dict:
        latest_soil = soil_records[0] if soil_records else None

        # Soil health trend: movement between oldest and latest score
        soil_trend = "no recorded data yet"
        if latest_soil and len(soil_records) > 1:
            oldest = soil_records[-1]
            if oldest.health_score is not None and latest_soil.health_score is not None:
                delta = latest_soil.health_score - oldest.health_score
                if delta > 0:
                    soil_trend = f"improving (+{delta:.1f} since first record)"
                elif delta < 0:
                    soil_trend = f"declining ({delta:.1f} since first record)"
                else:
                    soil_trend = "stable"

        latest_yield = yield_predictions[0] if yield_predictions else None

        open_alerts = [a for a in alerts if not a.is_read]
        open_by_severity: Dict[str, int] = {}
        for a in open_alerts:
            sev = a.severity or "unknown"
            open_by_severity[sev] = open_by_severity.get(sev, 0) + 1

        return {
            "generated_for_user": farm.user_id,
            "farm": {
                "farm_id": farm.id,
                "name": farm.name,
                "location": farm.location or "no recorded location",
                "area": farm.total_area,
                "area_unit": farm.area_unit or "hectares",
                "soil_type": farm.soil_type,
            },
            "soil_health": {
                "latest_score": latest_soil.health_score if latest_soil else None,
                "grade": latest_soil.grade if latest_soil else None,
                "nitrogen": latest_soil.nitrogen if latest_soil else None,
                "phosphorus": latest_soil.phosphorus if latest_soil else None,
                "potassium": latest_soil.potassium if latest_soil else None,
                "ph": latest_soil.ph if latest_soil else None,
                "organic_carbon": latest_soil.organic_carbon if latest_soil else None,
                "moisture": latest_soil.moisture if latest_soil else None,
                "trend": soil_trend,
                "record_count": len(soil_records),
            },
            "yield": (
                {
                    "crop": latest_yield.crop,
                    "predicted_yield": latest_yield.predicted_yield,
                    "unit": latest_yield.unit,
                    "confidence": latest_yield.confidence,
                    "record_count": len(yield_predictions),
                }
                if latest_yield
                else None
            ),
            "irrigation": (
                {
                    "soil_moisture": irrigation_recs[0].soil_moisture,
                    "recommendation": irrigation_recs[0].recommendation,
                    "amount_mm": irrigation_recs[0].amount_mm,
                    "record_count": len(irrigation_recs),
                }
                if irrigation_recs
                else None
            ),
            "alerts": {
                "total": len(alerts),
                "open": len(open_alerts),
                "open_by_severity": open_by_severity,
            },
        }

    def _render_pdf(self, canvas_mod, summary: Dict) -> bytes:
        from io import BytesIO

        buf = BytesIO()
        c = canvas_mod.Canvas(buf)
        width, height = 595, 842  # A4 portrait points

        c.setTitle("AgriAI Farm Report")
        c.setFont("Helvetica-Bold", 20)
        c.drawString(50, height - 60, "AgriAI Farm Report")

        c.setFont("Helvetica", 10)
        y = height - 90
        c.setFont("Helvetica-Bold", 14)
        c.drawString(50, y, "Farm Details")
        y -= 20
        c.setFont("Helvetica", 10)

        farm = summary["farm"]
        details_lines = [
            f"Farm Name: {farm['name']}",
            f"Location: {farm['location']}",
            "Area: {} {}".format(
                farm["area"] if farm["area"] is not None else "no recorded data",
                farm["area_unit"],
            ),
            "Soil Type: {}".format(farm["soil_type"] or "no recorded data"),
        ]
        for line in details_lines:
            c.drawString(60, y, line)
            y -= 16

        # Soil health section
        y -= 20
        c.setFont("Helvetica-Bold", 14)
        c.drawString(50, y, "Soil Health")
        y -= 20
        c.setFont("Helvetica", 10)
        soil = summary["soil_health"]
        soil_lines = [
            "Health Score: {}".format(
                soil["latest_score"]
                if soil["latest_score"] is not None
                else "no recorded data yet"
            ),
            "Grade: {}".format(soil["grade"] or "no recorded data"),
            "Trend: {}".format(soil["trend"]),
            "Nitrogen: {}".format(
                soil["nitrogen"] if soil["nitrogen"] is not None else "no recorded data"
            ),
            "Phosphorus: {}".format(
                soil["phosphorus"] if soil["phosphorus"] is not None else "no recorded data"
            ),
            "Potassium: {}".format(
                soil["potassium"] if soil["potassium"] is not None else "no recorded data"
            ),
            "pH: {}".format(soil["ph"] if soil["ph"] is not None else "no recorded data"),
            "Organic Carbon: {}".format(
                soil["organic_carbon"]
                if soil["organic_carbon"] is not None
                else "no recorded data"
            ),
            "Moisture: {}".format(
                soil["moisture"] if soil["moisture"] is not None else "no recorded data"
            ),
        ]
        for line in soil_lines:
            c.drawString(60, y, line)
            y -= 14

        # Yield section
        y -= 20
        c.setFont("Helvetica-Bold", 14)
        c.drawString(50, y, "Yield")
        y -= 20
        c.setFont("Helvetica", 10)
        yield_info = summary["yield"]
        if yield_info:
            yield_lines = [
                "Crop: {}".format(yield_info["crop"] or "no recorded data"),
                "Predicted Yield: {} {}".format(
                    yield_info["predicted_yield"]
                    if yield_info["predicted_yield"] is not None
                    else "no recorded data",
                    yield_info["unit"] or "",
                ),
                "Confidence: {}".format(
                    yield_info["confidence"]
                    if yield_info["confidence"] is not None
                    else "no recorded data"
                ),
            ]
            for line in yield_lines:
                c.drawString(60, y, line)
                y -= 14
        else:
            c.drawString(60, y, "No yield predictions recorded yet.")
            y -= 14

        # Alerts section
        y -= 20
        c.setFont("Helvetica-Bold", 14)
        c.drawString(50, y, "Alerts")
        y -= 20
        c.setFont("Helvetica", 10)
        alerts = summary["alerts"]
        if alerts["open"] > 0:
            c.drawString(60, y, "Open alerts: {}".format(alerts["open"]))
            y -= 14
            for sev, count in alerts["open_by_severity"].items():
                c.drawString(70, y, "- {}: {}".format(sev, count))
                y -= 14
        else:
            c.drawString(60, y, "No open alerts. {}".format(
                "{} total alerts recorded.".format(alerts["total"])
                if alerts["total"] else "No alerts recorded."
            ))
            y -= 14

        # Footer disclaimer
        c.setFont("Helvetica-Oblique", 8)
        c.drawString(
            50, 40,
            "Disclaimer: This report is generated from the farm's recorded data "
            "and estimates. It is provided for informational purposes and is not "
            "a substitute for professional agronomic advice.",
        )

        c.showPage()
        c.save()
        return buf.getvalue()
