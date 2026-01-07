"""
Test suite for Compatibility Matrix feature
Tests the /api/compatibility/* endpoints and validates matrix data
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://relasi-web.preview.emergentagent.com')

class TestCompatibilityMatrix:
    """Tests for /api/compatibility/matrix endpoint"""
    
    def test_get_matrix_returns_200(self):
        """Matrix endpoint returns 200 status"""
        response = requests.get(f"{BASE_URL}/api/compatibility/matrix")
        assert response.status_code == 200
        
    def test_matrix_has_4_archetypes(self):
        """Matrix contains all 4 archetypes"""
        response = requests.get(f"{BASE_URL}/api/compatibility/matrix")
        data = response.json()
        
        assert "archetypes" in data
        assert len(data["archetypes"]) == 4
        assert set(data["archetypes"]) == {"driver", "spark", "anchor", "analyst"}
        
    def test_matrix_has_4_rows(self):
        """Matrix has 4 rows (one per archetype)"""
        response = requests.get(f"{BASE_URL}/api/compatibility/matrix")
        data = response.json()
        
        assert "matrix" in data
        assert len(data["matrix"]) == 4
        
    def test_matrix_has_16_combinations(self):
        """Matrix contains all 16 combinations (4x4)"""
        response = requests.get(f"{BASE_URL}/api/compatibility/matrix")
        data = response.json()
        
        total_combinations = 0
        for row in data["matrix"]:
            assert "archetype" in row
            assert "compatibilities" in row
            total_combinations += len(row["compatibilities"])
            
        assert total_combinations == 16
        
    def test_matrix_cell_has_score_and_energy(self):
        """Each matrix cell has score and energy fields"""
        response = requests.get(f"{BASE_URL}/api/compatibility/matrix")
        data = response.json()
        
        for row in data["matrix"]:
            for arch, compat in row["compatibilities"].items():
                assert "score" in compat, f"Missing score for {row['archetype']}-{arch}"
                assert "energy" in compat, f"Missing energy for {row['archetype']}-{arch}"
                assert isinstance(compat["score"], int)
                assert 0 <= compat["score"] <= 100


class TestCompatibilityPair:
    """Tests for /api/compatibility/pair/{arch1}/{arch2} endpoint"""
    
    def test_pair_driver_spark_returns_200(self):
        """Driver-Spark pair returns 200"""
        response = requests.get(f"{BASE_URL}/api/compatibility/pair/driver/spark")
        assert response.status_code == 200
        
    def test_pair_has_required_fields(self):
        """Pair response has all required fields"""
        response = requests.get(f"{BASE_URL}/api/compatibility/pair/driver/spark")
        data = response.json()
        
        required_fields = ["pair", "archetype1", "archetype2", "compatibility_score", 
                          "energy", "title", "summary", "strengths", "challenges", "tips"]
        for field in required_fields:
            assert field in data, f"Missing field: {field}"
            
    def test_pair_strengths_is_list(self):
        """Strengths field is a list"""
        response = requests.get(f"{BASE_URL}/api/compatibility/pair/driver/spark")
        data = response.json()
        
        assert isinstance(data["strengths"], list)
        assert len(data["strengths"]) > 0
        
    def test_pair_challenges_is_list(self):
        """Challenges field is a list"""
        response = requests.get(f"{BASE_URL}/api/compatibility/pair/driver/spark")
        data = response.json()
        
        assert isinstance(data["challenges"], list)
        assert len(data["challenges"]) > 0
        
    def test_pair_tips_is_list(self):
        """Tips field is a list"""
        response = requests.get(f"{BASE_URL}/api/compatibility/pair/driver/spark")
        data = response.json()
        
        assert isinstance(data["tips"], list)
        assert len(data["tips"]) > 0
        
    def test_pair_language_id(self):
        """Pair returns Indonesian content with language=id"""
        response = requests.get(f"{BASE_URL}/api/compatibility/pair/driver/spark?language=id")
        data = response.json()
        
        # Indonesian title should contain Indonesian words
        assert data["title"] == "Pemimpin & Inspirator"
        
    def test_pair_language_en(self):
        """Pair returns English content with language=en"""
        response = requests.get(f"{BASE_URL}/api/compatibility/pair/driver/spark?language=en")
        data = response.json()
        
        # English title
        assert data["title"] == "Leader & Inspirer"
        
    def test_pair_reversed_order_works(self):
        """Pair works with reversed archetype order"""
        response = requests.get(f"{BASE_URL}/api/compatibility/pair/spark/driver")
        assert response.status_code == 200
        
    def test_pair_invalid_archetype_returns_404(self):
        """Invalid archetype returns 404"""
        response = requests.get(f"{BASE_URL}/api/compatibility/pair/invalid/driver")
        assert response.status_code == 404
        
    def test_all_16_pairs_exist(self):
        """All 16 archetype pairs return valid data"""
        archetypes = ["driver", "spark", "anchor", "analyst"]
        
        for arch1 in archetypes:
            for arch2 in archetypes:
                response = requests.get(f"{BASE_URL}/api/compatibility/pair/{arch1}/{arch2}")
                assert response.status_code == 200, f"Failed for {arch1}-{arch2}"
                data = response.json()
                assert "compatibility_score" in data


class TestCompatibilityForArchetype:
    """Tests for /api/compatibility/for/{archetype} endpoint"""
    
    def test_for_driver_returns_200(self):
        """For-archetype endpoint returns 200"""
        response = requests.get(f"{BASE_URL}/api/compatibility/for/driver")
        assert response.status_code == 200
        
    def test_for_archetype_returns_4_compatibilities(self):
        """Returns compatibility with all 4 archetypes"""
        response = requests.get(f"{BASE_URL}/api/compatibility/for/driver")
        data = response.json()
        
        assert "archetype" in data
        assert data["archetype"] == "driver"
        assert "compatibilities" in data
        assert len(data["compatibilities"]) == 4
        
    def test_for_archetype_sorted_by_score(self):
        """Compatibilities are sorted by score descending"""
        response = requests.get(f"{BASE_URL}/api/compatibility/for/driver")
        data = response.json()
        
        scores = [c["compatibility_score"] for c in data["compatibilities"]]
        assert scores == sorted(scores, reverse=True)
        
    def test_for_invalid_archetype_returns_400(self):
        """Invalid archetype returns 400"""
        response = requests.get(f"{BASE_URL}/api/compatibility/for/invalid")
        assert response.status_code == 400


class TestCompatibilityScoreRanges:
    """Tests to verify score ranges and data quality"""
    
    def test_all_scores_in_valid_range(self):
        """All compatibility scores are between 0-100"""
        response = requests.get(f"{BASE_URL}/api/compatibility/matrix")
        data = response.json()
        
        for row in data["matrix"]:
            for arch, compat in row["compatibilities"].items():
                score = compat["score"]
                assert 0 <= score <= 100, f"Invalid score {score} for {row['archetype']}-{arch}"
                
    def test_same_archetype_pairs_exist(self):
        """Same archetype pairs (e.g., driver-driver) exist"""
        archetypes = ["driver", "spark", "anchor", "analyst"]
        
        for arch in archetypes:
            response = requests.get(f"{BASE_URL}/api/compatibility/pair/{arch}/{arch}")
            assert response.status_code == 200, f"Same pair {arch}-{arch} should exist"
            
    def test_energy_levels_are_valid(self):
        """Energy levels are valid strings"""
        response = requests.get(f"{BASE_URL}/api/compatibility/matrix")
        data = response.json()
        
        valid_energies = {"very_high", "high", "balanced", "low", "calm", "focused", 
                         "explosive", "harmonious", "peaceful", "thoughtful", 
                         "contrasting", "intellectual"}
        
        for row in data["matrix"]:
            for arch, compat in row["compatibilities"].items():
                energy = compat["energy"]
                assert isinstance(energy, str), f"Energy should be string for {row['archetype']}-{arch}"
                assert len(energy) > 0, f"Energy should not be empty for {row['archetype']}-{arch}"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
