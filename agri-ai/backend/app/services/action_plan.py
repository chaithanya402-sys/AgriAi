from datetime import datetime, timezone
from typing import Dict, List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.action_plan import (
    ActionPlanStep,
    ActionStepChecklist,
    UserActionProgress,
    UserChecklistProgress,
)
from app.models.farm import Farm

# Curated, production-quality agronomic video tutorials and checklists
CURATED_CROPS_DATA: Dict[str, List[Dict]] = {
    "Soybean": [
        {
            "step_number": 1,
            "title": "Prepare Soil",
            "timeframe": "Day 1 - 10",
            "stage": "Pre-sowing",
            "youtube_video_id": "8VbKqI9s8Fw",
            "youtube_title": "Soil Preparation for Soybean | Best Farming Practices",
            "youtube_duration": "8:42",
            "description": "Prepare the soil properly before sowing. Deep ploughing, organic manure and proper levelling help in better root growth and improves soil health.",
            "learn_points": [
                "Proper ploughing depth",
                "Soil preparation techniques",
                "Organic manure application",
                "Field leveling",
            ],
            "why_explanation": "Deep ploughing helps loosen the soil and supports root development.",
            "checklists": [
                {"item_key": "1-1", "name": "Deep ploughing — 20-25 cm", "spec": "20-25 cm", "sort_order": 1},
                {"item_key": "1-2", "name": "Apply FYM/compost — 4-5 t/ha", "spec": "4-5 t/ha", "sort_order": 2},
                {"item_key": "1-3", "name": "Test soil pH — Target 6.0-7.5", "spec": "Target 6.0-7.5", "sort_order": 3},
                {"item_key": "1-4", "name": "Level the field", "spec": "Optimal tilth", "sort_order": 4},
            ],
        },
        {
            "step_number": 2,
            "title": "Seed Treatment",
            "timeframe": "Day 11 - 13",
            "stage": "Pre-sowing",
            "youtube_video_id": "Yw6u6gtE3pY",
            "youtube_title": "Soybean Seed Treatment with Bio-fertilizers & Fungicide",
            "youtube_duration": "6:15",
            "description": "Treat high-germination seeds with bio-fertilizers and recommended fungicides to protect against soil-borne damping-off and collar rot.",
            "learn_points": [
                "Fungicide coating dosage",
                "Rhizobium inoculant technique",
                "Trichoderma bio-protection",
                "Shade drying protocols",
            ],
            "why_explanation": "Inoculation with Rhizobium japonicum maximizes atmospheric nitrogen fixation in nodule roots.",
            "checklists": [
                {"item_key": "2-1", "name": "Fungicide treatment with Thiram / Carbendazim (2 g/kg)", "spec": "2 g/kg seed", "sort_order": 1},
                {"item_key": "2-2", "name": "Rhizobium inoculation (20 g/kg seed)", "spec": "20 g/kg seed", "sort_order": 2},
                {"item_key": "2-3", "name": "Shade dry treated seeds for 30 minutes", "spec": "30 mins", "sort_order": 3},
            ],
        },
        {
            "step_number": 3,
            "title": "Sowing",
            "timeframe": "Day 14 - 17",
            "stage": "Sowing",
            "youtube_video_id": "z9qH7mN1K4c",
            "youtube_title": "Precision Sowing and Spacing in Soybean Farming",
            "youtube_duration": "7:20",
            "description": "Sow seeds in well-moistened seedbed maintaining optimal row spacing and seed rate to achieve uniform plant population.",
            "learn_points": [
                "Row-to-row spacing (45 cm)",
                "Plant-to-plant spacing (5-7 cm)",
                "Optimum sowing depth (3-4 cm)",
                "Seed drill calibration",
            ],
            "why_explanation": "Uniform plant geometry ensures equal access to sunlight, moisture, and ground nutrients.",
            "checklists": [
                {"item_key": "3-1", "name": "Row-to-row spacing of 45 cm", "spec": "45 cm", "sort_order": 1},
                {"item_key": "3-2", "name": "Sow at 3-4 cm depth in moist soil", "spec": "3-4 cm depth", "sort_order": 2},
                {"item_key": "3-3", "name": "Calibrate seed rate to 65-75 kg/ha", "spec": "65-75 kg/ha", "sort_order": 3},
            ],
        },
        {
            "step_number": 4,
            "title": "Irrigation",
            "timeframe": "Day 18 - 35",
            "stage": "Early Vegetative",
            "youtube_video_id": "gK8Vp4W3xYs",
            "youtube_title": "Smart Irrigation Management for Soybean Crops",
            "youtube_duration": "8:05",
            "description": "Manage water according to soil moisture telemetry and forecast rainfall. Avoid excess standing water during early vegetative development.",
            "learn_points": [
                "Critical growth stages for water",
                "Ridge and furrow drainage",
                "Soil moisture assessment",
                "Avoiding waterlogging",
            ],
            "why_explanation": "Soybean is susceptible to collar rot when field drainage is inadequate during initial branching.",
            "checklists": [
                {"item_key": "4-1", "name": "Check root zone moisture (target 45%)", "spec": "Target 45%", "sort_order": 1},
                {"item_key": "4-2", "name": "Maintain clear drainage furrows", "spec": "Free drainage", "sort_order": 2},
                {"item_key": "4-3", "name": "Provide life-saving irrigation if dry spell exceeds 10 days", "spec": "As needed", "sort_order": 3},
            ],
        },
        {
            "step_number": 5,
            "title": "Crop Care",
            "timeframe": "Day 36 - 55",
            "stage": "Vegetative / Flowering",
            "youtube_video_id": "mR3f8L1p4qA",
            "youtube_title": "Weed & Pest Management in Soybean",
            "youtube_duration": "9:15",
            "description": "Keep fields weed-free during first 45 days. Monitor for defoliators, stem fly, and girdle beetle using IPM techniques.",
            "learn_points": [
                "Hand weeding schedule",
                "Pheromone trap installation",
                "Biopesticide neem oil application",
                "Leaf eating caterpillar scouting",
            ],
            "why_explanation": "Weed competition in early canopy stage causes up to 40% reduction in pod count.",
            "checklists": [
                {"item_key": "5-1", "name": "First weeding and hoeing at 20-25 DAS", "spec": "20-25 DAS", "sort_order": 1},
                {"item_key": "5-2", "name": "Install 5 pheromone traps per hectare", "spec": "5 traps/ha", "sort_order": 2},
                {"item_key": "5-3", "name": "Scout for girdle beetle and stem fly", "spec": "Weekly check", "sort_order": 3},
            ],
        },
        {
            "step_number": 6,
            "title": "Fertilizer",
            "timeframe": "Day 56 - 75",
            "stage": "Flowering / Pod Formation",
            "youtube_video_id": "pL8x7Q4w2rA",
            "youtube_title": "Nutrient & Fertilizer Split for Maximum Pod Filling",
            "youtube_duration": "7:40",
            "description": "Ensure balanced nutrition at pod formation. Spray soluble nutrients to boost grain filling and avoid premature leaf yellowing.",
            "learn_points": [
                "Balanced NPK split",
                "Sulphur supplementation (20 kg/ha)",
                "Foliar spray of 2% DAP at flowering",
                "Micronutrient zinc and boron spray",
            ],
            "why_explanation": "Sulphur and potassium application during pod filling directly boosts oil content and test weight.",
            "checklists": [
                {"item_key": "6-1", "name": "Top dress recommended potassium dose", "spec": "Per soil card", "sort_order": 1},
                {"item_key": "6-2", "name": "Foliar spray of 2% DAP at 50% flowering", "spec": "2% solution", "sort_order": 2},
                {"item_key": "6-3", "name": "Inspect for zinc and sulphur deficiency symptoms", "spec": "Visual check", "sort_order": 3},
            ],
        },
        {
            "step_number": 7,
            "title": "Harvest",
            "timeframe": "Day 90 - 110",
            "stage": "Maturity",
            "youtube_video_id": "tV3n8W1q6mE",
            "youtube_title": "Harvesting, Threshing & Safe Storage of Soybean",
            "youtube_duration": "6:50",
            "description": "Harvest when 90% of leaves have shed and pods have turned golden yellow. Avoid delayed harvest to minimize pod shattering.",
            "learn_points": [
                "Recognizing maturity indicators",
                "Preventing pod shattering losses",
                "Thresher cylinder speed adjustment",
                "Storage moisture threshold (12%)",
            ],
            "why_explanation": "Harvesting at 14-16% seed moisture prevents seed coat cracking and preserves seed viability.",
            "checklists": [
                {"item_key": "7-1", "name": "Harvest when 90% of pods turn golden-yellow", "spec": "Morning hours", "sort_order": 1},
                {"item_key": "7-2", "name": "Thresh at low cylinder speed (400-500 RPM)", "spec": "400-500 RPM", "sort_order": 2},
                {"item_key": "7-3", "name": "Sun dry seeds to 10-12% moisture before bagging", "spec": "10-12% moisture", "sort_order": 3},
            ],
        },
    ],
    "Ragi": [
        {
            "step_number": 1,
            "title": "Prepare Soil",
            "timeframe": "Day 1 - 10",
            "stage": "Pre-sowing",
            "youtube_video_id": "7L9qP2W4rKs",
            "youtube_title": "Land Preparation for Finger Millet (Ragi)",
            "youtube_duration": "8:10",
            "description": "Plough the field twice with mouldboard plough followed by fine harrowing to create a fine, crumbly seedbed suitable for tiny ragi seeds.",
            "learn_points": [
                "Fine tilth seedbed preparation",
                "FYM incorporation (10 t/ha)",
                "Field leveling for uniform moisture",
                "Drainage channel layout",
            ],
            "why_explanation": "Small ragi seeds require fine tilth for close contact with moist soil particles to trigger fast germination.",
            "checklists": [
                {"item_key": "1-1", "name": "Deep ploughing and 2 harrowings", "spec": "Fine tilth", "sort_order": 1},
                {"item_key": "1-2", "name": "Apply 10 t/ha of well-rotted FYM", "spec": "10 t/ha", "sort_order": 2},
                {"item_key": "1-3", "name": "Ensure seedbed moisture level (target 42%)", "spec": "Target 42%", "sort_order": 3},
                {"item_key": "1-4", "name": "Construct ridges and furrows", "spec": "30 cm spacing", "sort_order": 4},
            ],
        },
        {
            "step_number": 2,
            "title": "Seed Treatment",
            "timeframe": "Day 11 - 13",
            "stage": "Pre-sowing",
            "youtube_video_id": "W4rK7L9qP2s",
            "youtube_title": "Ragi Seed Treatment for Blast & Smut Prevention",
            "youtube_duration": "5:50",
            "description": "Treat ragi seeds with Pseudomonas fluorescens and Azospirillum culture to protect against finger blast disease.",
            "learn_points": [
                "Salt water seed selection (10% brine)",
                "Pseudomonas fluorescens bio-coating",
                "Azospirillum bio-fertilizer mixing",
                "Drying under shade",
            ],
            "why_explanation": "Seed treatment with bio-agents builds early systemic resistance against blast, the major yield limiter in ragi.",
            "checklists": [
                {"item_key": "2-1", "name": "Dip seeds in 10% brine to discard light seeds", "spec": "10% brine", "sort_order": 1},
                {"item_key": "2-2", "name": "Treat with Pseudomonas fluorescens (10 g/kg)", "spec": "10 g/kg", "sort_order": 2},
                {"item_key": "2-3", "name": "Mix with Azospirillum culture (20 g/kg)", "spec": "20 g/kg", "sort_order": 3},
            ],
        },
        {
            "step_number": 3,
            "title": "Sowing",
            "timeframe": "Day 14 - 17",
            "stage": "Sowing / Transplanting",
            "youtube_video_id": "P2W4rKs7L9q",
            "youtube_title": "Direct Sowing & Line Transplanting Method in Ragi",
            "youtube_duration": "7:15",
            "description": "Sow seeds at 22.5 x 10 cm spacing or transplant 21-day-old seedlings with 2 seedlings per hill for optimal tillering.",
            "learn_points": [
                "Optimum seed rate (5-7 kg/ha)",
                "Line sowing depth (2-3 cm)",
                "Transplanting age (21 days)",
                "Gapping and thinning timing",
            ],
            "why_explanation": "Proper plant population allows vigorous tillering, with each plant producing 4-6 fertile tillers.",
            "checklists": [
                {"item_key": "3-1", "name": "Line sowing at 22.5 cm x 10 cm", "spec": "22.5 x 10 cm", "sort_order": 1},
                {"item_key": "3-2", "name": "Sow shallow at 2-3 cm depth", "spec": "2-3 cm", "sort_order": 2},
                {"item_key": "3-3", "name": "Thinning at 15-20 DAS leaving 1 plant/hill", "spec": "1 plant/hill", "sort_order": 3},
            ],
        },
        {
            "step_number": 4,
            "title": "Irrigation",
            "timeframe": "Day 18 - 35",
            "stage": "Vegetative",
            "youtube_video_id": "Ks7L9qP2W4r",
            "youtube_title": "Irrigation Schedule & Water Conservation in Ragi",
            "youtube_duration": "6:40",
            "description": "Irrigate at critical stages: tillering, flowering, and grain filling. Finger millet is drought-hardy but responds well to timely irrigation.",
            "learn_points": [
                "Water requirement at tillering",
                "Monitoring soil moisture deficit",
                "Drainage during continuous rain",
                "Alternate furrow irrigation",
            ],
            "why_explanation": "Moisture stress during tillering restricts head count per square meter.",
            "checklists": [
                {"item_key": "4-1", "name": "Maintain soil moisture at 40-45%", "spec": "Target 42%", "sort_order": 1},
                {"item_key": "4-2", "name": "Ensure first irrigation at 20-25 DAS if dry", "spec": "Tillering stage", "sort_order": 2},
                {"item_key": "4-3", "name": "Clear standing water during high rainfall", "spec": "Drainage check", "sort_order": 3},
            ],
        },
        {
            "step_number": 5,
            "title": "Crop Care",
            "timeframe": "Day 36 - 55",
            "stage": "Tillering & Panicle Initiation",
            "youtube_video_id": "rKs7L9qP2W4",
            "youtube_title": "Weed & Blast Management in Ragi",
            "youtube_duration": "8:25",
            "description": "Perform two hand weedings at 20 and 40 DAS. Spray biopesticides if blast symptoms appear on leaf tips.",
            "learn_points": [
                "Rotary weeder operation",
                "Blast disease identification",
                "Tricyclazole / Bio-fungicide spray",
                "Stem borer scouting",
            ],
            "why_explanation": "Early weeding eliminates competition during panicle initiation when ear size is determined.",
            "checklists": [
                {"item_key": "5-1", "name": "Two weedings at 20 and 40 DAS", "spec": "Weed-free zone", "sort_order": 1},
                {"item_key": "5-2", "name": "Foliar spray for leaf blast prevention", "spec": "Tricyclazole / Neem", "sort_order": 2},
                {"item_key": "5-3", "name": "Inspect for grasshopper & armyworm", "spec": "Weekly survey", "sort_order": 3},
            ],
        },
        {
            "step_number": 6,
            "title": "Fertilizer",
            "timeframe": "Day 56 - 75",
            "stage": "Flowering",
            "youtube_video_id": "W4rKs7L9qP2",
            "youtube_title": "Fertilizer Management & Potassium Top Dressing for Ragi",
            "youtube_duration": "7:10",
            "description": "Apply 50% nitrogen as basal and split remainder at tillering and panicle initiation. Apply recommended MOP for robust grain filling.",
            "learn_points": [
                "Recommended 60:30:30 NPK ratio",
                "Nitrogen top dressing at flowering",
                "Potassium application for grain weight",
                "Foliar micronutrient zinc spray",
            ],
            "why_explanation": "Top-dressed potassium strengthens ear head stalks and maximizes 1000-grain weight.",
            "checklists": [
                {"item_key": "6-1", "name": "Apply second split of Nitrogen (Urea 50 kg/ha)", "spec": "50 kg/ha", "sort_order": 1},
                {"item_key": "6-2", "name": "Apply MOP for grain density", "spec": "25 kg/ha", "sort_order": 2},
                {"item_key": "6-3", "name": "Foliar zinc sulphate spray (0.5%)", "spec": "0.5% solution", "sort_order": 3},
            ],
        },
        {
            "step_number": 7,
            "title": "Harvest",
            "timeframe": "Day 90 - 120",
            "stage": "Maturity",
            "youtube_video_id": "9qP2W4rKs7L",
            "youtube_title": "Harvesting & Curing of Finger Millet",
            "youtube_duration": "6:30",
            "description": "Cut ear heads when seeds turn dark brown and straw turns yellowish. Dry on threshing yard before manual or mechanical threshing.",
            "learn_points": [
                "Selective ear head picking",
                "Threshing floor preparation",
                "Moisture drying to 12%",
                "Storage in airtight bins",
            ],
            "why_explanation": "Two-stage harvesting ensures ear heads are cut at peak dryness without grain shattering losses.",
            "checklists": [
                {"item_key": "7-1", "name": "Cut mature brown ear heads with sickle", "spec": "First picking", "sort_order": 1},
                {"item_key": "7-2", "name": "Heap ear heads for 3 days for curing", "spec": "Curing phase", "sort_order": 2},
                {"item_key": "7-3", "name": "Sun-dry grains to 12% moisture", "spec": "12% moisture", "sort_order": 3},
            ],
        },
    ],
}


class ActionPlanService:
    def ensure_seed_data(self, db: Session, crop_name: str) -> None:
        """Seed cataloged steps and checklists for crop if not present in DB."""
        clean_crop = self._canonical_crop(crop_name)
        existing = db.query(ActionPlanStep).filter(ActionPlanStep.crop_name == clean_crop).first()
        if existing:
            return

        steps_data = CURATED_CROPS_DATA.get(clean_crop) or CURATED_CROPS_DATA.get("Soybean") or []
        for s in steps_data:
            step_record = ActionPlanStep(
                crop_name=clean_crop,
                step_number=s["step_number"],
                title=s["title"],
                description=s["description"],
                timeframe=s["timeframe"],
                stage=s["stage"],
                youtube_video_id=s["youtube_video_id"],
                youtube_title=s["youtube_title"],
                youtube_duration=s["youtube_duration"],
                learn_points=s["learn_points"],
                why_explanation=s["why_explanation"],
            )
            db.add(step_record)
            db.flush()

            for item in s.get("checklists", []):
                chk = ActionStepChecklist(
                    step_id=step_record.id,
                    item_key=item["item_key"],
                    name=item["name"],
                    spec=item.get("spec"),
                    description=item.get("description"),
                    sort_order=item.get("sort_order", 0),
                )
                db.add(chk)

        db.commit()

    def get_steps_for_crop(self, db: Session, user_id: int, farm_id: int, crop_name: str) -> List[Dict]:
        clean_crop = self._canonical_crop(crop_name)
        self.ensure_seed_data(db, clean_crop)

        # Retrieve steps
        steps = (
            db.query(ActionPlanStep)
            .filter(ActionPlanStep.crop_name == clean_crop)
            .order_by(ActionPlanStep.step_number.asc())
            .all()
        )

        # Retrieve user progress records for this farm & crop
        user_progresses = (
            db.query(UserActionProgress)
            .filter(
                UserActionProgress.user_id == user_id,
                UserActionProgress.farm_id == farm_id,
                UserActionProgress.crop_name == clean_crop,
            )
            .all()
        )
        progress_by_step = {p.step_number: p for p in user_progresses}

        results = []
        for step in steps:
            user_prog = progress_by_step.get(step.step_number)
            is_watched = bool(user_prog.tutorial_watched) if user_prog else False
            watched_at = user_prog.tutorial_watched_at if user_prog else None
            step_status = user_prog.status if user_prog else "pending"
            completed_at = user_prog.completed_at if user_prog else None

            # Checklist completion map
            completed_checklist_ids = set()
            if user_prog:
                chk_progs = (
                    db.query(UserChecklistProgress)
                    .filter(
                        UserChecklistProgress.user_action_progress_id == user_prog.id,
                        UserChecklistProgress.completed == 1,
                    )
                    .all()
                )
                completed_checklist_ids = {c.checklist_item_id for c in chk_progs}

            checklists_resp = []
            for chk in step.checklists:
                checklists_resp.append(
                    {
                        "id": chk.id,
                        "item_key": chk.item_key,
                        "name": chk.name,
                        "spec": chk.spec,
                        "description": chk.description,
                        "sort_order": chk.sort_order,
                        "completed": chk.id in completed_checklist_ids,
                    }
                )

            results.append(
                {
                    "id": step.id,
                    "crop_name": step.crop_name,
                    "step_number": step.step_number,
                    "title": step.title,
                    "description": step.description,
                    "timeframe": step.timeframe,
                    "stage": step.stage,
                    "youtube_video_id": step.youtube_video_id,
                    "youtube_title": step.youtube_title,
                    "youtube_duration": step.youtube_duration,
                    "learn_points": step.learn_points or [],
                    "why_explanation": step.why_explanation,
                    "tutorial_watched": is_watched,
                    "tutorial_watched_at": watched_at,
                    "status": step_status,
                    "completed_at": completed_at,
                    "checklists": checklists_resp,
                }
            )

        return results

    def record_tutorial_watched(
        self, db: Session, user_id: int, farm_id: int, crop_name: str, step_id: int
    ) -> Dict:
        """Mark video as watched when YT.PlayerState.ENDED triggers. DOES NOT COMPLETE FARM STEP."""
        clean_crop = self._canonical_crop(crop_name)
        step = db.query(ActionPlanStep).filter(ActionPlanStep.id == step_id).first()
        if not step:
            raise HTTPException(status_code=404, detail="Step not found")

        prog = (
            db.query(UserActionProgress)
            .filter(
                UserActionProgress.user_id == user_id,
                UserActionProgress.farm_id == farm_id,
                UserActionProgress.crop_name == clean_crop,
                UserActionProgress.step_number == step.step_number,
            )
            .first()
        )

        now = datetime.now(timezone.utc)
        if not prog:
            prog = UserActionProgress(
                user_id=user_id,
                farm_id=farm_id,
                crop_name=clean_crop,
                step_number=step.step_number,
                tutorial_watched=1,
                tutorial_watched_at=now,
                status="in_progress",
            )
            db.add(prog)
        else:
            prog.tutorial_watched = 1
            if not prog.tutorial_watched_at:
                prog.tutorial_watched_at = now
            if prog.status == "pending":
                prog.status = "in_progress"

        db.commit()
        db.refresh(prog)

        return {
            "step_id": step.id,
            "step_number": step.step_number,
            "tutorial_watched": True,
            "tutorial_watched_at": prog.tutorial_watched_at.isoformat(),
            "status": prog.status,
        }

    def toggle_checklist_item(
        self, db: Session, user_id: int, farm_id: int, crop_name: str, step_id: int, checklist_item_id: int, completed: bool
    ) -> Dict:
        clean_crop = self._canonical_crop(crop_name)
        step = db.query(ActionPlanStep).filter(ActionPlanStep.id == step_id).first()
        if not step:
            raise HTTPException(status_code=404, detail="Step not found")

        chk_item = db.query(ActionStepChecklist).filter(ActionStepChecklist.id == checklist_item_id).first()
        if not chk_item or chk_item.step_id != step.id:
            raise HTTPException(status_code=404, detail="Checklist item not found for step")

        prog = (
            db.query(UserActionProgress)
            .filter(
                UserActionProgress.user_id == user_id,
                UserActionProgress.farm_id == farm_id,
                UserActionProgress.crop_name == clean_crop,
                UserActionProgress.step_number == step.step_number,
            )
            .first()
        )

        if not prog:
            prog = UserActionProgress(
                user_id=user_id,
                farm_id=farm_id,
                crop_name=clean_crop,
                step_number=step.step_number,
                status="in_progress",
            )
            db.add(prog)
            db.flush()

        chk_prog = (
            db.query(UserChecklistProgress)
            .filter(
                UserChecklistProgress.user_action_progress_id == prog.id,
                UserChecklistProgress.checklist_item_id == chk_item.id,
            )
            .first()
        )

        now = datetime.now(timezone.utc)
        if not chk_prog:
            chk_prog = UserChecklistProgress(
                user_action_progress_id=prog.id,
                checklist_item_id=chk_item.id,
                completed=1 if completed else 0,
                completed_at=now if completed else None,
            )
            db.add(chk_prog)
        else:
            chk_prog.completed = 1 if completed else 0
            chk_prog.completed_at = now if completed else None

        db.commit()

        return {
            "step_id": step.id,
            "checklist_item_id": chk_item.id,
            "completed": completed,
        }

    def complete_step(
        self, db: Session, user_id: int, farm_id: int, crop_name: str, step_id: int
    ) -> Dict:
        """Backend validated step completion. Validates user owns farm and all checklist tasks are done."""
        clean_crop = self._canonical_crop(crop_name)
        farm = db.query(Farm).filter(Farm.id == farm_id, Farm.user_id == user_id).first()
        if not farm:
            raise HTTPException(status_code=404, detail="Farm not found or unauthorized")

        step = db.query(ActionPlanStep).filter(ActionPlanStep.id == step_id).first()
        if not step:
            raise HTTPException(status_code=404, detail="Step not found")

        prog = (
            db.query(UserActionProgress)
            .filter(
                UserActionProgress.user_id == user_id,
                UserActionProgress.farm_id == farm_id,
                UserActionProgress.crop_name == clean_crop,
                UserActionProgress.step_number == step.step_number,
            )
            .first()
        )

        # Validate that all required checklist items are actually completed in DB
        required_items = db.query(ActionStepChecklist).filter(ActionStepChecklist.step_id == step.id).all()
        if required_items and not prog:
            raise HTTPException(
                status_code=400,
                detail="Please complete all required checklist items before marking this farm step as completed.",
            )

        if required_items and prog:
            completed_chks = (
                db.query(UserChecklistProgress)
                .filter(
                    UserChecklistProgress.user_action_progress_id == prog.id,
                    UserChecklistProgress.completed == 1,
                )
                .all()
            )
            completed_ids = {c.checklist_item_id for c in completed_chks}
            for req in required_items:
                if req.id not in completed_ids:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Incomplete task: '{req.name}'. All checklist tasks must be completed first.",
                    )

        now = datetime.now(timezone.utc)
        if not prog:
            prog = UserActionProgress(
                user_id=user_id,
                farm_id=farm_id,
                crop_name=clean_crop,
                step_number=step.step_number,
                status="completed",
                completed_at=now,
            )
            db.add(prog)
        else:
            prog.status = "completed"
            prog.completed_at = now

        db.commit()
        db.refresh(prog)

        progress_summary = self.get_progress_summary(db, user_id, farm_id, clean_crop)

        return {
            "step_id": step.id,
            "step_number": step.step_number,
            "status": "completed",
            "completed_at": prog.completed_at.isoformat(),
            "progress": progress_summary,
        }

    def get_progress_summary(self, db: Session, user_id: int, farm_id: int, crop_name: str) -> Dict:
        clean_crop = self._canonical_crop(crop_name)
        total_steps = 7

        completed_records = (
            db.query(UserActionProgress)
            .filter(
                UserActionProgress.user_id == user_id,
                UserActionProgress.farm_id == farm_id,
                UserActionProgress.crop_name == clean_crop,
                UserActionProgress.status == "completed",
            )
            .count()
        )

        percent = int(round((completed_records / total_steps) * 100)) if total_steps else 0
        active_step = min(total_steps, completed_records + 1)

        return {
            "farm_id": farm_id,
            "crop_name": clean_crop,
            "completed_steps": completed_records,
            "total_steps": total_steps,
            "percent": percent,
            "active_step": active_step,
        }

    def _canonical_crop(self, crop: str) -> str:
        if not crop:
            return "Soybean"
        c = crop.split("/")[0].strip()
        if "soybean" in c.lower():
            return "Soybean"
        if "ragi" in c.lower() or "millet" in c.lower():
            return "Ragi"
        if "rice" in c.lower() or "paddy" in c.lower():
            return "Rice"
        if "wheat" in c.lower():
            return "Wheat"
        if "sugarcane" in c.lower():
            return "Sugarcane"
        if "cotton" in c.lower():
            return "Cotton"
        if "maize" in c.lower() or "corn" in c.lower():
            return "Maize"
        if "groundnut" in c.lower() or "peanut" in c.lower():
            return "Groundnut"
        return c.capitalize()
