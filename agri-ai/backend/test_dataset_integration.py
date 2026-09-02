import sys
import os
import json

# Add backend to path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__) + '/..'))

from app.services import agricultural_dataset_service as ads

def test_all():
    print("=== 1. Testing State Dataset Loading & Case-Insensitive Matching ===")
    for st, dt in [("Andhra Pradesh", "Nellore"), ("andhra pradesh", "nellore"), ("ANDHRA PRADESH", "NELLORE"), (" Andhra Pradesh ", " Nellore ")]:
        s = ads.get_soil_data(st, dt)
        assert s["found"] is True, f"Failed for {st} {dt}"
        assert s["nitrogen"] == 179.1, f"Expected 179.1, got {s['nitrogen']}"
        assert s["phosphorus"] == 58.4, f"Expected 58.4, got {s['phosphorus']}"
        assert s["potassium"] == 236.1, f"Expected 236.1, got {s['potassium']}"
        assert s["ph"] == 7.25, f"Expected 7.25, got {s['ph']}"
        assert s["moisture"] == 37.7, f"Expected 37.7, got {s['moisture']}"
        assert s["organic_carbon"] == "Not available"
    print(f"  [PASS] Nellore Soil: N={s['nitrogen']}, P={s['phosphorus']}, K={s['potassium']}, pH={s['ph']}, Moisture={s['moisture']}%, OC={s['organic_carbon']}")

    print("\n=== 2. Testing Telangana Karimnagar Dataset Loading ===")
    s_tg = ads.get_soil_data("Telangana", "Karimnagar")
    assert s_tg["found"] is True
    print(f"  [PASS] Karimnagar Soil: Records={s_tg['record_count']}, N={s_tg['nitrogen']}, P={s_tg['phosphorus']}, K={s_tg['potassium']}, pH={s_tg['ph']}, Moisture={s_tg['moisture']}%")

    print("\n=== 3. Testing Crop Data & Climate Parameters ===")
    cd = ads.get_crop_data("Andhra Pradesh", "Nellore")
    assert cd["found"] is True
    assert cd["temperature"] == 27.8
    assert cd["humidity"] == 64.9
    assert cd["rainfall"] == 1376.9
    assert len(cd["crops"]) > 0
    print(f"  [PASS] Nellore Climate: Temp={cd['temperature']}C, Humidity={cd['humidity']}%, Rainfall={cd['rainfall']}mm, Crops={cd['crops']}")

    print("\n=== 4. Testing Crop Recommendations (Grouped & Ranked from District Records) ===")
    rec = ads.get_crop_recommendations("Andhra Pradesh", "Nellore", area=2.5)
    assert len(rec["recommendations"]) > 0
    top = rec["recommendations"][0]
    print(f"  [PASS] Top Recommended Crop: {top['crop']} (Score: {top['score']}, Yield: {top['expected_yield']} t/ha, Production: {top['production']} t, Revenue: Rs. {top['revenue']:,.0f})")
    print(f"         Reason: {top['reason']}")

    print("\n=== 5. Testing Yield Prediction for State + District + Crop ===")
    yd = ads.get_yield_data("Andhra Pradesh", "Nellore", "Paddy", area=2.5)
    assert yd["found"] is True
    assert yd["predicted_yield"] == 3.1
    assert yd["expected_production"] == 7.8
    print(f"  [PASS] Paddy Yield: {yd['predicted_yield']} t/ha, Area: {yd['area']} ha, Expected Production: {yd['expected_production']} tonnes, Confidence: {yd['confidence']}")

    print("\n=== 6. Testing Reverse Geocode Location Resolution ===")
    live_ap = ads.resolve_location(lat=14.4426, lon=79.9865)
    assert live_ap["state"] == "Andhra Pradesh"
    assert live_ap["district"] == "Nellore"
    assert live_ap["source"] == "live"
    print(f"  [PASS] (14.4426, 79.9865) resolved to State: {live_ap['state']}, District: {live_ap['district']}")

    live_tg = ads.resolve_location(lat=18.4386, lon=79.1288)
    assert live_tg["state"] == "Telangana"
    assert live_tg["district"] == "Karimnagar"
    assert live_tg["source"] == "live"
    print(f"  [PASS] (18.4386, 79.1288) resolved to State: {live_tg['state']}, District: {live_tg['district']}")

    print("\n=== 7. Testing Missing District Handling ===")
    missing = ads.get_soil_data("Andhra Pradesh", "NonExistentDistrictXYZ")
    assert missing["found"] is False
    assert "No agricultural data available" in missing["message"]
    print(f"  [PASS] Missing district returned message: '{missing['message']}'")

    print("\n>>> ALL TESTS PASSED! REAL DATASET INTEGRATION IS 100% OPERATIONAL! <<<")

if __name__ == "__main__":
    test_all()
