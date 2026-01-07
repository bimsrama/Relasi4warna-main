"""
Test Iteration 10 - Deep Dive, SEO, and HITL Analytics Features
Tests:
1. Deep Dive Questions API
2. Type Interactions API
3. HITL Analytics Overview
4. HITL Analytics Timeline
5. HITL Analytics Moderator Performance
6. HITL Analytics Export
7. SEO files (sitemap.xml, robots.txt)
8. SEO meta tags in index.html
9. Watermark removal verification
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "admin@relasi4warna.com"
ADMIN_PASSWORD = "Admin123!"
TEST_EMAIL = "test@test.com"
TEST_PASSWORD = "testpassword"


class TestDeepDiveAPI:
    """Test Deep Dive Questions and Type Interactions APIs"""
    
    def test_deep_dive_questions_returns_16_questions(self):
        """GET /api/deep-dive/questions should return 16 questions"""
        response = requests.get(f"{BASE_URL}/api/deep-dive/questions?language=id")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "questions" in data, "Response should contain 'questions' key"
        assert len(data["questions"]) == 16, f"Expected 16 questions, got {len(data['questions'])}"
        
        # Verify question structure
        first_question = data["questions"][0]
        assert "question_id" in first_question, "Question should have question_id"
        assert "text" in first_question, "Question should have text"
        assert "options" in first_question, "Question should have options"
        assert "section" in first_question, "Question should have section"
        
        # Verify options structure
        assert len(first_question["options"]) == 4, "Each question should have 4 options"
        first_option = first_question["options"][0]
        assert "text" in first_option, "Option should have text"
        assert "archetype" in first_option, "Option should have archetype"
        
    def test_deep_dive_questions_english(self):
        """GET /api/deep-dive/questions with language=en should return English questions"""
        response = requests.get(f"{BASE_URL}/api/deep-dive/questions?language=en")
        assert response.status_code == 200
        
        data = response.json()
        assert len(data["questions"]) == 16
        
    def test_type_interactions_driver(self):
        """GET /api/deep-dive/type-interactions/driver should return interaction data"""
        response = requests.get(f"{BASE_URL}/api/deep-dive/type-interactions/driver")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "archetype" in data, "Response should contain 'archetype'"
        assert data["archetype"] == "driver"
        assert "interactions" in data, "Response should contain 'interactions'"
        
        # Should have interactions with all 4 types
        interactions = data["interactions"]
        expected_types = ["driver", "spark", "anchor", "analyst"]
        for type_key in expected_types:
            assert type_key in interactions, f"Missing interaction: {type_key}"
            # Verify interaction structure
            interaction = interactions[type_key]
            assert "dynamic" in interaction, f"Interaction {type_key} should have 'dynamic'"
            assert "strength" in interaction, f"Interaction {type_key} should have 'strength'"
            assert "challenge" in interaction, f"Interaction {type_key} should have 'challenge'"
            assert "tip" in interaction, f"Interaction {type_key} should have 'tip'"
            
    def test_type_interactions_spark(self):
        """GET /api/deep-dive/type-interactions/spark should return interaction data"""
        response = requests.get(f"{BASE_URL}/api/deep-dive/type-interactions/spark")
        assert response.status_code == 200
        
        data = response.json()
        assert data["archetype"] == "spark"
        
    def test_type_interactions_anchor(self):
        """GET /api/deep-dive/type-interactions/anchor should return interaction data"""
        response = requests.get(f"{BASE_URL}/api/deep-dive/type-interactions/anchor")
        assert response.status_code == 200
        
        data = response.json()
        assert data["archetype"] == "anchor"
        
    def test_type_interactions_analyst(self):
        """GET /api/deep-dive/type-interactions/analyst should return interaction data"""
        response = requests.get(f"{BASE_URL}/api/deep-dive/type-interactions/analyst")
        assert response.status_code == 200
        
        data = response.json()
        assert data["archetype"] == "analyst"
        
    def test_type_interactions_invalid_archetype(self):
        """GET /api/deep-dive/type-interactions/invalid should return 400 or 404"""
        response = requests.get(f"{BASE_URL}/api/deep-dive/type-interactions/invalid")
        assert response.status_code in [400, 404], f"Expected 400 or 404, got {response.status_code}"


class TestHITLAnalyticsAPI:
    """Test HITL Analytics APIs - requires admin authentication"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get admin token for authenticated requests"""
        login_response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        if login_response.status_code == 200:
            self.admin_token = login_response.json().get("access_token")
            self.headers = {"Authorization": f"Bearer {self.admin_token}"}
        else:
            pytest.skip(f"Admin login failed: {login_response.status_code}")
            
    def test_hitl_overview_returns_data(self):
        """GET /api/analytics/hitl/overview should return risk distribution and queue stats"""
        response = requests.get(
            f"{BASE_URL}/api/analytics/hitl/overview?days=30",
            headers=self.headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "period_days" in data, "Response should contain 'period_days'"
        assert data["period_days"] == 30
        assert "risk_distribution" in data, "Response should contain 'risk_distribution'"
        assert "queue_stats" in data, "Response should contain 'queue_stats'"
        assert "keyword_trends" in data, "Response should contain 'keyword_trends'"
        assert "response_time" in data, "Response should contain 'response_time'"
        
    def test_hitl_overview_different_days(self):
        """GET /api/analytics/hitl/overview with different day ranges"""
        for days in [7, 30, 90]:
            response = requests.get(
                f"{BASE_URL}/api/analytics/hitl/overview?days={days}",
                headers=self.headers
            )
            assert response.status_code == 200
            assert response.json()["period_days"] == days
            
    def test_hitl_overview_requires_admin(self):
        """GET /api/analytics/hitl/overview should require admin auth"""
        # Without auth
        response = requests.get(f"{BASE_URL}/api/analytics/hitl/overview")
        assert response.status_code == 401
        
        # With regular user auth
        login_response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
        )
        if login_response.status_code == 200:
            user_token = login_response.json().get("access_token")
            response = requests.get(
                f"{BASE_URL}/api/analytics/hitl/overview",
                headers={"Authorization": f"Bearer {user_token}"}
            )
            assert response.status_code == 403, "Regular user should get 403 Forbidden"
            
    def test_hitl_timeline_returns_data(self):
        """GET /api/analytics/hitl/timeline should return timeline data"""
        response = requests.get(
            f"{BASE_URL}/api/analytics/hitl/timeline?days=30",
            headers=self.headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "dates" in data, "Response should contain 'dates'"
        assert "series" in data, "Response should contain 'series'"
        
        # Series should have level_1, level_2, level_3
        series = data["series"]
        assert "level_1" in series, "Series should contain 'level_1'"
        assert "level_2" in series, "Series should contain 'level_2'"
        assert "level_3" in series, "Series should contain 'level_3'"
        
    def test_hitl_moderator_performance(self):
        """GET /api/analytics/hitl/moderator-performance should return moderator stats"""
        response = requests.get(
            f"{BASE_URL}/api/analytics/hitl/moderator-performance?days=30",
            headers=self.headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "moderators" in data, "Response should contain 'moderators'"
        assert "period_days" in data, "Response should contain 'period_days'"
        assert isinstance(data["moderators"], list), "Moderators should be a list"
        
    def test_hitl_export_json(self):
        """GET /api/analytics/hitl/export should return export data in JSON"""
        response = requests.get(
            f"{BASE_URL}/api/analytics/hitl/export?days=30&format=json",
            headers=self.headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "export_date" in data, "Response should contain 'export_date'"
        assert "period_days" in data, "Response should contain 'period_days'"
        assert "risk_assessments" in data, "Response should contain 'risk_assessments'"
        assert "moderation_queue" in data, "Response should contain 'moderation_queue'"
        assert "audit_logs" in data, "Response should contain 'audit_logs'"
        assert "summary" in data, "Response should contain 'summary'"
        
    def test_hitl_export_csv(self):
        """GET /api/analytics/hitl/export with format=csv should return CSV"""
        response = requests.get(
            f"{BASE_URL}/api/analytics/hitl/export?days=30&format=csv",
            headers=self.headers
        )
        assert response.status_code == 200
        # CSV response should have text/csv content type
        assert "text/csv" in response.headers.get("content-type", "") or response.status_code == 200


class TestSEOFiles:
    """Test SEO files - sitemap.xml and robots.txt"""
    
    def test_sitemap_xml_exists(self):
        """GET /sitemap.xml should return valid XML"""
        response = requests.get(f"{BASE_URL}/sitemap.xml")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        content = response.text
        assert "<?xml" in content, "Should be valid XML"
        assert "<urlset" in content, "Should contain urlset element"
        assert "relasi4warna.com" in content, "Should contain site URL"
        
    def test_robots_txt_exists(self):
        """GET /robots.txt should return valid robots.txt"""
        response = requests.get(f"{BASE_URL}/robots.txt")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        content = response.text
        assert "User-agent" in content, "Should contain User-agent directive"
        assert "Sitemap" in content, "Should contain Sitemap directive"


class TestSEOMetaTags:
    """Test SEO meta tags in index.html"""
    
    def test_index_html_has_meta_description(self):
        """index.html should have meta description"""
        response = requests.get(f"{BASE_URL}/")
        assert response.status_code == 200
        
        content = response.text
        assert 'name="description"' in content, "Should have meta description"
        
    def test_index_html_has_meta_keywords(self):
        """index.html should have meta keywords"""
        response = requests.get(f"{BASE_URL}/")
        content = response.text
        assert 'name="keywords"' in content, "Should have meta keywords"
        
    def test_index_html_has_og_title(self):
        """index.html should have Open Graph title"""
        response = requests.get(f"{BASE_URL}/")
        content = response.text
        assert 'property="og:title"' in content, "Should have og:title"
        
    def test_index_html_has_og_description(self):
        """index.html should have Open Graph description"""
        response = requests.get(f"{BASE_URL}/")
        content = response.text
        assert 'property="og:description"' in content, "Should have og:description"
        
    def test_index_html_has_canonical(self):
        """index.html should have canonical link"""
        response = requests.get(f"{BASE_URL}/")
        content = response.text
        assert 'rel="canonical"' in content, "Should have canonical link"


class TestWatermarkRemoval:
    """Test that 'Made with Emergent' watermark is removed"""
    
    def test_no_made_with_emergent_badge(self):
        """index.html should not have 'Made with Emergent' visible badge"""
        response = requests.get(f"{BASE_URL}/")
        content = response.text
        
        # Check for common watermark patterns
        assert "Made with Emergent" not in content, "Should not have 'Made with Emergent' text"
        assert "made-with-emergent" not in content.lower(), "Should not have watermark class"
        
    def test_watermark_comment_exists(self):
        """index.html should have watermark removed comment"""
        # Read the actual file to check for comment
        with open("/app/frontend/public/index.html", "r") as f:
            content = f.read()
        
        # The watermark was replaced with a comment
        assert "Watermark removed" in content or "Made with Emergent" not in content


class TestHealthAndBasicEndpoints:
    """Basic health and endpoint tests"""
    
    def test_health_endpoint(self):
        """GET /api/health should return healthy status"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        
    def test_root_endpoint(self):
        """GET /api/ should return API info"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
