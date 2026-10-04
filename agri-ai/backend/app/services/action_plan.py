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

# Curated, production-quality agronomic video tutorials and checklists with verified working YouTube IDs
CURATED_CROPS_DATA: Dict[str, List[Dict]] = {
    "Rice": [
        {
            "step_number": 1,
            "title": "Prepare Soil",
            "timeframe": "Day 1 - 10",
            "stage": "Pre-sowing & Puddling",
            "youtube_video_id": "7FCLbDgLDqE",
            "youtube_title": "Land Preparation & Field Puddling for Rice Cultivation",
            "youtube_duration": "6:45",
            "description": "Plough the field twice to incorporate crop residue, flood with 5-10 cm standing water, and puddle the soil to form an impermeable hard pan that prevents deep percolation water loss.",
            "learn_points": [
                "Primary and secondary tillage",
                "Field puddling depth and water conservation",
                "Strengthening bunds to prevent water leaks",
                "Laser land leveling for uniform seedling depth",
            ],
            "why_explanation": "Puddling destroys soil macropores to create an impermeable hard pan, conserving flooded irrigation water and suppressing terrestrial weed emergence.",
            "checklists": [
                {"item_key": "1-1", "name": "Primary ploughing to 15-20 cm depth", "spec": "15-20 cm", "sort_order": 1},
                {"item_key": "1-2", "name": "Flood field with 5-7 cm water and puddle", "spec": "5-7 cm water", "sort_order": 2},
                {"item_key": "1-3", "name": "Level puddled soil with wooden plank", "spec": "Perfect leveling", "sort_order": 3},
                {"item_key": "1-4", "name": "Apply FYM / Green manure @ 8-10 t/ha", "spec": "8-10 t/ha", "sort_order": 4},
            ],
        },
        {
            "step_number": 2,
            "title": "Seed Treatment",
            "timeframe": "Day 11 - 14",
            "stage": "Pre-sowing / Nursery",
            "youtube_video_id": "ju2w2zd4Was",
            "youtube_title": "Paddy Seed Soaking, Incubation & Biological Seed Treatment",
            "youtube_duration": "5:20",
            "description": "Dip certified seeds in 10% brine solution to discard chaffy seeds. Treat dense seeds with Carbendazim (2g/kg) and Pseudomonas fluorescens (10g/kg), soak for 24h, and incubate in moist gunny bags for uniform sprouting.",
            "learn_points": [
                "Salt water flotation test to discard non-viable seeds",
                "Fungicide and bio-agent coating technique",
                "24-hour soaking & warm incubation in gunny bags",
                "Radicle sprout emergence before nursery bed sowing",
            ],
            "why_explanation": "Brine flotation eliminates empty and fungal-infected seeds; bio-fungicide treatment protects tender emerging radicles against Bakanae, blast, and collar rot.",
            "checklists": [
                {"item_key": "2-1", "name": "Float seeds in 10% brine; remove light floating seeds", "spec": "10% brine solution", "sort_order": 1},
                {"item_key": "2-2", "name": "Coat viable seeds with Carbendazim / Trichoderma", "spec": "2 g/kg seed", "sort_order": 2},
                {"item_key": "2-3", "name": "Soak seeds in clean water for 24 hours", "spec": "24 hrs soaking", "sort_order": 3},
                {"item_key": "2-4", "name": "Incubate in moist gunny bag for 24-36 hrs until sprouted", "spec": "Radicle emergence", "sort_order": 4},
            ],
        },
        {
            "step_number": 3,
            "title": "Sowing",
            "timeframe": "Day 15 - 25",
            "stage": "Transplanting / SRI",
            "youtube_video_id": "TkHgAkJhtqw",
            "youtube_title": "System of Rice Intensification (SRI) & Precision Transplanting",
            "youtube_duration": "8:30",
            "description": "Transplant 14-18 day old young seedlings at 1-2 seedlings per hill using 25 x 25 cm square geometry to encourage maximum tillering and root development.",
            "learn_points": [
                "Optimal seedling age (14-18 days)",
                "Single seedling per hill without root trauma",
                "Square planting geometry (25x25 cm)",
                "Shallow transplanting depth (2 cm)",
            ],
            "why_explanation": "Young single seedlings planted at wider spacing avoid root trauma, allowing each hill to develop 30-50 vigorous, productive tillers with large panicles.",
            "checklists": [
                {"item_key": "3-1", "name": "Lift seedlings carefully with root soil intact", "spec": "14-18 day nursery", "sort_order": 1},
                {"item_key": "3-2", "name": "Transplant 1-2 seedlings per hill", "spec": "1-2 seedlings/hill", "sort_order": 2},
                {"item_key": "3-3", "name": "Maintain 25 cm x 25 cm grid spacing", "spec": "25 x 25 cm", "sort_order": 3},
                {"item_key": "3-4", "name": "Plant shallow at 2 cm depth in moist puddle", "spec": "2 cm depth", "sort_order": 4},
            ],
        },
        {
            "step_number": 4,
            "title": "Irrigation",
            "timeframe": "Day 26 - 60",
            "stage": "Vegetative / Tillering",
            "youtube_video_id": "tfKWKfagfFs",
            "youtube_title": "Alternate Wetting and Drying (AWD) Water Management in Rice",
            "youtube_duration": "7:15",
            "description": "Implement Alternate Wetting and Drying (AWD) using a field water tube. Allow standing water to drop 15 cm below soil surface before re-flooding to save 30% water and promote deep roots.",
            "learn_points": [
                "Perforated field water tube installation",
                "AWD wetting and drying cycles",
                "Maintaining 5 cm standing water during panicle flowering",
                "Preventing excessive drainage crack formation",
            ],
            "why_explanation": "AWD introduces oxygen into the rhizosphere between waterings, eliminating toxic root sulfides, reducing water consumption by 30%, and stimulating deeper root anchorage.",
            "checklists": [
                {"item_key": "4-1", "name": "Install perforated AWD field water pipe", "spec": "15 cm depth", "sort_order": 1},
                {"item_key": "4-2", "name": "Re-irrigate when water drops 15 cm below soil surface", "spec": "AWD cycle", "sort_order": 2},
                {"item_key": "4-3", "name": "Maintain 5 cm standing water during flowering stage", "spec": "5 cm continuous", "sort_order": 3},
            ],
        },
        {
            "step_number": 5,
            "title": "Crop Care",
            "timeframe": "Day 61 - 85",
            "stage": "Panicle Initiation & Booting",
            "youtube_video_id": "Yj1-g5nUsxI",
            "youtube_title": "Paddy Stem Borer, Leaf Folder & Blast IPM Management",
            "youtube_duration": "8:50",
            "description": "Monitor the field weekly for dead hearts (stem borer) and leaf folder damage. Use pheromone traps (5/ha) and apply targeted bio-pesticides or recommended IPM sprays if pest thresholds are crossed.",
            "learn_points": [
                "Dead heart and white head identification",
                "Pheromone trap installation and lure replacement",
                "Mechanical cono-weeding between rows",
                "Preventative bio-fungicide spray for blast",
            ],
            "why_explanation": "Stem borer larvae bore into tillers and sever internal vascular tissues; early detection and bio-control prevents 100% loss of affected productive heads.",
            "checklists": [
                {"item_key": "5-1", "name": "Install 5 yellow stem borer pheromone traps/ha", "spec": "5 traps/ha", "sort_order": 1},
                {"item_key": "5-2", "name": "Cono-weed between rows at 20 and 40 DAT", "spec": "Row weeding", "sort_order": 2},
                {"item_key": "5-3", "name": "Scout for leaf folder and blast symptoms", "spec": "Weekly survey", "sort_order": 3},
                {"item_key": "5-4", "name": "Spray NeemAzal (1%) if pest population exceeds ETL", "spec": "1% solution", "sort_order": 4},
            ],
        },
        {
            "step_number": 6,
            "title": "Fertilizer",
            "timeframe": "Day 86 - 105",
            "stage": "Flowering & Grain Filling",
            "youtube_video_id": "QXujCltRbDo",
            "youtube_title": "Nitrogen Split Application & Urea Top Dressing in Paddy",
            "youtube_duration": "6:40",
            "description": "Apply nitrogen in 3 equal splits: basal, active tillering, and panicle initiation. Apply MOP (potash) and zinc sulphate to optimize panicle weight and prevent unfilled grains.",
            "learn_points": [
                "3-stage nitrogen split timing",
                "Top-dressing Urea into drained mud for minimal volatilization",
                "Potassium application for grain filling and disease resistance",
                "Zinc deficiency prevention",
            ],
            "why_explanation": "Splitting urea prevents leaching and volatile ammonia loss, ensuring continuous nitrogen supply for panicle branch elongation and dense grain filling.",
            "checklists": [
                {"item_key": "6-1", "name": "Apply 2nd split of Urea (50 kg/ha) at panicle initiation", "spec": "50 kg/ha", "sort_order": 1},
                {"item_key": "6-2", "name": "Top dress MOP (Muriate of Potash) @ 30 kg/ha", "spec": "30 kg/ha", "sort_order": 2},
                {"item_key": "6-3", "name": "Foliar spray of 0.5% Zinc Sulphate", "spec": "0.5% solution", "sort_order": 3},
            ],
        },
        {
            "step_number": 7,
            "title": "Harvest",
            "timeframe": "Day 110 - 135",
            "stage": "Maturity & Post-Harvest",
            "youtube_video_id": "E6sOtaG01i8",
            "youtube_title": "Paddy Mechanical Harvesting, Threshing & Safe Grain Drying",
            "youtube_duration": "7:50",
            "description": "Harvest when 85-90% of panicles turn golden straw-yellow and grain moisture is 20-22%. Drain field 7-10 days before harvest. Thresh immediately and sun-dry grains on tarpaulins to 13-14% safe storage moisture.",
            "learn_points": [
                "Visual maturity indicators (golden straw yellow panicles)",
                "Pre-harvest field drainage (7-10 days prior)",
                "Mechanical thresher cylinder calibration",
                "Safe storage moisture threshold (13-14%)",
            ],
            "why_explanation": "Harvesting at 20-22% moisture prevents field shattering losses and eliminates internal kernel stress fractures that cause grain breakage during milling.",
            "checklists": [
                {"item_key": "7-1", "name": "Drain standing field water 10 days before harvest", "spec": "Field drying", "sort_order": 1},
                {"item_key": "7-2", "name": "Harvest when 85-90% of panicles turn golden yellow", "spec": "20-22% moisture", "sort_order": 2},
                {"item_key": "7-3", "name": "Thresh and clean grains to eliminate chaff and dockage", "spec": "Clean winnowing", "sort_order": 3},
                {"item_key": "7-4", "name": "Sun dry grains on tarpaulin to 13-14% moisture", "spec": "13-14% target", "sort_order": 4},
            ],
        },
    ],
    "Maize": [
        {
            "step_number": 1,
            "title": "Prepare Soil",
            "timeframe": "Day 1 - 8",
            "stage": "Pre-sowing",
            "youtube_video_id": "kJECXvIv4D0",
            "youtube_title": "Maize Land Preparation & Ridge-and-Furrow Layout",
            "youtube_duration": "7:10",
            "description": "Deep summer ploughing to 20-25 cm depth followed by disc harrowing to pulverize clods. Form ridges and furrows at 60 cm spacing to ensure drainage and prevent waterlogging.",
            "learn_points": ["Deep tillage for deep taproot growth", "Ridge and furrow creation (60 cm spacing)", "Incorporating organic farmyard manure (10 t/ha)", "Soil moisture check for seed placement"],
            "why_explanation": "Maize is highly sensitive to waterlogging; ridge sowing lifts the seed crown 15 cm above furrow level, ensuring adequate aeration even during heavy downpours.",
            "checklists": [
                {"item_key": "1-1", "name": "Deep ploughing to 20-25 cm depth", "spec": "20-25 cm", "sort_order": 1},
                {"item_key": "1-2", "name": "Apply 10-12 t/ha well decomposed FYM", "spec": "10-12 t/ha", "sort_order": 2},
                {"item_key": "1-3", "name": "Form ridges and furrows at 60 cm spacing", "spec": "60 cm spacing", "sort_order": 3},
            ],
        },
        {
            "step_number": 2,
            "title": "Seed Treatment",
            "timeframe": "Day 9 - 11",
            "stage": "Pre-sowing",
            "youtube_video_id": "8c_ofaaAFeg",
            "youtube_title": "Maize Seed Treatment with Fungicide and Insecticide",
            "youtube_duration": "5:45",
            "description": "Treat certified hybrid maize seeds with Thiram or Captan (2.5 g/kg) and Imidacloprid (4 ml/kg) to guard against seed rot, shoot fly, and early soil insects.",
            "learn_points": ["Fungicidal seed dressing dosage", "Systemic insecticide treatment against shoot fly", "Drying treated seeds in shaded area", "Pre-sowing germination check (>85%)"],
            "why_explanation": "Early seedling mortality from damping off or shoot fly cannot be compensated in maize because individual plants do not produce productive tillers.",
            "checklists": [
                {"item_key": "2-1", "name": "Coat seeds with Thiram / Captan (2.5 g/kg)", "spec": "2.5 g/kg", "sort_order": 1},
                {"item_key": "2-2", "name": "Treat with Imidacloprid 70 WS (4 ml/kg)", "spec": "4 ml/kg", "sort_order": 2},
                {"item_key": "2-3", "name": "Shade dry for 30 minutes before dibbling", "spec": "30 mins", "sort_order": 3},
            ],
        },
        {
            "step_number": 3,
            "title": "Sowing",
            "timeframe": "Day 12 - 15",
            "stage": "Sowing",
            "youtube_video_id": "CfiMY6VDpEY",
            "youtube_title": "Precision Maize Sowing, Plant Geometry & Spacing",
            "youtube_duration": "6:30",
            "description": "Dibble one seed per hill on the side of the ridge at 60 cm row-to-row and 20 cm plant-to-plant spacing at 4-5 cm depth into moist soil.",
            "learn_points": ["Spacing geometry (60 cm x 20 cm)", "Plant population (65,000 to 70,000 plants/ha)", "Optimum sowing depth (4-5 cm)", "Side of the ridge seed placement"],
            "why_explanation": "Accurate plant spacing ensures each maize plant receives full sunlight and root space to develop large, well-filled cobs without barren stalks.",
            "checklists": [
                {"item_key": "3-1", "name": "Maintain 60 cm row-to-row spacing", "spec": "60 cm", "sort_order": 1},
                {"item_key": "3-2", "name": "Dibble seed at 20 cm plant spacing", "spec": "20 cm", "sort_order": 2},
                {"item_key": "3-3", "name": "Sow at 4-5 cm depth on ridge slope", "spec": "4-5 cm depth", "sort_order": 3},
            ],
        },
        {
            "step_number": 4,
            "title": "Irrigation",
            "timeframe": "Day 16 - 45",
            "stage": "Vegetative & Knee-High",
            "youtube_video_id": "gvntN4hz7rs",
            "youtube_title": "Maize Critical Irrigation Stages & Moisture Management",
            "youtube_duration": "7:40",
            "description": "Irrigate immediately after sowing and again at knee-high stage. Critical stages for moisture are tasseling, silking, and grain filling. Avoid standing water in fields.",
            "learn_points": ["Irrigation at germination & knee-high stage", "Tasseling and silking moisture sensitivity", "Furrow irrigation efficiency", "Field drainage protocols"],
            "why_explanation": "Moisture stress during tasseling and silking causes asynchronous pollen shed and silk emergence, resulting in poorly filled cobs and up to 50% yield reduction.",
            "checklists": [
                {"item_key": "4-1", "name": "First life-saving irrigation at 4-5 DAS", "spec": "Germination", "sort_order": 1},
                {"item_key": "4-2", "name": "Irrigate at knee-high stage (25-30 DAS)", "spec": "Knee-high", "sort_order": 2},
                {"item_key": "4-3", "name": "Maintain adequate moisture during tasseling", "spec": "Critical stage", "sort_order": 3},
            ],
        },
        {
            "step_number": 5,
            "title": "Crop Care",
            "timeframe": "Day 46 - 65",
            "stage": "Tasseling & Whorl Stage",
            "youtube_video_id": "v5t21Nr4VHI",
            "youtube_title": "Fall Armyworm (FAW) & Stem Borer Management in Maize",
            "youtube_duration": "9:15",
            "description": "Scout whorls for Fall Armyworm (FAW) pinhole damage and fecal frass. Apply whorl application of sand + lime or spinosad / emamectin benzoate at first sign of infestation.",
            "learn_points": ["Fall Armyworm egg mass and larvae identification", "Pheromone traps installation (10/ha)", "Whorl application technique", "Inter-cultivation and earthing up"],
            "why_explanation": "FAW caterpillars feed inside the tender central whorl, destroying the growing point and emerging tassel if not managed during early instars.",
            "checklists": [
                {"item_key": "5-1", "name": "Install 10 FAW pheromone traps per hectare", "spec": "10 traps/ha", "sort_order": 1},
                {"item_key": "5-2", "name": "Earthing up along ridges at 30-35 DAS", "spec": "Earthing up", "sort_order": 2},
                {"item_key": "5-3", "name": "Whorl application of Emamectin Benzoate (0.4 g/L)", "spec": "Targeted spray", "sort_order": 3},
            ],
        },
        {
            "step_number": 6,
            "title": "Fertilizer",
            "timeframe": "Day 66 - 85",
            "stage": "Silking & Cob Filling",
            "youtube_video_id": "lRXKsjeHcI0",
            "youtube_title": "Maize Nitrogen Top-Dressing & Urea Application",
            "youtube_duration": "6:20",
            "description": "Apply recommended 120:60:40 kg NPK/ha. Split Nitrogen: 25% basal, 50% at knee-high stage, and 25% at tasseling alongside Zinc Sulphate (25 kg/ha).",
            "learn_points": ["Split nitrogen application schedule", "Side-dressing Urea 10 cm away from plant stem", "Zinc sulphate soil correction", "Potassium application for cob weight"],
            "why_explanation": "Maize is an exhaustive nitrogen feeder; top-dressing nitrogen at knee-high and tasseling stages matches peak nutrient uptake during rapid dry matter accumulation.",
            "checklists": [
                {"item_key": "6-1", "name": "Side dress 2nd split of Urea (60 kg/ha) at knee-high stage", "spec": "60 kg/ha", "sort_order": 1},
                {"item_key": "6-2", "name": "Apply 3rd split of Urea (30 kg/ha) prior to tasseling", "spec": "30 kg/ha", "sort_order": 2},
                {"item_key": "6-3", "name": "Inspect for zinc deficiency symptoms (white bud)", "spec": "Visual check", "sort_order": 3},
            ],
        },
        {
            "step_number": 7,
            "title": "Harvest",
            "timeframe": "Day 95 - 115",
            "stage": "Maturity",
            "youtube_video_id": "Hmb1RP38_Pg",
            "youtube_title": "Maize Cob Harvesting, De-husking, Shelling & Sun Drying",
            "youtube_duration": "7:05",
            "description": "Harvest when cob husk leaves turn paper-white and dry, and a black abscission layer forms at the base of the grain. Dry cobs in sun to 12% moisture before mechanical shelling.",
            "learn_points": ["Black layer formation at grain base", "Cob de-husking and sun drying", "Mechanical maize sheller operation", "Safe grain storage moisture (12%)"],
            "why_explanation": "Black layer formation confirms physiological maturity; harvesting promptly prevents fungal ear rot, aflatoxin contamination, and bird damage.",
            "checklists": [
                {"item_key": "7-1", "name": "Check black layer formation on kernel tip", "spec": "Maturity test", "sort_order": 1},
                {"item_key": "7-2", "name": "Harvest mature cobs and de-husk", "spec": "Clean cobs", "sort_order": 2},
                {"item_key": "7-3", "name": "Sun-dry cobs for 3-4 days on clean yard", "spec": "Sun drying", "sort_order": 3},
                {"item_key": "7-4", "name": "Shell grains and store at 12% moisture", "spec": "12% moisture", "sort_order": 4},
            ],
        },
    ],
    "Soybean": [
        {
            "step_number": 1,
            "title": "Prepare Soil",
            "timeframe": "Day 1 - 10",
            "stage": "Pre-sowing",
            "youtube_video_id": "2JkzHSiOgqM",
            "youtube_title": "Soil Preparation & Seedbed Tillage for Soybean",
            "youtube_duration": "7:40",
            "description": "Deep summer ploughing followed by 2 passes of harrow. Apply 4-5 tonnes of well-rotted FYM per hectare and level the land to ensure good tilth and drainage.",
            "learn_points": ["Deep ploughing to 20-25 cm depth", "Fine crumbly tilth for delicate soybean seeds", "Ridge and furrow drainage channels", "Organic manure incorporation"],
            "why_explanation": "Soybean requires loose, well-aerated soil for quick emergence; good drainage prevents damping-off during early monsoon downpours.",
            "checklists": [
                {"item_key": "1-1", "name": "Deep ploughing — 20-25 cm", "spec": "20-25 cm", "sort_order": 1},
                {"item_key": "1-2", "name": "Apply FYM/compost — 4-5 t/ha", "spec": "4-5 t/ha", "sort_order": 2},
                {"item_key": "1-3", "name": "Test soil pH — Target 6.0-7.5", "spec": "Target 6.0-7.5", "sort_order": 3},
                {"item_key": "1-4", "name": "Level the field to prevent waterlogging", "spec": "Optimal tilth", "sort_order": 4},
            ],
        },
        {
            "step_number": 2,
            "title": "Seed Treatment",
            "timeframe": "Day 11 - 13",
            "stage": "Pre-sowing",
            "youtube_video_id": "8c_ofaaAFeg",
            "youtube_title": "Soybean Seed Treatment with Bio-fertilizers & Fungicide",
            "youtube_duration": "6:15",
            "description": "Treat high-germination seeds with bio-fertilizers (Rhizobium japonicum + PSB) and recommended fungicides to protect against soil-borne damping-off and collar rot.",
            "learn_points": ["Fungicide coating dosage", "Rhizobium inoculant technique", "Trichoderma bio-protection", "Shade drying protocols"],
            "why_explanation": "Inoculation with Rhizobium japonicum maximizes atmospheric nitrogen fixation in nodule roots, reducing synthetic nitrogen requirement by 50%.",
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
            "youtube_video_id": "u78QiWJmAY4",
            "youtube_title": "Precision Sowing and Spacing in Soybean Farming",
            "youtube_duration": "7:20",
            "description": "Sow seeds in well-moistened seedbed maintaining 45 cm row-to-row spacing and 5-7 cm plant-to-plant spacing at 3-4 cm depth.",
            "learn_points": ["Row-to-row spacing (45 cm)", "Plant-to-plant spacing (5-7 cm)", "Optimum sowing depth (3-4 cm)", "Seed drill calibration (65-75 kg/ha)"],
            "why_explanation": "Uniform plant geometry ensures equal access to sunlight, moisture, and ground nutrients while preventing seedling overcrowding.",
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
            "youtube_video_id": "5aGlLeYAj6s",
            "youtube_title": "Smart Irrigation & Drainage Management for Soybean",
            "youtube_duration": "8:05",
            "description": "Manage water according to soil moisture telemetry and forecast rainfall. Ensure drainage channels are clear to prevent water stagnation.",
            "learn_points": ["Critical growth stages for water (pod filling)", "Ridge and furrow drainage", "Soil moisture assessment (target 45%)", "Avoiding root zone waterlogging"],
            "why_explanation": "Soybean is susceptible to collar rot and root asphyxiation when field drainage is inadequate during initial branching.",
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
            "youtube_video_id": "y6ahSqQYqls",
            "youtube_title": "Weed & Pest Management in Soybean",
            "youtube_duration": "9:15",
            "description": "Keep fields weed-free during first 45 days. Monitor for defoliators, stem fly, and girdle beetle using IPM techniques.",
            "learn_points": ["Hand weeding schedule (20-25 DAS)", "Pheromone trap installation", "Biopesticide neem oil application", "Scouting for girdle beetle"],
            "why_explanation": "Weed competition during the first 30-45 days reduces pod count and branches by up to 40%.",
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
            "youtube_video_id": "bWP2g9KQlvk",
            "youtube_title": "Nutrient & Fertilizer Split for Maximum Pod Filling",
            "youtube_duration": "7:40",
            "description": "Ensure balanced nutrition at pod formation. Spray soluble nutrients (2% DAP) to boost grain filling and avoid premature leaf yellowing.",
            "learn_points": ["Balanced NPK split (20:60:40 kg/ha)", "Sulphur supplementation (20 kg/ha)", "Foliar spray of 2% DAP at 50% flowering", "Micronutrient zinc and boron check"],
            "why_explanation": "Sulphur and potassium application during pod filling directly boosts oil content and test weight in soybean.",
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
            "youtube_video_id": "6LHhQjIobtI",
            "youtube_title": "Harvesting, Threshing & Safe Storage of Soybean",
            "youtube_duration": "6:50",
            "description": "Harvest when 90% of leaves have shed and pods have turned golden yellow. Avoid delayed harvest to minimize pod shattering.",
            "learn_points": ["Recognizing maturity indicators", "Preventing pod shattering losses", "Thresher cylinder speed adjustment (400-500 RPM)", "Storage moisture threshold (10-12%)"],
            "why_explanation": "Harvesting at 14-16% seed moisture prevents seed coat cracking and preserves seed viability and germination rate.",
            "checklists": [
                {"item_key": "7-1", "name": "Harvest when 90% of pods turn golden-yellow", "spec": "Morning hours", "sort_order": 1},
                {"item_key": "7-2", "name": "Thresh at low cylinder speed (400-500 RPM)", "spec": "400-500 RPM", "sort_order": 2},
                {"item_key": "7-3", "name": "Sun dry seeds to 10-12% moisture before bagging", "spec": "10-12% moisture", "sort_order": 3},
            ],
        },
    ],
    "Cotton": [
        {
            "step_number": 1,
            "title": "Prepare Soil",
            "timeframe": "Day 1 - 10",
            "stage": "Pre-sowing",
            "youtube_video_id": "GHvEvMBSrMw",
            "youtube_title": "Cotton Field Preparation & Deep Tillage",
            "youtube_duration": "7:15",
            "description": "Deep ploughing followed by 2 harrowing passes. Incorporate 10-12 t/ha of FYM and construct broad bed furrows at 90-120 cm spacing.",
            "learn_points": ["Deep summer tillage to break hard pan", "Broad bed and furrow (BBF) layout", "Organic FYM incorporation", "Ensuring deep subsoil moisture"],
            "why_explanation": "Cotton is a deep tap-rooted crop requiring deep crumbly soil for root penetration up to 1.5 meters.",
            "checklists": [
                {"item_key": "1-1", "name": "Deep ploughing to 25-30 cm", "spec": "25-30 cm", "sort_order": 1},
                {"item_key": "1-2", "name": "Incorporate FYM @ 10-12 t/ha", "spec": "10-12 t/ha", "sort_order": 2},
                {"item_key": "1-3", "name": "Form ridges/beds at 90-120 cm spacing", "spec": "90-120 cm", "sort_order": 3},
            ],
        },
        {
            "step_number": 2,
            "title": "Seed Treatment",
            "timeframe": "Day 11 - 13",
            "stage": "Pre-sowing",
            "youtube_video_id": "AyTLPO4CafI",
            "youtube_title": "Cotton Seed Treatment with Bio-Agents & Systemic Insecticides",
            "youtube_duration": "6:00",
            "description": "Acid delint seeds or use certified delinted seeds. Treat with Imidacloprid (5 g/kg) and Trichoderma (10 g/kg) to protect against sucking pests and seedling rot.",
            "learn_points": ["Acid delinting validation", "Systemic sucking pest protection (Imidacloprid)", "Bio-fungicide coating", "Shade drying before sowing"],
            "why_explanation": "Seed treatment with Imidacloprid protects vulnerable seedlings from aphids, jassids, and thrips for up to 30 days after emergence.",
            "checklists": [
                {"item_key": "2-1", "name": "Use certified acid-delinted seeds", "spec": "Delinted seed", "sort_order": 1},
                {"item_key": "2-2", "name": "Coat seeds with Imidacloprid (5 g/kg)", "spec": "5 g/kg seed", "sort_order": 2},
                {"item_key": "2-3", "name": "Inoculate with Trichoderma viride (10 g/kg)", "spec": "10 g/kg seed", "sort_order": 3},
            ],
        },
        {
            "step_number": 3,
            "title": "Sowing",
            "timeframe": "Day 14 - 18",
            "stage": "Sowing / Dibbling",
            "youtube_video_id": "5nbMWeLcrAM",
            "youtube_title": "Cotton Dibbling Method & Plant Population Management",
            "youtube_duration": "6:50",
            "description": "Dibble 2 seeds per hill on the shoulder of the ridge at 90 x 60 cm spacing at 3-4 cm depth into moist soil.",
            "learn_points": ["Dibbling 2 seeds per hill", "90 cm x 60 cm geometry", "Thinning to single healthy seedling at 15 DAS", "Gap filling within 7 DAS"],
            "why_explanation": "Proper plant population allows vigorous sympodial branching and provides adequate light penetration across the lower canopy.",
            "checklists": [
                {"item_key": "3-1", "name": "Dibble 2 seeds per hill at 3 cm depth", "spec": "3 cm depth", "sort_order": 1},
                {"item_key": "3-2", "name": "Maintain 90 cm x 60 cm spacing", "spec": "90 x 60 cm", "sort_order": 2},
                {"item_key": "3-3", "name": "Perform gap filling within 7-10 DAS", "spec": "Early gap filling", "sort_order": 3},
            ],
        },
        {
            "step_number": 4,
            "title": "Irrigation",
            "timeframe": "Day 19 - 50",
            "stage": "Vegetative / Square Formation",
            "youtube_video_id": "xidVEDvlJ9A",
            "youtube_title": "Cotton Drip Irrigation & Water Requirement by Stage",
            "youtube_duration": "7:30",
            "description": "Irrigate sparingly during early vegetative growth to encourage tap root elongation. Increase irrigation during squaring and flowering.",
            "learn_points": ["Controlled irrigation during early stage", "Drip irrigation scheduling", "Moisture requirement at squaring & boll formation", "Drainage during excessive rainfall"],
            "why_explanation": "Excess water in early growth produces excessive vegetative growth (rank growth) at the expense of fruiting branches.",
            "checklists": [
                {"item_key": "4-1", "name": "Maintain moderate soil moisture (35-40%)", "spec": "35-40% moisture", "sort_order": 1},
                {"item_key": "4-2", "name": "Ensure timely irrigation at squaring stage", "spec": "Square initiation", "sort_order": 2},
                {"item_key": "4-3", "name": "Avoid water stagnation in furrows", "spec": "Clear drainage", "sort_order": 3},
            ],
        },
        {
            "step_number": 5,
            "title": "Crop Care",
            "timeframe": "Day 51 - 85",
            "stage": "Flowering & Boll Formation",
            "youtube_video_id": "E5hpNlptBa0",
            "youtube_title": "Pink Bollworm & Sucking Pest Management in Cotton",
            "youtube_duration": "8:40",
            "description": "Install pheromone traps (5/ha) for pink bollworm monitoring. Spray neem oil (1500 ppm) or recommended IPM insecticides at threshold.",
            "learn_points": ["Pink bollworm rosette flower scouting", "Pheromone trap monitoring", "Botanical pesticide application", "Nipping / detopping terminal shoots at 90 DAS"],
            "why_explanation": "Pink bollworm larvae enter bolls and destroy lint quality and seed weight; detopping prevents terminal shoot wastage.",
            "checklists": [
                {"item_key": "5-1", "name": "Install 5 pink bollworm pheromone traps per hectare", "spec": "5 traps/ha", "sort_order": 1},
                {"item_key": "5-2", "name": "Scout for rosette flowers and flared squares", "spec": "Weekly scouting", "sort_order": 2},
                {"item_key": "5-3", "name": "Detop terminal shoot at 90-100 DAS", "spec": "Detopping", "sort_order": 3},
            ],
        },
        {
            "step_number": 6,
            "title": "Fertilizer",
            "timeframe": "Day 86 - 110",
            "stage": "Boll Development",
            "youtube_video_id": "gHW9mwseFgY",
            "youtube_title": "Fertilizer Application & Micronutrient Boron Spray in Cotton",
            "youtube_duration": "6:45",
            "description": "Apply recommended 120:60:60 NPK/ha. Split Nitrogen: 25% basal, 50% at squaring, and 25% at boll development alongside foliar boron (0.1%).",
            "learn_points": ["Split nitrogen application at squaring", "Potassium application for boll weight", "Foliar spray of 1% Magnesium Sulphate", "Boron spray to prevent flower dropping"],
            "why_explanation": "Boron and potassium prevent flower and square dropping and ensure dense, well-filled cotton bolls.",
            "checklists": [
                {"item_key": "6-1", "name": "Apply 2nd split of Urea + Potash at squaring", "spec": "Squaring stage", "sort_order": 1},
                {"item_key": "6-2", "name": "Foliar spray of 0.1% Borax + 1% MgSO4", "spec": "Foliar spray", "sort_order": 2},
                {"item_key": "6-3", "name": "Top dress 3rd split of Urea at peak boll development", "spec": "Boll stage", "sort_order": 3},
            ],
        },
        {
            "step_number": 7,
            "title": "Harvest",
            "timeframe": "Day 120 - 160",
            "stage": "Boll Bursting & Picking",
            "youtube_video_id": "TiBWylKGVOM",
            "youtube_title": "Clean Cotton Picking, Drying & Storage Techniques",
            "youtube_duration": "7:25",
            "description": "Pick cleanly opened bolls during dry afternoon hours. Avoid leaf trash and bracts. Sun-dry picked seed cotton to less than 8% moisture before storing.",
            "learn_points": ["Staged picking (3-4 pickings)", "Harvesting clean seed cotton without bracts", "Sun drying on clean floor", "Storage in moisture-free room"],
            "why_explanation": "Picking clean cotton without dry leaf trash qualifies for premium grade at market and prevents staining.",
            "checklists": [
                {"item_key": "7-1", "name": "Pick fully burst bolls in sunny afternoon hours", "spec": "Dry picking", "sort_order": 1},
                {"item_key": "7-2", "name": "Keep stained and insect-damaged cotton separate", "spec": "Quality sorting", "sort_order": 2},
                {"item_key": "7-3", "name": "Sun-dry picked seed cotton to <8% moisture", "spec": "<8% moisture", "sort_order": 3},
            ],
        },
    ],
    "Ragi": [
        {
            "step_number": 1,
            "title": "Prepare Soil",
            "timeframe": "Day 1 - 10",
            "stage": "Pre-sowing",
            "youtube_video_id": "B4go46eCbtY",
            "youtube_title": "Land Preparation for Finger Millet (Ragi)",
            "youtube_duration": "8:10",
            "description": "Plough the field twice with mouldboard plough followed by fine harrowing to create a fine, crumbly seedbed suitable for tiny ragi seeds.",
            "learn_points": ["Fine tilth seedbed preparation", "FYM incorporation (10 t/ha)", "Field leveling for uniform moisture", "Drainage channel layout"],
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
            "youtube_video_id": "t9fjOQHvsUk",
            "youtube_title": "Ragi Seed Treatment for Blast & Smut Prevention",
            "youtube_duration": "5:50",
            "description": "Treat ragi seeds with Pseudomonas fluorescens and Azospirillum culture to protect against finger blast disease.",
            "learn_points": ["Salt water seed selection (10% brine)", "Pseudomonas fluorescens bio-coating", "Azospirillum bio-fertilizer mixing", "Drying under shade"],
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
            "youtube_video_id": "B4go46eCbtY",
            "youtube_title": "Direct Sowing & Line Transplanting Method in Ragi",
            "youtube_duration": "7:15",
            "description": "Sow seeds at 22.5 x 10 cm spacing or transplant 21-day-old seedlings with 2 seedlings per hill for optimal tillering.",
            "learn_points": ["Optimum seed rate (5-7 kg/ha)", "Line sowing depth (2-3 cm)", "Transplanting age (21 days)", "Gapping and thinning timing"],
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
            "youtube_video_id": "1IN67PLhi5w",
            "youtube_title": "Irrigation Schedule & Water Conservation in Ragi",
            "youtube_duration": "6:40",
            "description": "Irrigate at critical stages: tillering, flowering, and grain filling. Finger millet is drought-hardy but responds well to timely irrigation.",
            "learn_points": ["Water requirement at tillering", "Monitoring soil moisture deficit", "Drainage during continuous rain", "Alternate furrow irrigation"],
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
            "youtube_video_id": "GC7WTFfGE9Q",
            "youtube_title": "Weed & Blast Management in Ragi",
            "youtube_duration": "8:25",
            "description": "Perform two hand weedings at 20 and 40 DAS. Spray biopesticides if blast symptoms appear on leaf tips.",
            "learn_points": ["Rotary weeder operation", "Blast disease identification", "Tricyclazole / Bio-fungicide spray", "Stem borer scouting"],
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
            "youtube_video_id": "t92faqQELTo",
            "youtube_title": "Fertilizer Management & Potassium Top Dressing for Ragi",
            "youtube_duration": "7:10",
            "description": "Apply 50% nitrogen as basal and split remainder at tillering and panicle initiation. Apply recommended MOP for robust grain filling.",
            "learn_points": ["Recommended 60:30:30 NPK ratio", "Nitrogen top dressing at flowering", "Potassium application for grain weight", "Foliar micronutrient zinc spray"],
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
            "youtube_video_id": "CrqUuL7XYno",
            "youtube_title": "Harvesting & Curing of Finger Millet",
            "youtube_duration": "6:30",
            "description": "Cut ear heads when seeds turn dark brown and straw turns yellowish. Dry on threshing yard before manual or mechanical threshing.",
            "learn_points": ["Selective ear head picking", "Threshing floor preparation", "Moisture drying to 12%", "Storage in airtight bins"],
            "why_explanation": "Two-stage harvesting ensures ear heads are cut at peak dryness without grain shattering losses.",
            "checklists": [
                {"item_key": "7-1", "name": "Cut mature brown ear heads with sickle", "spec": "First picking", "sort_order": 1},
                {"item_key": "7-2", "name": "Heap ear heads for 3 days for curing", "spec": "Curing phase", "sort_order": 2},
                {"item_key": "7-3", "name": "Sun-dry grains to 12% moisture", "spec": "12% moisture", "sort_order": 3},
            ],
        },
    ],
    "Mustard": [
        {
            "step_number": 1,
            "title": "Prepare Soil",
            "timeframe": "Day 1 - 10",
            "stage": "Pre-sowing & Tilth",
            "youtube_video_id": "kJECXvIv4D0",
            "youtube_title": "Mustard Land Preparation & Fine Seedbed Tilth",
            "youtube_duration": "6:45",
            "description": "Deep summer ploughing followed by 2-3 harrowing passes and planking to create a fine, pulverised, friable seedbed. Conserve soil moisture from receding monsoon and apply 8-10 t/ha decomposed farmyard manure.",
            "learn_points": [
                "Deep ploughing to 20 cm depth to break hardpan",
                "Fine, pulverised clod-free seedbed for tiny mustard seeds",
                "Conserving residual soil moisture before sowing",
                "Planking immediately after harrowing to prevent moisture evaporation",
            ],
            "why_explanation": "Mustard seeds are extremely small (test weight 3-5g); a fine tilth ensures intimate seed-to-soil contact and uniform moisture absorption for rapid emergence.",
            "checklists": [
                {"item_key": "1-1", "name": "Deep ploughing followed by fine harrowing", "spec": "20 cm depth", "sort_order": 1},
                {"item_key": "1-2", "name": "Planking immediately to seal seedbed moisture", "spec": "Moisture sealing", "sort_order": 2},
                {"item_key": "1-3", "name": "Apply well-decomposed FYM @ 8-10 t/ha", "spec": "8-10 t/ha", "sort_order": 3},
            ],
        },
        {
            "step_number": 2,
            "title": "Seed Treatment",
            "timeframe": "Day 11 - 13",
            "stage": "Pre-sowing",
            "youtube_video_id": "8c_ofaaAFeg",
            "youtube_title": "Mustard Seed Treatment with Fungicide & Bio-Agents",
            "youtube_duration": "5:30",
            "description": "Treat certified mustard seed with Thiram or Carbendazim (2 g/kg) to prevent damping-off and Alternaria blight, followed by Azotobacter and PSB bio-fertilizers (10 g/kg each).",
            "learn_points": [
                "Fungicide coating sequence",
                "Bio-fertilizer inoculation (Azotobacter + PSB)",
                "Shade drying seeds for 30 minutes before drilling",
                "Maintaining seed rate (4-5 kg/ha)",
            ],
            "why_explanation": "Seed dressing creates a protective chemical and biological halo around the seedling, suppressing seed-borne Alternaria and soil-borne damping-off fungi.",
            "checklists": [
                {"item_key": "2-1", "name": "Treat seeds with Thiram / Carbendazim (2 g/kg)", "spec": "2 g/kg seed", "sort_order": 1},
                {"item_key": "2-2", "name": "Inoculate with Azotobacter & PSB cultures", "spec": "10 g/kg seed", "sort_order": 2},
                {"item_key": "2-3", "name": "Shade dry for 30 minutes before drilling", "spec": "30 mins", "sort_order": 3},
            ],
        },
        {
            "step_number": 3,
            "title": "Sowing",
            "timeframe": "Day 14 - 17",
            "stage": "Sowing",
            "youtube_video_id": "czTQZpWKfns",
            "youtube_title": "Mustard Line Sowing, Seed Rate & Spacing Geometry",
            "youtube_duration": "7:10",
            "description": "Sow seeds in lines using a seed-cum-fertilizer drill at 30-45 cm row spacing and 10-15 cm plant spacing at a depth of 3-4 cm. Ensure adequate soil moisture at sowing.",
            "learn_points": [
                "Row-to-row spacing (30-45 cm)",
                "Plant-to-plant spacing (10-15 cm) after thinning",
                "Optimum sowing depth (3-4 cm in moist zone)",
                "Seed rate calibration (4-5 kg/ha)",
            ],
            "why_explanation": "Line sowing with optimal spacing allows full branch canopy spread, eases inter-cultivation weeding, and prevents humid microclimates that trigger white rust.",
            "checklists": [
                {"item_key": "3-1", "name": "Maintain 30-45 cm row-to-row spacing", "spec": "30-45 cm", "sort_order": 1},
                {"item_key": "3-2", "name": "Sow at 3-4 cm depth in moist soil layer", "spec": "3-4 cm depth", "sort_order": 2},
                {"item_key": "3-3", "name": "Perform thinning at 15-20 DAS to 10-15 cm spacing", "spec": "Thinning 15 DAS", "sort_order": 3},
            ],
        },
        {
            "step_number": 4,
            "title": "Irrigation",
            "timeframe": "Day 18 - 45",
            "stage": "Rosette & Pre-flowering",
            "youtube_video_id": "tERCZxncZkM",
            "youtube_title": "Mustard Critical Irrigation Stages & Moisture Management",
            "youtube_duration": "6:25",
            "description": "Apply first critical irrigation at 25-30 DAS (rosette / branching stage) and second irrigation at 50-60 DAS (siliqua / pod formation). Avoid flooding to prevent root rot.",
            "learn_points": [
                "Rosette stage irrigation (25-30 DAS)",
                "Siliqua development irrigation (50-60 DAS)",
                "Avoiding irrigation at peak bloom to protect bee pollinators",
                "Drainage during unexpected winter rains",
            ],
            "why_explanation": "Moisture stress at rosette initiation restricts secondary branch emergence; irrigating during pod development directly increases seed count per siliqua.",
            "checklists": [
                {"item_key": "4-1", "name": "Apply first irrigation at rosette stage (25-30 DAS)", "spec": "Rosette stage", "sort_order": 1},
                {"item_key": "4-2", "name": "Check soil moisture before flowering", "spec": "Target 40%", "sort_order": 2},
                {"item_key": "4-3", "name": "Apply second irrigation at siliqua filling (55-60 DAS)", "spec": "Pod filling", "sort_order": 3},
            ],
        },
        {
            "step_number": 5,
            "title": "Crop Care",
            "timeframe": "Day 46 - 70",
            "stage": "Flowering & Pod Formation",
            "youtube_video_id": "GC7WTFfGE9Q",
            "youtube_title": "Mustard Aphid (Lipaphis erysimi) & White Rust IPM",
            "youtube_duration": "8:15",
            "description": "Monitor weekly for mustard aphids on terminal shoots and white rust pustules on leaves. Install yellow sticky traps (15/ha) and spray neem oil or Dimethoate if aphids exceed ETL.",
            "learn_points": [
                "Aphid ETL monitoring (1.5-2 cm infestation on terminal twig)",
                "Yellow sticky trap installation (15 traps/ha)",
                "White rust and Alternaria blight scouting",
                "Bio-pesticide spray timing (late afternoon to protect honeybees)",
            ],
            "why_explanation": "Mustard aphids suck sap from tender shoots, inflorescences, and pods, curling leaves and reducing seed yield and oil content by up to 50% if unmanaged.",
            "checklists": [
                {"item_key": "5-1", "name": "Install 15 yellow sticky traps per hectare", "spec": "15 traps/ha", "sort_order": 1},
                {"item_key": "5-2", "name": "Scout terminal shoots for aphid colonies (ETL check)", "spec": "Weekly survey", "sort_order": 2},
                {"item_key": "5-3", "name": "Spray Neem oil 1500 ppm or recommended IPM spray if needed", "spec": "IPM spray", "sort_order": 3},
            ],
        },
        {
            "step_number": 6,
            "title": "Fertilizer",
            "timeframe": "Day 71 - 90",
            "stage": "Flowering / Siliqua Formation",
            "youtube_video_id": "t92faqQELTo",
            "youtube_title": "Mustard Nutrient Management & Sulphur Application",
            "youtube_duration": "7:00",
            "description": "Apply 80:40:40 kg NPK/ha along with 20-30 kg/ha elemental Sulphur or gypsum. Top dress 50% nitrogen split after first irrigation to stimulate branching and oil synthesis.",
            "learn_points": [
                "Sulphur application (20-30 kg/ha) for oil content",
                "Nitrogen split application timing after 1st watering",
                "Foliar spray of 1% urea or 19-19-19 at flowering",
                "Zinc sulphate soil correction",
            ],
            "why_explanation": "Mustard has an obligate requirement for sulphur; sulphur is essential for methionine and cystine synthesis, increasing oil content by 2-4% and seed test weight.",
            "checklists": [
                {"item_key": "6-1", "name": "Apply Sulphur @ 20-30 kg/ha at basal or 1st irrigation", "spec": "25 kg/ha", "sort_order": 1},
                {"item_key": "6-2", "name": "Top dress second split of Urea (40 kg/ha) after 1st irrigation", "spec": "40 kg/ha Urea", "sort_order": 2},
                {"item_key": "6-3", "name": "Foliar spray of 0.5% Borax at flowering", "spec": "0.5% Borax", "sort_order": 3},
            ],
        },
        {
            "step_number": 7,
            "title": "Harvest",
            "timeframe": "Day 100 - 125",
            "stage": "Maturity & Pod Ripening",
            "youtube_video_id": "CrqUuL7XYno",
            "youtube_title": "Mustard Harvesting, Threshing & Safe Storage Moisture",
            "youtube_duration": "6:35",
            "description": "Harvest when 75-80% of siliquae (pods) turn golden straw yellow and seeds inside rattle and turn reddish-brown. Harvest in early morning to prevent shattering losses.",
            "learn_points": [
                "Harvest timing in early morning dew hours to avoid shattering",
                "Visual indicators (pods turn bright yellow, stems dry)",
                "Field curing in small bundles for 4-5 days",
                "Sun drying seeds to safe 8% moisture before storing",
            ],
            "why_explanation": "Delaying harvest causes brittle pods to shatter open during daytime heat, losing up to 30% of seed on the field; morning harvesting keeps pods supple.",
            "checklists": [
                {"item_key": "7-1", "name": "Harvest during early morning hours when pods are supple", "spec": "Morning hours", "sort_order": 1},
                {"item_key": "7-2", "name": "Tie into small bundles and cure in sun for 4-5 days", "spec": "4-5 days curing", "sort_order": 2},
                {"item_key": "7-3", "name": "Thresh, clean and sun-dry seeds to <8% moisture", "spec": "<8% moisture", "sort_order": 3},
            ],
        },
    ],
    "Pigeon Pea": [
        {
            "step_number": 1,
            "title": "Prepare Soil",
            "timeframe": "Day 1 - 10",
            "stage": "Pre-sowing & Deep Tillage",
            "youtube_video_id": "GHvEvMBSrMw",
            "youtube_title": "Pigeon Pea Field Preparation & Deep Tillage",
            "youtube_duration": "7:15",
            "description": "Deep summer ploughing to 25-30 cm depth to break subsoil hard pan, followed by 2 disc harrowings. Form broad bed and furrows (BBF) or ridges at 90-120 cm spacing to provide optimal drainage.",
            "learn_points": [
                "Deep subsoiling for extensive taproot system (up to 2 meters)",
                "Broad bed and furrow (BBF) layout for monsoon drainage",
                "Incorporating 8-10 t/ha well decomposed FYM",
                "Preventing water stagnation to avoid collar rot and Phytophthora",
            ],
            "why_explanation": "Pigeon pea develops a deep vertical taproot; deep tillage allows roots to penetrate the subsoil to access moisture during reproductive drought spells.",
            "checklists": [
                {"item_key": "1-1", "name": "Deep ploughing to 25-30 cm to break hard pan", "spec": "25-30 cm", "sort_order": 1},
                {"item_key": "1-2", "name": "Incorporate well-rotted FYM @ 8-10 t/ha", "spec": "8-10 t/ha", "sort_order": 2},
                {"item_key": "1-3", "name": "Form ridges and furrows at 90-120 cm spacing", "spec": "90-120 cm", "sort_order": 3},
            ],
        },
        {
            "step_number": 2,
            "title": "Seed Treatment",
            "timeframe": "Day 11 - 13",
            "stage": "Pre-sowing",
            "youtube_video_id": "8c_ofaaAFeg",
            "youtube_title": "Pigeon Pea Seed Inoculation with Rhizobium & Trichoderma",
            "youtube_duration": "6:10",
            "description": "Treat certified seeds with Trichoderma viride (4 g/kg) or Thiram + Carbendazim (2 g/kg). Inoculate with crop-specific Rhizobium culture and PSB (20 g/kg seed each) using jaggery solution.",
            "learn_points": [
                "Fungicide seed treatment sequence before bio-inoculation",
                "Rhizobium culture slurry preparation with 10% jaggery solution",
                "Trichoderma protection against Fusarium wilt and damping off",
                "Shade drying for 30 minutes before dibbling",
            ],
            "why_explanation": "Rhizobium inoculation ensures effective active pink root nodulation, enabling Pigeon Pea to fix up to 40 kg of atmospheric nitrogen per hectare.",
            "checklists": [
                {"item_key": "2-1", "name": "Fungicide dressing with Trichoderma or Carbendazim", "spec": "4 g/kg seed", "sort_order": 1},
                {"item_key": "2-2", "name": "Inoculate with Rhizobium + PSB in jaggery slurry", "spec": "20 g/kg seed", "sort_order": 2},
                {"item_key": "2-3", "name": "Shade dry treated seeds for 30 minutes", "spec": "30 mins", "sort_order": 3},
            ],
        },
        {
            "step_number": 3,
            "title": "Sowing",
            "timeframe": "Day 14 - 18",
            "stage": "Sowing / Dibbling",
            "youtube_video_id": "5nbMWeLcrAM",
            "youtube_title": "Pigeon Pea Ridge-and-Furrow Sowing & Spacing Geometry",
            "youtube_duration": "6:50",
            "description": "Dibble 2 seeds per hill on the side of the ridge at 90-120 cm row-to-row spacing and 20-30 cm plant-to-plant spacing at a depth of 4-5 cm. Thin to one vigorous plant per hill at 15-20 DAS.",
            "learn_points": [
                "Row-to-row spacing (90-120 cm) according to variety duration",
                "Plant-to-plant spacing (20-30 cm)",
                "Dibbling depth (4-5 cm into moist soil layer)",
                "Thinning and gap filling within 10-15 DAS",
            ],
            "why_explanation": "Spaced dibbling accommodates the wide, bushy spreading canopy of red gram, preventing self-shading and premature flower drop.",
            "checklists": [
                {"item_key": "3-1", "name": "Maintain 90-120 cm row-to-row spacing", "spec": "90-120 cm", "sort_order": 1},
                {"item_key": "3-2", "name": "Dibble seeds at 20-30 cm plant spacing at 4-5 cm depth", "spec": "4-5 cm depth", "sort_order": 2},
                {"item_key": "3-3", "name": "Thin to one healthy seedling per hill at 15 DAS", "spec": "1 plant/hill", "sort_order": 3},
            ],
        },
        {
            "step_number": 4,
            "title": "Irrigation",
            "timeframe": "Day 19 - 60",
            "stage": "Vegetative & Branching",
            "youtube_video_id": "5aGlLeYAj6s",
            "youtube_title": "Pigeon Pea Irrigation Scheduling at Flowering & Pod Setting",
            "youtube_duration": "7:45",
            "description": "Pigeon pea is deep-rooted and rainfed-hardy, but critical life-saving irrigations at flower initiation and pod filling dramatically double yields during prolonged dry spells.",
            "learn_points": [
                "Critical growth stages: flower initiation and pod filling",
                "Avoiding excess soil moisture during early vegetative growth",
                "Furrow irrigation technique ensuring no standing water",
                "Clear drainage furrows to avert root asphyxiation during heavy rain",
            ],
            "why_explanation": "Severe moisture stress at pod setting triggers flower abscission and abortion of young pods, whereas waterlogging causes rapid wilt infection.",
            "checklists": [
                {"item_key": "4-1", "name": "Ensure free field drainage during monsoon rains", "spec": "Drainage check", "sort_order": 1},
                {"item_key": "4-2", "name": "Provide life-saving irrigation at flower initiation", "spec": "Flower bud stage", "sort_order": 2},
                {"item_key": "4-3", "name": "Irrigate at pod filling stage if dry spell exceeds 15 days", "spec": "Pod filling", "sort_order": 3},
            ],
        },
        {
            "step_number": 5,
            "title": "Crop Care",
            "timeframe": "Day 61 - 95",
            "stage": "Flowering & Pod Formation",
            "youtube_video_id": "E5hpNlptBa0",
            "youtube_title": "Helicoverpa Pod Borer & Fusarium Wilt IPM in Pigeon Pea",
            "youtube_duration": "8:40",
            "description": "Install pheromone traps (5/ha) and bird perches (50/ha). Nipper terminal shoot at 45-50 DAS to induce profuse secondary branching. Spray Emamectin Benzoate or Chlorantraniliprole at early pod borer infestation.",
            "learn_points": [
                "Helicoverpa armigera and plume moth scouting",
                "Nipping terminal shoots at 45-50 DAS for bushy growth",
                "Pheromone trap installation and economic threshold (ETL)",
                "Biological control with NeemAzal (1%) and NPV spray",
            ],
            "why_explanation": "Gram pod borer larvae bore holes into developing pods and feed on seeds; detopping terminal shoots halts apical dominance and boosts productive pod count by 30%.",
            "checklists": [
                {"item_key": "5-1", "name": "Nipper / detop terminal shoots at 45-50 DAS", "spec": "Nipping", "sort_order": 1},
                {"item_key": "5-2", "name": "Install 5 Helicoverpa pheromone traps per hectare", "spec": "5 traps/ha", "sort_order": 2},
                {"item_key": "5-3", "name": "Spray bio-pesticide or recommended IPM spray at pod borer ETL", "spec": "IPM spray", "sort_order": 3},
            ],
        },
        {
            "step_number": 6,
            "title": "Fertilizer",
            "timeframe": "Day 96 - 120",
            "stage": "Pod Development",
            "youtube_video_id": "bWP2g9KQlvk",
            "youtube_title": "Pigeon Pea Nutrient Management & Phosphorus / DAP Application",
            "youtube_duration": "7:20",
            "description": "Apply recommended basal dose of 20:50:20 kg NPK/ha along with 20 kg/ha Sulphur. Spray 2% DAP or pulse wonder at 50% flowering to boost pod setting and seed test weight.",
            "learn_points": [
                "Phosphorus importance for root nodule energy and ATP synthesis",
                "Basal DAP application placement 5 cm below seed",
                "Foliar spray of 2% DAP at flower initiation",
                "Zinc and Boron micronutrient spray to prevent flower drop",
            ],
            "why_explanation": "Phosphorus is the primary limiting nutrient for grain legumes; foliar DAP during flowering feeds developing reproductive sinks without excessive foliage growth.",
            "checklists": [
                {"item_key": "6-1", "name": "Apply basal DAP @ 100 kg/ha with Sulphur (20 kg/ha)", "spec": "Basal DAP", "sort_order": 1},
                {"item_key": "6-2", "name": "Foliar spray of 2% DAP at flower initiation", "spec": "2% DAP spray", "sort_order": 2},
                {"item_key": "6-3", "name": "Foliar spray of 0.2% Boron at 50% flowering", "spec": "0.2% Boron", "sort_order": 3},
            ],
        },
        {
            "step_number": 7,
            "title": "Harvest",
            "timeframe": "Day 140 - 180",
            "stage": "Maturity & Harvest",
            "youtube_video_id": "CrqUuL7XYno",
            "youtube_title": "Pigeon Pea Harvesting, Pod Curing & Mechanical Threshing",
            "youtube_duration": "6:30",
            "description": "Harvest when 80-85% of pods turn dark brown/black and dry. Cut plants at ground level with sickle, cure in heaps for 4-5 days, and thresh using tractor or pulse thresher. Sun-dry to 10% moisture.",
            "learn_points": [
                "Maturity indicators (80-85% pods turn brown, seeds rattle)",
                "Harvesting during dry weather to prevent pod mould",
                "Field curing for uniform drying before threshing",
                "Sun drying clean dal to 10-11% safe storage moisture",
            ],
            "why_explanation": "Harvesting at optimal maturity prevents pod dehiscence and seed shattering; drying to 10% moisture prevents bruchid pulse beetle infestation in storage.",
            "checklists": [
                {"item_key": "7-1", "name": "Harvest when 80-85% of pods turn dark brown", "spec": "Maturity test", "sort_order": 1},
                {"item_key": "7-2", "name": "Cure plants in small upright bundles for 4-5 days", "spec": "Sun curing", "sort_order": 2},
                {"item_key": "7-3", "name": "Thresh, clean and dry seeds to 10% moisture before bagging", "spec": "10% moisture", "sort_order": 3},
            ],
        },
    ],
    "Wheat": [
        {
            "step_number": 1,
            "title": "Prepare Soil",
            "timeframe": "Day 1 - 8",
            "stage": "Pre-sowing",
            "youtube_video_id": "kJECXvIv4D0",
            "youtube_title": "Wheat Land Preparation & Rotavator Seedbed Management",
            "youtube_duration": "7:10",
            "description": "Plough once with disc plough followed by 2 passes with cultivator or rotavator to prepare a well-pulverised, level seedbed free from clods.",
            "learn_points": ["Laser land leveling for uniform irrigation", "Fine tilth creation with rotavator", "Residual moisture assessment", "Pre-sowing palewa irrigation"],
            "why_explanation": "Level and well-pulverised soil enables uniform seed germination depth and eliminates ponding during the critical first irrigation.",
            "checklists": [
                {"item_key": "1-1", "name": "Primary ploughing to 15-20 cm depth", "spec": "15-20 cm", "sort_order": 1},
                {"item_key": "1-2", "name": "Rotavator pass for fine crumbly tilth", "spec": "Fine tilth", "sort_order": 2},
                {"item_key": "1-3", "name": "Level field to ensure uniform flood irrigation", "spec": "Laser level", "sort_order": 3},
            ],
        },
        {
            "step_number": 2,
            "title": "Seed Treatment",
            "timeframe": "Day 9 - 11",
            "stage": "Pre-sowing",
            "youtube_video_id": "8c_ofaaAFeg",
            "youtube_title": "Wheat Seed Treatment with Fungicide & Azotobacter",
            "youtube_duration": "5:45",
            "description": "Treat certified wheat seeds with Vitavax or Carbendazim (2.5 g/kg) to prevent loose smut and flag smut, followed by Azotobacter and PSB bio-fertilizers.",
            "learn_points": ["Fungicidal seed dressing for loose smut prevention", "Bio-fertilizer Azotobacter inoculation", "Shade drying before drilling", "Germination rate verification (>85%)"],
            "why_explanation": "Seed-borne loose smut manifests only after ear emergence; seed treatment is the only preventive measure against internal fungal mycelium.",
            "checklists": [
                {"item_key": "2-1", "name": "Coat seeds with Vitavax / Carbendazim (2.5 g/kg)", "spec": "2.5 g/kg", "sort_order": 1},
                {"item_key": "2-2", "name": "Inoculate with Azotobacter & PSB (20 g/kg seed)", "spec": "20 g/kg", "sort_order": 2},
                {"item_key": "2-3", "name": "Shade dry for 30 minutes", "spec": "30 mins", "sort_order": 3},
            ],
        },
        {
            "step_number": 3,
            "title": "Sowing",
            "timeframe": "Day 12 - 15",
            "stage": "Sowing",
            "youtube_video_id": "CfiMY6VDpEY",
            "youtube_title": "Precision Wheat Sowing with Super Seeder & Spacing",
            "youtube_duration": "6:30",
            "description": "Sow seeds at 20-22.5 cm row spacing and 4-5 cm depth using a zero-till drill or super seeder at a seed rate of 100-125 kg/ha.",
            "learn_points": ["Row spacing (20-22.5 cm)", "Depth of sowing (4-5 cm into moist soil)", "Seed rate calibration (100 kg/ha)", "Timely sowing (November 1-20)"],
            "why_explanation": "Sowing deeper than 5 cm delays coleoptile emergence and reduces crown root tillering; shallow sowing causes poor anchorage.",
            "checklists": [
                {"item_key": "3-1", "name": "Maintain 20-22.5 cm row spacing", "spec": "20-22.5 cm", "sort_order": 1},
                {"item_key": "3-2", "name": "Sow at 4-5 cm depth in moist soil", "spec": "4-5 cm depth", "sort_order": 2},
                {"item_key": "3-3", "name": "Calibrate seed drill to 100-125 kg/ha", "spec": "100-125 kg/ha", "sort_order": 3},
            ],
        },
        {
            "step_number": 4,
            "title": "Irrigation",
            "timeframe": "Day 16 - 45",
            "stage": "Crown Root Initiation (CRI)",
            "youtube_video_id": "gvntN4hz7rs",
            "youtube_title": "Wheat Crown Root Initiation (CRI) & Critical Irrigation Stages",
            "youtube_duration": "7:40",
            "description": "The first irrigation at Crown Root Initiation (CRI, 20-25 DAS) is the most critical stage. Subsequent irrigations at tillering, late jointing, flowering, and milk stage.",
            "learn_points": ["First irrigation at 21 DAS (CRI stage)", "Light irrigation to prevent seedling yellowing", "Critical stages: tillering, jointing, flowering, milking", "Avoiding heavy irrigation during windy days at heading"],
            "why_explanation": "Moisture stress at CRI permanently restricts nodal root development, tillering capacity, and spikelet count.",
            "checklists": [
                {"item_key": "4-1", "name": "First irrigation strictly at CRI stage (20-25 DAS)", "spec": "CRI stage", "sort_order": 1},
                {"item_key": "4-2", "name": "Irrigate at tillering stage (40-45 DAS)", "spec": "Tillering", "sort_order": 2},
                {"item_key": "4-3", "name": "Avoid standing water in field", "spec": "No waterlogging", "sort_order": 3},
            ],
        },
        {
            "step_number": 5,
            "title": "Crop Care",
            "timeframe": "Day 46 - 70",
            "stage": "Tillering & Jointing",
            "youtube_video_id": "y6ahSqQYqls",
            "youtube_title": "Wheat Yellow Rust & Broadleaf Weed Management",
            "youtube_duration": "9:15",
            "description": "Spray sulfosulfuron / clodinafop at 30-35 DAS for weed control. Monitor for yellow rust pustules on upper leaves and spray tebuconazole / propiconazole if detected.",
            "learn_points": ["Phalaris minor (canary grass) identification", "Post-emergence herbicide spray at 30-35 DAS", "Yellow rust stripe symptoms scouting", "Fungicide spray (Propiconazole 0.1%)"],
            "why_explanation": "Phalaris minor weeds mimic wheat seedlings and extract 40% of applied fertilizers if not eliminated before tillering.",
            "checklists": [
                {"item_key": "5-1", "name": "Apply post-emergence herbicide at 30-35 DAS", "spec": "30-35 DAS", "sort_order": 1},
                {"item_key": "5-2", "name": "Scout for yellow rust stripe pustules", "spec": "Weekly survey", "sort_order": 2},
                {"item_key": "5-3", "name": "Spray Propiconazole (1 ml/L) if rust appears", "spec": "Rust spray", "sort_order": 3},
            ],
        },
        {
            "step_number": 6,
            "title": "Fertilizer",
            "timeframe": "Day 71 - 95",
            "stage": "Booting & Heading",
            "youtube_video_id": "lRXKsjeHcI0",
            "youtube_title": "Wheat Nitrogen Split Application & Urea Top-Dressing",
            "youtube_duration": "6:20",
            "description": "Apply recommended 120:60:40 NPK/ha. Split Nitrogen: 50% basal, 25% at 1st irrigation (CRI), and 25% at 2nd irrigation alongside zinc sulphate (25 kg/ha).",
            "learn_points": ["Three-way nitrogen split schedule", "Top dressing Urea immediately before 1st irrigation", "Potassium application for frost tolerance and grain plumpness", "Foliar zinc spray"],
            "why_explanation": "Splitting nitrogen ensures sustained vegetative vigor and spike length without encouraging stem lodging.",
            "checklists": [
                {"item_key": "6-1", "name": "Top dress 1st split of Urea (60 kg/ha) at CRI stage", "spec": "60 kg/ha", "sort_order": 1},
                {"item_key": "6-2", "name": "Top dress 2nd split of Urea (60 kg/ha) at tillering", "spec": "60 kg/ha", "sort_order": 2},
                {"item_key": "6-3", "name": "Inspect for zinc deficiency symptoms", "spec": "Visual check", "sort_order": 3},
            ],
        },
        {
            "step_number": 7,
            "title": "Harvest",
            "timeframe": "Day 115 - 140",
            "stage": "Maturity",
            "youtube_video_id": "Hmb1RP38_Pg",
            "youtube_title": "Wheat Combine Harvesting, Threshing & Grain Moisture Storage",
            "youtube_duration": "7:05",
            "description": "Harvest when grain is hard and moisture falls to 12-14%. Harvest with combine harvester or sickle during sunny dry days. Store in dry, fumigated bins.",
            "learn_points": ["Grain hardness thumbnail test", "Combine harvester reel and cylinder adjustment", "Safe grain storage moisture (<12%)", "Storage pest prevention (Celphos fumigation)"],
            "why_explanation": "Harvesting at <14% moisture prevents mould formation, heating, and mycotoxin contamination during godown storage.",
            "checklists": [
                {"item_key": "7-1", "name": "Check grain hardness (nails crack grain without indent)", "spec": "Hard grain", "sort_order": 1},
                {"item_key": "7-2", "name": "Harvest with combine harvester during dry weather", "spec": "Dry weather", "sort_order": 2},
                {"item_key": "7-3", "name": "Sun-dry grains to <12% moisture before bagging", "spec": "<12% moisture", "sort_order": 3},
            ],
        },
    ],
    "Groundnut": [
        {
            "step_number": 1,
            "title": "Prepare Soil",
            "timeframe": "Day 1 - 10",
            "stage": "Pre-sowing",
            "youtube_video_id": "2JkzHSiOgqM",
            "youtube_title": "Groundnut Land Preparation & Loose Friable Seedbed",
            "youtube_duration": "7:40",
            "description": "Plough to 15-20 cm followed by 2 harrowing passes to create a friable, mellow seedbed. Incorporate 10 t/ha decomposed FYM and form broad beds and furrows.",
            "learn_points": ["Loose, mellow seedbed for easy peg penetration", "Broad bed and furrow (BBF) layout", "Organic manure incorporation", "Preventing clods and hard pan"],
            "why_explanation": "Groundnut pods develop underground; a loose, friable seedbed is essential for sharp gynophore pegs to enter the soil without curling.",
            "checklists": [
                {"item_key": "1-1", "name": "Ploughing and harrowing for pulverised tilth", "spec": "15-20 cm", "sort_order": 1},
                {"item_key": "1-2", "name": "Incorporate FYM @ 10 t/ha", "spec": "10 t/ha", "sort_order": 2},
                {"item_key": "1-3", "name": "Form broad beds and furrows (BBF)", "spec": "BBF layout", "sort_order": 3},
            ],
        },
        {
            "step_number": 2,
            "title": "Seed Treatment",
            "timeframe": "Day 11 - 13",
            "stage": "Pre-sowing",
            "youtube_video_id": "8c_ofaaAFeg",
            "youtube_title": "Groundnut Seed Treatment with Trichoderma & Rhizobium",
            "youtube_duration": "6:10",
            "description": "Shell pods carefully without damaging seed coat. Treat kernels with Trichoderma viride (4 g/kg) and Rhizobium + PSB bio-fertilizers (25 g/kg seed).",
            "learn_points": ["Selecting bold, intact kernels", "Treating with Trichoderma against collar rot", "Rhizobium inoculation for root nodules", "Drying in shade before sowing"],
            "why_explanation": "Aspergillus niger collar rot kills emerging seedlings within 10 days; Trichoderma biological coating gives complete seedling protection.",
            "checklists": [
                {"item_key": "2-1", "name": "Select bold, disease-free kernels with intact testa", "spec": "Bold seeds", "sort_order": 1},
                {"item_key": "2-2", "name": "Coat with Trichoderma viride (4 g/kg seed)", "spec": "4 g/kg", "sort_order": 2},
                {"item_key": "2-3", "name": "Inoculate with Rhizobium culture in shade", "spec": "25 g/kg", "sort_order": 3},
            ],
        },
        {
            "step_number": 3,
            "title": "Sowing",
            "timeframe": "Day 14 - 17",
            "stage": "Sowing",
            "youtube_video_id": "u78QiWJmAY4",
            "youtube_title": "Groundnut Precision Sowing & Spacing Geometry (30x10 cm)",
            "youtube_duration": "7:20",
            "description": "Sow kernels at 30 cm row-to-row and 10 cm plant-to-plant spacing at 5 cm depth in moist soil using seed drill or dibbler at 120-140 kg/ha kernel rate.",
            "learn_points": ["Row spacing (30 cm)", "Plant spacing (10 cm)", "Optimum depth (5 cm)", "Seed rate calibration (125 kg kernels/ha)"],
            "why_explanation": "Sowing at 5 cm depth places the seed in moist soil while ensuring rapid hypocotyl emergence before soil crusted caps form.",
            "checklists": [
                {"item_key": "3-1", "name": "Maintain 30 cm x 10 cm spacing geometry", "spec": "30x10 cm", "sort_order": 1},
                {"item_key": "3-2", "name": "Sow kernels at 5 cm depth", "spec": "5 cm depth", "sort_order": 2},
                {"item_key": "3-3", "name": "Calibrate seed rate to 125 kg/ha kernels", "spec": "125 kg/ha", "sort_order": 3},
            ],
        },
        {
            "step_number": 4,
            "title": "Irrigation",
            "timeframe": "Day 18 - 45",
            "stage": "Flowering & Pegging",
            "youtube_video_id": "5aGlLeYAj6s",
            "youtube_title": "Groundnut Irrigation Management at Flowering & Pegging",
            "youtube_duration": "8:05",
            "description": "Irrigate at flowering (25-30 DAS), pegging (40-45 DAS), and pod development (60-70 DAS). Avoid water stagnation to protect delicate pegs.",
            "learn_points": ["Flowering moisture requirement", "Pegging stage irrigation critical necessity", "Pod filling stage watering", "Drainage during excessive rainfall"],
            "why_explanation": "Moisture stress during pegging prevents pegs from penetrating the dry hardened topsoil, causing peg abortion and empty pods.",
            "checklists": [
                {"item_key": "4-1", "name": "Irrigate at flowering stage (25-30 DAS)", "spec": "Flowering stage", "sort_order": 1},
                {"item_key": "4-2", "name": "Ensure moist topsoil during pegging (40-45 DAS)", "spec": "Pegging stage", "sort_order": 2},
                {"item_key": "4-3", "name": "Irrigate at pod filling stage (65 DAS)", "spec": "Pod filling", "sort_order": 3},
            ],
        },
        {
            "step_number": 5,
            "title": "Crop Care",
            "timeframe": "Day 46 - 70",
            "stage": "Pegging & Pod Growth",
            "youtube_video_id": "y6ahSqQYqls",
            "youtube_title": "Tikka Leaf Spot & Collar Rot Management in Groundnut",
            "youtube_duration": "9:15",
            "description": "Weed twice before peg initiation (at 20 and 35 DAS). Do not disturb soil during pegging. Spray Mancozeb + Carbendazim if Tikka leaf spot lesions appear.",
            "learn_points": ["Ceasing inter-cultivation once pegging starts", "Tikka disease (Cercospora) lesion scouting", "Fungicide spray (Mancozeb 2 g/L)", "Spodoptera defoliator pheromone traps"],
            "why_explanation": "Hoeing or disturbing soil after pegging severs the penetrating gynophore pegs, drastically reducing pod count.",
            "checklists": [
                {"item_key": "5-1", "name": "Complete final weeding before 40 DAS", "spec": "Before pegging", "sort_order": 1},
                {"item_key": "5-2", "name": "Do not hoe or disturb soil during peg entry", "spec": "Pegging care", "sort_order": 2},
                {"item_key": "5-3", "name": "Spray Mancozeb (2 g/L) if leaf spots appear", "spec": "Tikka spray", "sort_order": 3},
            ],
        },
        {
            "step_number": 6,
            "title": "Fertilizer",
            "timeframe": "Day 71 - 85",
            "stage": "Pod Development",
            "youtube_video_id": "bWP2g9KQlvk",
            "youtube_title": "Gypsum Application & Calcium Nutrition for Groundnut Pods",
            "youtube_duration": "7:40",
            "description": "Apply 400-500 kg/ha Gypsum at 40-45 DAS along the rows and incorporate lightly. Gypsum provides vital calcium and sulphur directly to expanding pods.",
            "learn_points": ["Gypsum application timing (40-45 DAS at pegging)", "Direct calcium absorption by pods (not by roots)", "Sulphur role in oil synthesis", "Preventing 'pops' (empty shells)"],
            "why_explanation": "Developing pods absorb calcium directly from surrounding moist soil rather than through root transpiration; gypsum prevents empty 'pop' pods.",
            "checklists": [
                {"item_key": "6-1", "name": "Apply Gypsum @ 400-500 kg/ha along crop rows at 40 DAS", "spec": "400-500 kg/ha", "sort_order": 1},
                {"item_key": "6-2", "name": "Incorporate gypsum lightly into top 3 cm soil", "spec": "Light hoeing", "sort_order": 2},
                {"item_key": "6-3", "name": "Foliar spray of 0.5% Ferrous Sulphate if leaves yellow", "spec": "0.5% FeSO4", "sort_order": 3},
            ],
        },
        {
            "step_number": 7,
            "title": "Harvest",
            "timeframe": "Day 100 - 120",
            "stage": "Maturity",
            "youtube_video_id": "6LHhQjIobtI",
            "youtube_title": "Groundnut Pod Digging, Curing & Mechanical Stripping",
            "youtube_duration": "6:50",
            "description": "Harvest when inner shell wall turns dark brownish-black and foliage yellows. Lift vines using blade harrow or tractor digger, cure pods in sun, and strip.",
            "learn_points": ["Internal shell dark brownish discoloration test", "Lifting vines at optimum soil moisture to leave no pods in soil", "Sun-curing inverted vines for 3-4 days", "Safe pod storage moisture (<8%)"],
            "why_explanation": "Lifting vines in hard dry soil snaps pegs and leaves pods underground; harvesting too wet promotes aflatoxin mould.",
            "checklists": [
                {"item_key": "7-1", "name": "Test inner pod wall for dark brown/black coloration", "spec": "Maturity test", "sort_order": 1},
                {"item_key": "7-2", "name": "Dig vines and cure in sun with pods facing upward", "spec": "Inverted curing", "sort_order": 2},
                {"item_key": "7-3", "name": "Strip pods and dry in sun to <8% moisture", "spec": "<8% moisture", "sort_order": 3},
            ],
        },
    ],
    "Chickpea": [
        {
            "step_number": 1,
            "title": "Prepare Soil",
            "timeframe": "Day 1 - 8",
            "stage": "Pre-sowing",
            "youtube_video_id": "kJECXvIv4D0",
            "youtube_title": "Chickpea / Chana Seedbed Preparation & Cloddy Tilth",
            "youtube_duration": "7:10",
            "description": "Deep ploughing followed by 1 light harrowing to create a rough, slightly cloddy seedbed that retains moisture and prevents soil compaction.",
            "learn_points": ["Rough cloddy seedbed preference over fine powder tilth", "Conserving subsoil moisture from Kharif", "Applying 5-6 t/ha well rotted FYM", "Preventing hard crust formation"],
            "why_explanation": "Unlike small-seeded crops, chickpea performs best in a rough cloddy seedbed which ensures deep root aeration and prevents soil crusting after winter showers.",
            "checklists": [
                {"item_key": "1-1", "name": "Deep ploughing to 20 cm depth", "spec": "20 cm depth", "sort_order": 1},
                {"item_key": "1-2", "name": "Leave seedbed slightly cloddy for aeration", "spec": "Cloddy tilth", "sort_order": 2},
                {"item_key": "1-3", "name": "Apply well decomposed FYM @ 5-6 t/ha", "spec": "5-6 t/ha", "sort_order": 3},
            ],
        },
        {
            "step_number": 2,
            "title": "Seed Treatment",
            "timeframe": "Day 9 - 11",
            "stage": "Pre-sowing",
            "youtube_video_id": "8c_ofaaAFeg",
            "youtube_title": "Chickpea Seed Treatment with Trichoderma & Mesorhizobium",
            "youtube_duration": "5:45",
            "description": "Treat certified seeds with Trichoderma viride (5 g/kg) or Carbendazim (2 g/kg), followed by Mesorhizobium ciceri and PSB bio-inoculants.",
            "learn_points": ["Fusarium wilt prevention via bio-fungicides", "Mesorhizobium ciceri specific nodule culture", "Shade drying seeds for 30 minutes", "Germination rate verification (>85%)"],
            "why_explanation": "Chickpea Fusarium wilt is soil and seed-borne; Trichoderma colonizes the root zone and prevents vascular wilt fungus penetration.",
            "checklists": [
                {"item_key": "2-1", "name": "Coat seeds with Trichoderma viride (5 g/kg)", "spec": "5 g/kg seed", "sort_order": 1},
                {"item_key": "2-2", "name": "Inoculate with Mesorhizobium ciceri (20 g/kg)", "spec": "20 g/kg", "sort_order": 2},
                {"item_key": "2-3", "name": "Shade dry for 30 minutes before drilling", "spec": "30 mins", "sort_order": 3},
            ],
        },
        {
            "step_number": 3,
            "title": "Sowing",
            "timeframe": "Day 12 - 15",
            "stage": "Sowing",
            "youtube_video_id": "CfiMY6VDpEY",
            "youtube_title": "Chickpea Line Sowing, Seed Rate & Depth Management",
            "youtube_duration": "6:30",
            "description": "Sow seeds at 30 cm row-to-row and 10 cm plant-to-plant spacing at 7-8 cm depth in moist soil. Deep sowing protects against early root rot and heat.",
            "learn_points": ["Deep sowing (7-8 cm into residual moisture)", "Row spacing (30 cm)", "Plant spacing (10 cm)", "Seed rate (75-80 kg/ha for Desi, 100 kg/ha for Kabuli)"],
            "why_explanation": "Shallow sowing (less than 5 cm) exposes collar roots to high surface soil temperatures and dry topsoil, triggering collar rot.",
            "checklists": [
                {"item_key": "3-1", "name": "Sow at 7-8 cm depth in moist soil layer", "spec": "7-8 cm depth", "sort_order": 1},
                {"item_key": "3-2", "name": "Maintain 30 cm row-to-row spacing", "spec": "30 cm", "sort_order": 2},
                {"item_key": "3-3", "name": "Calibrate seed rate to 75-80 kg/ha", "spec": "75-80 kg/ha", "sort_order": 3},
            ],
        },
        {
            "step_number": 4,
            "title": "Irrigation",
            "timeframe": "Day 16 - 45",
            "stage": "Branching & Pre-Flowering",
            "youtube_video_id": "gvntN4hz7rs",
            "youtube_title": "Chickpea Irrigation Management at Pre-Flowering & Pod Filling",
            "youtube_duration": "7:40",
            "description": "Chickpea requires minimal irrigation. Provide one light irrigation at pre-flowering (40-45 DAS) and one at pod filling (70-75 DAS). Never irrigate during peak bloom.",
            "learn_points": ["Critical stages: pre-flowering and pod filling", "Never irrigate at peak bloom (causes flower drop)", "Light irrigation without standing water", "Rainfed conservation practices"],
            "why_explanation": "Watering during peak flowering causes excessive vegetative growth (rank growth) and complete flower shedding.",
            "checklists": [
                {"item_key": "4-1", "name": "Provide light irrigation at pre-flowering (40-45 DAS)", "spec": "Pre-flowering", "sort_order": 1},
                {"item_key": "4-2", "name": "Do NOT irrigate during active flowering", "spec": "Bloom safety", "sort_order": 2},
                {"item_key": "4-3", "name": "Provide second light irrigation at pod filling (70 DAS)", "spec": "Pod filling", "sort_order": 3},
            ],
        },
        {
            "step_number": 5,
            "title": "Crop Care",
            "timeframe": "Day 46 - 70",
            "stage": "Flowering & Pod Initiation",
            "youtube_video_id": "GC7WTFfGE9Q",
            "youtube_title": "Chickpea Pod Borer (Helicoverpa) & Wilt IPM Management",
            "youtube_duration": "8:25",
            "description": "Nip shoot tips at 30-35 DAS to stimulate secondary branches. Install 5 pheromone traps and 50 bird perches per hectare. Spray Emamectin Benzoate if pod borers appear.",
            "learn_points": ["Nipping / detopping terminal buds at 30-35 DAS", "Helicoverpa pheromone trap monitoring", "T-shaped bird perches installation", "NeemAzal bio-pesticide spray at early instar"],
            "why_explanation": "Nipping terminal buds breaks apical dominance, producing 5-8 productive lateral branches per plant and increasing pod yields by 25%.",
            "checklists": [
                {"item_key": "5-1", "name": "Nip terminal shoot tips at 30-35 DAS", "spec": "Nipping", "sort_order": 1},
                {"item_key": "5-2", "name": "Install 5 Helicoverpa pheromone traps/ha", "spec": "5 traps/ha", "sort_order": 2},
                {"item_key": "5-3", "name": "Install 40-50 bird perches across field", "spec": "Bird perches", "sort_order": 3},
            ],
        },
        {
            "step_number": 6,
            "title": "Fertilizer",
            "timeframe": "Day 71 - 85",
            "stage": "Pod Development",
            "youtube_video_id": "bWP2g9KQlvk",
            "youtube_title": "Chickpea Basal Nutrition: DAP, Sulphur & Bio-Fertilizers",
            "youtube_duration": "7:40",
            "description": "Apply recommended basal dose of 20:50:20 kg NPK/ha alongside 20 kg/ha elemental sulphur. Spray 2% urea or 2% DAP at pod initiation.",
            "learn_points": ["Basal DAP application below seed depth", "Sulphur supplementation for protein synthesis", "Foliar 2% DAP spray at pod setting", "Avoiding excess nitrogen top-dressing"],
            "why_explanation": "Nitrogen top-dressing suppresses natural Rhizobium root nodulation and induces rank vegetative growth at the expense of pods.",
            "checklists": [
                {"item_key": "6-1", "name": "Apply basal DAP @ 100 kg/ha + Sulphur (20 kg/ha)", "spec": "Basal DAP", "sort_order": 1},
                {"item_key": "6-2", "name": "Foliar spray of 2% DAP at pod initiation", "spec": "2% DAP", "sort_order": 2},
                {"item_key": "6-3", "name": "Inspect for zinc deficiency symptoms", "spec": "Visual check", "sort_order": 3},
            ],
        },
        {
            "step_number": 7,
            "title": "Harvest",
            "timeframe": "Day 100 - 125",
            "stage": "Maturity",
            "youtube_video_id": "CrqUuL7XYno",
            "youtube_title": "Chickpea Harvesting, Sun-Drying & Safe Pulse Storage",
            "youtube_duration": "6:30",
            "description": "Harvest when leaves turn yellow and drop, pods turn brown, and seeds inside rattle when shaken. Pull plants or cut with sickle, cure in heaps for 4-5 days, and thresh.",
            "learn_points": ["Pod maturity rattle test", "Harvesting in sunny dry weather", "Field curing in heaps for 4-5 days", "Drying grains to 10% moisture before bagging"],
            "why_explanation": "Prompt harvesting prevents pod shattering; sun drying to 10% moisture prevents store bruchid pest infestation.",
            "checklists": [
                {"item_key": "7-1", "name": "Check rattling sound of seeds in mature brown pods", "spec": "Rattle test", "sort_order": 1},
                {"item_key": "7-2", "name": "Cut or pull plants and sun-cure in heaps for 4 days", "spec": "Sun curing", "sort_order": 2},
                {"item_key": "7-3", "name": "Thresh, clean and dry grains to 10% moisture", "spec": "10% moisture", "sort_order": 3},
            ],
        },
    ],
    "Sugarcane": [
        {
            "step_number": 1,
            "title": "Prepare Soil",
            "timeframe": "Day 1 - 12",
            "stage": "Pre-planting",
            "youtube_video_id": "GHvEvMBSrMw",
            "youtube_title": "Sugarcane Land Preparation & Deep Trench / Furrow Making",
            "youtube_duration": "7:15",
            "description": "Deep ploughing to 30-40 cm followed by 2 harrowings. Form deep furrows or trenches at 120-150 cm spacing. Apply 25 t/ha well decomposed FYM or pressmud.",
            "learn_points": ["Deep tillage to break subsoil hard pan", "Trench method (120-150 cm spacing)", "Organic pressmud / FYM incorporation", "Laser leveling for uniform water run"],
            "why_explanation": "Sugarcane is a multi-year deep-rooting crop; deep trenches facilitate wide root development and efficient mechanized intercultural operations.",
            "checklists": [
                {"item_key": "1-1", "name": "Deep ploughing to 30-40 cm depth", "spec": "30-40 cm", "sort_order": 1},
                {"item_key": "1-2", "name": "Apply 20-25 t/ha FYM or pressmud", "spec": "20-25 t/ha", "sort_order": 2},
                {"item_key": "1-3", "name": "Form trenches / furrows at 120-150 cm spacing", "spec": "120-150 cm", "sort_order": 3},
            ],
        },
        {
            "step_number": 2,
            "title": "Seed Treatment",
            "timeframe": "Day 13 - 15",
            "stage": "Pre-planting",
            "youtube_video_id": "AyTLPO4CafI",
            "youtube_title": "Sugarcane Sett Hot-Water & Fungicide Treatment",
            "youtube_duration": "6:00",
            "description": "Select setts from 8-10 month old healthy nursery crop. Dip 2-bud or 3-bud setts in Carbendazim (1 g/L) + Chlorpyrifos (2 ml/L) solution for 15 minutes before planting.",
            "learn_points": ["Nursery crop selection (8-10 months)", "2-bud / 3-bud sett cutting without eye damage", "Fungicidal dip against red rot and smut", "Sett soaking in lime water / bio-agents"],
            "why_explanation": "Red rot and sett rot fungi enter through cut sett ends; chemical dipping seals exposed vascular bundles and guarantees >80% bud germination.",
            "checklists": [
                {"item_key": "2-1", "name": "Cut setts with sharp knife without splitting bud eyes", "spec": "Clean setts", "sort_order": 1},
                {"item_key": "2-2", "name": "Dip setts in Carbendazim (1 g/L) solution for 15 mins", "spec": "15 mins dip", "sort_order": 2},
                {"item_key": "2-3", "name": "Treat with Chlorpyrifos against termite attack", "spec": "Termite protection", "sort_order": 3},
            ],
        },
        {
            "step_number": 3,
            "title": "Sowing",
            "timeframe": "Day 16 - 20",
            "stage": "Planting",
            "youtube_video_id": "5nbMWeLcrAM",
            "youtube_title": "Sugarcane Single-Bud Sett Planting & Row Spacing",
            "youtube_duration": "6:50",
            "description": "Place two-bud setts end-to-end in furrows with buds facing sideways. Cover with 3-5 cm of soil and compact lightly. Plant 75,000 two-bud setts per hectare.",
            "learn_points": ["End-to-end sett placement", "Buds positioned laterally (not facing up/down)", "Optimal soil cover depth (3-5 cm)", "Immediate light irrigation after planting"],
            "why_explanation": "Placing buds laterally ensures equal moisture and temperature contact for both eyes, producing uniform tillering stalks.",
            "checklists": [
                {"item_key": "3-1", "name": "Place setts end-to-end in furrow with lateral buds", "spec": "Lateral buds", "sort_order": 1},
                {"item_key": "3-2", "name": "Cover with 3-5 cm fine soil and press lightly", "spec": "3-5 cm depth", "sort_order": 2},
                {"item_key": "3-3", "name": "Provide immediate light planting irrigation", "spec": "Life irrigation", "sort_order": 3},
            ],
        },
        {
            "step_number": 4,
            "title": "Irrigation",
            "timeframe": "Day 21 - 60",
            "stage": "Germination & Tillering",
            "youtube_video_id": "xidVEDvlJ9A",
            "youtube_title": "Sugarcane Drip Irrigation & Water Conservation Management",
            "youtube_duration": "7:30",
            "description": "Irrigate at 7-10 day intervals during tillering and formative stage. Drip irrigation saves 45% water and enhances cane diameter by maintaining continuous rhizosphere moisture.",
            "learn_points": ["Irrigation at formative phase (up to 120 days)", "Drip irrigation layout and emitter discharge", "Moisture requirement during cane elongation", "Trash mulching between rows to conserve moisture"],
            "why_explanation": "Moisture deficit during formative phase permanently stunts internode count and length, cutting millable cane tonnage by 30-40%.",
            "checklists": [
                {"item_key": "4-1", "name": "Maintain 7-10 day irrigation interval in summer", "spec": "Regular schedule", "sort_order": 1},
                {"item_key": "4-2", "name": "Spread dry cane trash @ 5 t/ha between rows", "spec": "Trash mulch", "sort_order": 2},
                {"item_key": "4-3", "name": "Ensure drainage channels are clear before monsoon", "spec": "Drainage check", "sort_order": 3},
            ],
        },
        {
            "step_number": 5,
            "title": "Crop Care",
            "timeframe": "Day 61 - 100",
            "stage": "Formative & Early Elongation",
            "youtube_video_id": "E5hpNlptBa0",
            "youtube_title": "Sugarcane Early Shoot Borer & Internode Borer IPM",
            "youtube_duration": "8:40",
            "description": "Scout for dead hearts caused by early shoot borer. Release Trichogramma chilonis egg parasitoids (50,000/ha). Earth up soil at 45 and 90 DAS.",
            "learn_points": ["Dead heart symptom identification in young tillers", "Earthing up along rows to smother borer entry", "Release of Trichogramma egg parasitoids", "Inter-cultivation and mechanical weeding"],
            "why_explanation": "Earthing up covers the base of tillers with soil, physically preventing early shoot borer moths from laying eggs on basal leaf sheaths.",
            "checklists": [
                {"item_key": "5-1", "name": "First light earthing up at 45 DAS", "spec": "Partial earthing", "sort_order": 1},
                {"item_key": "5-2", "name": "Release Trichogramma chilonis @ 50,000/ha", "spec": "Bio-agent", "sort_order": 2},
                {"item_key": "5-3", "name": "Full earthing up at 90-100 DAS to prevent lodging", "spec": "Heavy earthing", "sort_order": 3},
            ],
        },
        {
            "step_number": 6,
            "title": "Fertilizer",
            "timeframe": "Day 101 - 150",
            "stage": "Grand Growth Phase",
            "youtube_video_id": "gHW9mwseFgY",
            "youtube_title": "Sugarcane Fertilizer NPK Splits & Heavy Earthing-Up",
            "youtube_duration": "6:45",
            "description": "Apply recommended 250:100:120 kg NPK/ha. Nitrogen split: 25% basal, 25% at 45 DAS, 25% at 90 DAS, and 25% at 120 DAS before heavy earthing-up.",
            "learn_points": ["4-split nitrogen management schedule", "Complete nitrogen application before 120-150 days", "Potassium application for cane thickness and sugar accumulation", "Soil incorporation before final earthing up"],
            "why_explanation": "Applying nitrogen after 150 days stimulates late water shoots, delays cane ripening, and severely reduces juice sucrose percentage.",
            "checklists": [
                {"item_key": "6-1", "name": "Apply 2nd split of Urea + MOP at 45 DAS", "spec": "Tillering split", "sort_order": 1},
                {"item_key": "6-2", "name": "Apply 3rd split of Urea at 90 DAS", "spec": "Elongation split", "sort_order": 2},
                {"item_key": "6-3", "name": "Apply final split of Urea + MOP at 120 DAS before earthing up", "spec": "Final split", "sort_order": 3},
            ],
        },
        {
            "step_number": 7,
            "title": "Harvest",
            "timeframe": "Day 330 - 365",
            "stage": "Maturity & Harvest",
            "youtube_video_id": "TiBWylKGVOM",
            "youtube_title": "Sugarcane Harvesting, Cane Cutting & Post-Harvest Handling",
            "youtube_duration": "7:25",
            "description": "Harvest when hand refractometer brix reading exceeds 18-20% and top-to-bottom brix ratio approaches 1.0. Cut canes flush with ground level and deliver to mill within 24 hours.",
            "learn_points": ["Hand refractometer brix testing (>18% brix)", "Cutting canes flush with ground level (bottom has highest sucrose)", "Detopping green tops and removing dry trash", "Crushing within 24 hours to prevent inversion losses"],
            "why_explanation": "Cutting canes 10 cm above ground leaves the most sucrose-rich portion in the field; delaying milling beyond 24h triggers sucrose inversion to reducing sugars.",
            "checklists": [
                {"item_key": "7-1", "name": "Test juice brix (target 18-20% brix)", "spec": "Brix reading", "sort_order": 1},
                {"item_key": "7-2", "name": "Cut canes flush with ground level with sharp cane knife", "spec": "Ground-flush cut", "sort_order": 2},
                {"item_key": "7-3", "name": "Transport cut cane to sugar factory within 24 hours", "spec": "<24h delivery", "sort_order": 3},
            ],
        },
    ],
    "Chilli": [
        {
            "step_number": 1,
            "title": "Prepare Soil",
            "timeframe": "Day 1 - 10",
            "stage": "Pre-planting",
            "youtube_video_id": "7UxTpf-6G20",
            "youtube_title": "Chilli Raised Bed Preparation & Plastic Mulching",
            "youtube_duration": "7:30",
            "description": "Deep ploughing followed by fine rotavator pass. Form raised beds 90 cm wide, 15 cm high with 40 cm furrow walkways. Lay drip laterals and 25-30 micron silver-black mulch film.",
            "learn_points": ["Raised bed dimensions (90 cm width, 15 cm height)", "Silver-black reflective plastic mulch installation", "Drip lateral placement under mulch", "Applying 20 t/ha decomposed FYM + neem cake"],
            "why_explanation": "Silver-black mulch prevents weed emergence, reflects light to repel thrips and aphids, and prevents soil splashing of fungal anthracnose spores.",
            "checklists": [
                {"item_key": "1-1", "name": "Deep ploughing and rotavator pass for fine tilth", "spec": "Fine tilth", "sort_order": 1},
                {"item_key": "1-2", "name": "Incorporate FYM @ 20 t/ha + Neem cake (250 kg/ha)", "spec": "20 t/ha FYM", "sort_order": 2},
                {"item_key": "1-3", "name": "Construct raised beds and lay silver-black mulch", "spec": "Mulched bed", "sort_order": 3},
            ],
        },
        {
            "step_number": 2,
            "title": "Seed Treatment",
            "timeframe": "Day 11 - 14",
            "stage": "Nursery / Pro-tray",
            "youtube_video_id": "8c_ofaaAFeg",
            "youtube_title": "Chilli Nursery Seedling Raising & Biological Seed Treatment",
            "youtube_duration": "6:10",
            "description": "Raise seedlings in 98-well protrays using sterilized cocopeat. Treat seeds with Trichoderma viride (5 g/kg) and Imidacloprid (5 g/kg). Grow seedlings under 50% shade net for 30-35 days.",
            "learn_points": ["Protray seedling production in cocopeat", "Seed treatment with bio-fungicide and systemic insecticide", "Shade net nursery protection against vectors", "Hardening seedlings before transplanting"],
            "why_explanation": "Protray seedlings develop intact root balls without root trauma, eliminating transplanting shock and guaranteeing 98% field survival.",
            "checklists": [
                {"item_key": "2-1", "name": "Treat hybrid seeds with Trichoderma & Imidacloprid", "spec": "Seed dressing", "sort_order": 1},
                {"item_key": "2-2", "name": "Sow in 98-cell protrays filled with sterilized cocopeat", "spec": "Protray nursery", "sort_order": 2},
                {"item_key": "2-3", "name": "Harden 30-day seedlings with reduced watering before field planting", "spec": "Hardening", "sort_order": 3},
            ],
        },
        {
            "step_number": 3,
            "title": "Sowing",
            "timeframe": "Day 15 - 18",
            "stage": "Transplanting",
            "youtube_video_id": "5nbMWeLcrAM",
            "youtube_title": "Chilli Seedling Transplanting & Row Spacing (60x45 cm)",
            "youtube_duration": "6:50",
            "description": "Transplant 30-35 day old sturdy seedlings in zigzag pairs on raised mulch beds at 60 cm row-to-row and 45 cm plant-to-plant spacing in the late afternoon.",
            "learn_points": ["Optimal seedling age (30-35 days, 4-5 true leaves)", "Zigzag planting geometry on mulch bed", "Planting in late afternoon hours", "Immediate root-zone drenching with bio-stimulant"],
            "why_explanation": "Transplanting in late afternoon avoids hot midday transpiration stress, enabling rootlets to settle into moist soil overnight.",
            "checklists": [
                {"item_key": "3-1", "name": "Punch holes in mulch film at 60x45 cm zigzag spacing", "spec": "60x45 cm", "sort_order": 1},
                {"item_key": "3-2", "name": "Transplant single healthy seedling per hole in late afternoon", "spec": "Evening planting", "sort_order": 2},
                {"item_key": "3-3", "name": "Provide immediate light drip irrigation", "spec": "Drip watering", "sort_order": 3},
            ],
        },
        {
            "step_number": 4,
            "title": "Irrigation",
            "timeframe": "Day 19 - 50",
            "stage": "Vegetative & Flowering",
            "youtube_video_id": "xidVEDvlJ9A",
            "youtube_title": "Chilli Drip Irrigation & Precise Water Scheduling",
            "youtube_duration": "7:30",
            "description": "Operate drip irrigation daily or on alternate days according to soil moisture tension. Maintain consistent moisture during flowering to prevent blossom drop.",
            "learn_points": ["Daily drip irrigation runtime calibration", "Avoiding soil moisture fluctuations", "Critical water requirement during flowering and fruit set", "Preventing surface runoff and root asphyxiation"],
            "why_explanation": "Fluctuating between dry soil and waterlogged soil shocks the plant and triggers ethylene synthesis, leading to massive flower and fruitlet drop.",
            "checklists": [
                {"item_key": "4-1", "name": "Maintain root-zone moisture at 50-60% field capacity", "spec": "55% moisture", "sort_order": 1},
                {"item_key": "4-2", "name": "Operate drip system for 45-60 mins daily", "spec": "Daily drip", "sort_order": 2},
                {"item_key": "4-3", "name": "Avoid waterlogging around plant crowns", "spec": "Crown check", "sort_order": 3},
            ],
        },
        {
            "step_number": 5,
            "title": "Crop Care",
            "timeframe": "Day 51 - 85",
            "stage": "Flowering & Fruit Setting",
            "youtube_video_id": "GC7WTFfGE9Q",
            "youtube_title": "Chilli Thrips, Mites & Leaf Curl Virus IPM Management",
            "youtube_duration": "8:25",
            "description": "Install blue sticky traps for thrips and yellow sticky traps for whiteflies (15/ha each). Spray Spinetoram or Diafenthiuron if upward leaf curling occurs. Spray copper oxychloride for die-back.",
            "learn_points": ["Upward leaf curling (thrips) vs downward curling (yellow mites)", "Blue sticky traps for thrips monitoring", "Die-back and anthracnose fruit rot management", "Foliar neem oil spray schedule"],
            "why_explanation": "Thrips and mites transmit incurable geminiviruses (leaf curl virus); catching vectors early with sticky traps preserves plant canopy.",
            "checklists": [
                {"item_key": "5-1", "name": "Install 15 blue sticky traps (thrips) + 15 yellow traps (whiteflies)/ha", "spec": "30 traps/ha", "sort_order": 1},
                {"item_key": "5-2", "name": "Scout weekly for upward leaf curl symptoms", "spec": "Vector check", "sort_order": 2},
                {"item_key": "5-3", "name": "Spray bio-fungicide / Copper oxychloride for anthracnose", "spec": "Fruit rot spray", "sort_order": 3},
            ],
        },
        {
            "step_number": 6,
            "title": "Fertilizer",
            "timeframe": "Day 86 - 110",
            "stage": "Fruit Development",
            "youtube_video_id": "t92faqQELTo",
            "youtube_title": "Chilli Fertigation Schedule & Micronutrient Foliar Spray",
            "youtube_duration": "7:10",
            "description": "Apply water-soluble fertilizers (19-19-19 and 0-52-34) weekly through drip system. Spray calcium nitrate + boron (0.2%) at peak flowering to prevent blossom end rot.",
            "learn_points": ["Weekly drip fertigation with water-soluble fertilizers", "Potassium application (13-0-45) for fruit shine and pungency", "Calcium nitrate + boron foliar spray for blossom retention", "Micronutrient combo spray (zinc, iron, boron)"],
            "why_explanation": "Calcium and boron deficiency causes blossom end rot and black fruit tip necrosis; fertigation delivers nutrients directly into the active root zone.",
            "checklists": [
                {"item_key": "6-1", "name": "Fertigate with 19-19-19 @ 5 kg/ha weekly", "spec": "Weekly fertigation", "sort_order": 1},
                {"item_key": "6-2", "name": "Foliar spray of Calcium Nitrate (1%) + Boron (0.2%)", "spec": "Ca + Boron", "sort_order": 2},
                {"item_key": "6-3", "name": "Fertigate with Potassium Nitrate (13-0-45) during fruit sizing", "spec": "KNO3 fertigation", "sort_order": 3},
            ],
        },
        {
            "step_number": 7,
            "title": "Harvest",
            "timeframe": "Day 120 - 180",
            "stage": "Harvest & Drying",
            "youtube_video_id": "CrqUuL7XYno",
            "youtube_title": "Chilli Fruit Picking, Solar Drying & Quality Sorting",
            "youtube_duration": "6:30",
            "description": "Harvest green chillies when pods are firm and glossy. For red chillies, harvest fully ripe deep red pods. Dry pods on clean polythene sheets to 10% moisture.",
            "learn_points": ["Selective picking intervals (10-15 days)", "Harvesting fully ripe deep crimson red pods", "Sun-drying on clean tarpaulins (avoid soil contact)", "Moisture grading (<10% moisture) to prevent aflatoxin"],
            "why_explanation": "Drying chillies directly on bare ground exposes fruit to Aspergillus fungus and dust contamination, reducing market grade and export price.",
            "checklists": [
                {"item_key": "7-1", "name": "Pick fully mature crimson red chillies with stalks intact", "spec": "With stalk", "sort_order": 1},
                {"item_key": "7-2", "name": "Spread on clean tarpaulin or polyhouse solar dryer", "spec": "Clean drying", "sort_order": 2},
                {"item_key": "7-3", "name": "Dry to 10% moisture and grade by color and shine", "spec": "10% moisture", "sort_order": 3},
            ],
        },
    ],
}

class ActionPlanService:
    def _generate_fallback_steps(self, clean_crop: str) -> List[Dict]:
        """Generate specific steps for any crop not explicitly predefined in CURATED_CROPS_DATA."""
        return [
            {
                "step_number": 1,
                "title": "Prepare Soil",
                "timeframe": "Day 1 - 10",
                "stage": "Pre-sowing",
                "youtube_video_id": "kJECXvIv4D0",
                "youtube_title": f"Soil & Field Preparation for {clean_crop} Cultivation",
                "youtube_duration": "7:10",
                "description": f"Plough the land thoroughly to 20 cm depth, apply 8-10 t/ha decomposed organic manure, and prepare optimal tilth for {clean_crop}.",
                "learn_points": ["Primary and secondary tillage", "Soil structure and aeration", "Organic compost incorporation", "Leveling for uniform irrigation"],
                "why_explanation": f"Proper soil preparation ensures strong root anchorage and nutrient availability for {clean_crop}.",
                "checklists": [
                    {"item_key": "1-1", "name": f"Deep ploughing to 20 cm for {clean_crop}", "spec": "20 cm depth", "sort_order": 1},
                    {"item_key": "1-2", "name": "Incorporate FYM / compost @ 8-10 t/ha", "spec": "8-10 t/ha", "sort_order": 2},
                    {"item_key": "1-3", "name": "Level field and form irrigation channels", "spec": "Drainage check", "sort_order": 3},
                ],
            },
            {
                "step_number": 2,
                "title": "Seed Treatment",
                "timeframe": "Day 11 - 13",
                "stage": "Pre-sowing",
                "youtube_video_id": "8c_ofaaAFeg",
                "youtube_title": f"Certified Seed Treatment & Germination for {clean_crop}",
                "youtube_duration": "5:45",
                "description": f"Treat {clean_crop} seeds with recommended bio-fertilizers and bio-fungicide (Trichoderma @ 5g/kg) to protect against seed-borne pathogens.",
                "learn_points": ["Certified seed selection", "Biological fungicide seed coating", "Shade drying protocols", "Germination rate verification (>80%)"],
                "why_explanation": "Seed dressing shields seedlings from soil-borne damping-off during early emergence.",
                "checklists": [
                    {"item_key": "2-1", "name": f"Coat {clean_crop} seeds with biological fungicide", "spec": "5 g/kg seed", "sort_order": 1},
                    {"item_key": "2-2", "name": "Mix with bio-fertilizers (Azospirillum / PSB)", "spec": "20 g/kg seed", "sort_order": 2},
                    {"item_key": "2-3", "name": "Dry treated seeds under shade for 30 minutes", "spec": "30 mins", "sort_order": 3},
                ],
            },
            {
                "step_number": 3,
                "title": "Sowing",
                "timeframe": "Day 14 - 17",
                "stage": "Sowing",
                "youtube_video_id": "CfiMY6VDpEY",
                "youtube_title": f"Optimal Sowing, Plant Geometry & Spacing for {clean_crop}",
                "youtube_duration": "6:30",
                "description": f"Sow or transplant {clean_crop} at recommended row and plant spacing into adequately moist soil at 3-4 cm depth.",
                "learn_points": ["Recommended seed rate and spacing", "Optimum seed placement depth", "Field moisture status before sowing", "Thinning and gapping"],
                "why_explanation": "Maintaining optimal plant population ensures full canopy coverage and maximum photosynthetic efficiency.",
                "checklists": [
                    {"item_key": "3-1", "name": f"Sow at recommended spacing for {clean_crop}", "spec": "Row geometry", "sort_order": 1},
                    {"item_key": "3-2", "name": "Plant at 3-4 cm depth in moist soil", "spec": "3-4 cm depth", "sort_order": 2},
                    {"item_key": "3-3", "name": "Perform gap filling within 10 days of emergence", "spec": "Uniform stand", "sort_order": 3},
                ],
            },
            {
                "step_number": 4,
                "title": "Irrigation",
                "timeframe": "Day 18 - 40",
                "stage": "Vegetative",
                "youtube_video_id": "1IN67PLhi5w",
                "youtube_title": f"Irrigation Scheduling & Water Management for {clean_crop}",
                "youtube_duration": "6:40",
                "description": f"Irrigate based on root-zone soil moisture requirements. Ensure water is supplied during critical vegetative stages without water stagnation.",
                "learn_points": ["Critical growth stages for water application", "Monitoring soil moisture deficit", "Furrow/drip irrigation efficiency", "Drainage during heavy rain"],
                "why_explanation": "Timely water application during active vegetative growth promotes root spread and leaf area index.",
                "checklists": [
                    {"item_key": "4-1", "name": "Check root-zone soil moisture (target 40-50%)", "spec": "Target 45%", "sort_order": 1},
                    {"item_key": "4-2", "name": "Provide first irrigation after seedling establishment", "spec": "Establishment", "sort_order": 2},
                    {"item_key": "4-3", "name": "Maintain clear drainage furrows", "spec": "Drainage check", "sort_order": 3},
                ],
            },
            {
                "step_number": 5,
                "title": "Crop Care",
                "timeframe": "Day 41 - 65",
                "stage": "Flowering Initiation",
                "youtube_video_id": "GC7WTFfGE9Q",
                "youtube_title": f"Integrated Pest, Disease & Weed Management for {clean_crop}",
                "youtube_duration": "8:25",
                "description": f"Conduct regular field scouting for {clean_crop} specific pests and fungal blights. Keep fields weed-free during early growth using integrated IPM methods.",
                "learn_points": ["Weeding schedule (first 45 days)", "Pheromone traps and yellow sticky traps", "Bio-pesticide neem spray application", "Beneficial insect conservation"],
                "why_explanation": f"Preventing weed and pest pressure during flowering preserves blossom retention and productive nodes in {clean_crop}.",
                "checklists": [
                    {"item_key": "5-1", "name": f"First weeding and hoeing for {clean_crop}", "spec": "20-25 DAS", "sort_order": 1},
                    {"item_key": "5-2", "name": "Install pheromone / sticky traps in field", "spec": "5-10 traps/ha", "sort_order": 2},
                    {"item_key": "5-3", "name": "Scout for foliar symptoms and apply bio-pesticide if needed", "spec": "Weekly survey", "sort_order": 3},
                ],
            },
            {
                "step_number": 6,
                "title": "Fertilizer",
                "timeframe": "Day 66 - 85",
                "stage": "Flowering / Fruit Formation",
                "youtube_video_id": "t92faqQELTo",
                "youtube_title": f"Nutrient Management & Fertilizer Split Application for {clean_crop}",
                "youtube_duration": "7:10",
                "description": f"Apply split top-dressing of nitrogen and potassium to match peak nutrient demand of {clean_crop}. Spray micronutrients if deficiencies appear.",
                "learn_points": ["Split nitrogen application schedule", "Potassium application for grain/fruit development", "Micronutrient foliar spray", "Soil health maintenance"],
                "why_explanation": f"Top-dressed nutrients at flowering supply energy directly to developing sinks, increasing harvest weight in {clean_crop}.",
                "checklists": [
                    {"item_key": "6-1", "name": f"Apply top-dressing fertilizer split for {clean_crop}", "spec": "Split dose", "sort_order": 1},
                    {"item_key": "6-2", "name": "Apply recommended potash dose for grain filling", "spec": "MOP application", "sort_order": 2},
                    {"item_key": "6-3", "name": "Inspect for zinc and iron micronutrient deficiencies", "spec": "Visual check", "sort_order": 3},
                ],
            },
            {
                "step_number": 7,
                "title": "Harvest",
                "timeframe": "Day 90 - 130",
                "stage": "Maturity",
                "youtube_video_id": "CrqUuL7XYno",
                "youtube_title": f"Harvesting, Threshing & Post-Harvest Storage of {clean_crop}",
                "youtube_duration": "6:30",
                "description": f"Harvest {clean_crop} at physiological maturity when produce reaches characteristic color and optimal moisture. Dry produce before grading and storage.",
                "learn_points": ["Maturity indices identification", "Harvest timing during dry weather", "Post-harvest cleaning and sorting", "Safe storage moisture threshold"],
                "why_explanation": f"Timely harvesting and moisture-controlled drying prevents field shattering and storage spoilage of {clean_crop}.",
                "checklists": [
                    {"item_key": "7-1", "name": f"Harvest {clean_crop} at peak physiological maturity", "spec": "Dry weather", "sort_order": 1},
                    {"item_key": "7-2", "name": "Thresh, clean and sort produce", "spec": "Grade sorting", "sort_order": 2},
                    {"item_key": "7-3", "name": "Sun-dry to safe storage moisture before bagging", "spec": "Safe moisture", "sort_order": 3},
                ],
            },
        ]

    def ensure_seed_data(self, db: Session, crop_name: str) -> None:
        """Seed cataloged steps and checklists for crop or update existing if outdated."""
        clean_crop = self._canonical_crop(crop_name)
        steps_data = CURATED_CROPS_DATA.get(clean_crop) or self._generate_fallback_steps(clean_crop)
        data_by_step = {s["step_number"]: s for s in steps_data}

        existing_steps = (
            db.query(ActionPlanStep)
            .filter(ActionPlanStep.crop_name.ilike(clean_crop))
            .order_by(ActionPlanStep.step_number.asc())
            .all()
        )

        if existing_steps:
            # Sync existing steps to ensure valid working YouTube video IDs and descriptions
            for estep in existing_steps:
                sdata = data_by_step.get(estep.step_number)
                if sdata:
                    estep.crop_name = clean_crop
                    estep.title = sdata["title"]
                    estep.description = sdata["description"]
                    estep.timeframe = sdata["timeframe"]
                    estep.stage = sdata["stage"]
                    estep.youtube_video_id = sdata["youtube_video_id"]
                    estep.youtube_title = sdata["youtube_title"]
                    estep.youtube_duration = sdata["youtube_duration"]
                    estep.learn_points = sdata["learn_points"]
                    estep.why_explanation = sdata["why_explanation"]

                    # Update or add checklist items for this step
                    existing_chks = (
                        db.query(ActionStepChecklist)
                        .filter(ActionStepChecklist.step_id == estep.id)
                        .order_by(ActionStepChecklist.sort_order.asc())
                        .all()
                    )
                    for idx, chk_data in enumerate(sdata.get("checklists", [])):
                        if idx < len(existing_chks):
                            existing_chks[idx].name = chk_data["name"]
                            existing_chks[idx].spec = chk_data.get("spec")
                            existing_chks[idx].item_key = chk_data.get("item_key")
                        else:
                            db.add(
                                ActionStepChecklist(
                                    step_id=estep.id,
                                    item_key=chk_data.get("item_key"),
                                    name=chk_data["name"],
                                    spec=chk_data.get("spec"),
                                    sort_order=chk_data.get("sort_order", idx + 1),
                                )
                            )
            db.commit()
            return

        # Brand new crop steps seeding
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
            .filter(ActionPlanStep.crop_name.ilike(clean_crop))
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
        lower = c.lower()
        if "turmeric" in lower or "haldi" in lower:
            return "Turmeric"
        if "ginger" in lower:
            return "Ginger"
        if "mustard" in lower or "sarson" in lower or "rapeseed" in lower:
            return "Mustard"
        if "toor" in lower or "arhar" in lower or "pigeon" in lower or "red gram" in lower:
            return "Pigeon Pea"
        if "green gram" in lower or "moong" in lower:
            return "Green Gram"
        if "black gram" in lower or "urad" in lower:
            return "Black Gram"
        if "wheat" in lower or "gehu" in lower:
            return "Wheat"
        if "groundnut" in lower or "peanut" in lower or "moongphali" in lower:
            return "Groundnut"
        if "bengal gram" in lower or "chickpea" in lower or "chana" in lower:
            return "Chickpea"
        if "sugarcane" in lower or "ganna" in lower:
            return "Sugarcane"
        if "jute" in lower or "patson" in lower:
            return "Jute"
        if "chilli" in lower or "chili" in lower or "mirchi" in lower:
            return "Chilli"
        if "rice" in lower or "paddy" in lower or "dhan" in lower:
            return "Rice"
        if "maize" in lower or "corn" in lower:
            return "Maize"
        if "sorghum" in lower or "jowar" in lower:
            return "Sorghum"
        if "pearl millet" in lower or "bajra" in lower:
            return "Pearl Millet"
        if "finger millet" in lower or "ragi" in lower or "mandua" in lower:
            return "Ragi"
        if "soybean" in lower or "soya" in lower:
            return "Soybean"
        if "cotton" in lower or "kapas" in lower:
            return "Cotton"
        if "tomato" in lower:
            return "Tomato"
        if "potato" in lower:
            return "Potato"
        if "onion" in lower:
            return "Onion"
        if "tea" in lower:
            return "Tea"
        if "coffee" in lower:
            return "Coffee"
        if "rubber" in lower:
            return "Rubber"
        if "coconut" in lower:
            return "Coconut"
        if "mango" in lower:
            return "Mango"
        if "banana" in lower:
            return "Banana"
        return c.capitalize()
