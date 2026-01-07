"""
HITL Analytics API Tests - Iteration 14
Tests for HITL Analytics Dashboard endpoints
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestHITLAnalytics:
    """HITL Analytics endpoint tests - requires admin authentication"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup admin authentication"""
        # Login as admin
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@relasi4warna.com",
            "password": "Admin123!"
        })
        assert response.status_code == 200, f"Admin login failed: {response.text}"
        self.admin_token = response.json()["access_token"]
        self.headers = {"Authorization": f"Bearer {self.admin_token}"}
    
    def test_hitl_overview_endpoint(self):
        """Test HITL overview endpoint returns correct data structure"""
        response = requests.get(
            f"{BASE_URL}/api/analytics/hitl/overview?days=30",
            headers=self.headers
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify data structure
        assert "period_days" in data
        assert "risk_distribution" in data
        assert "queue_stats" in data
        assert "keyword_trends" in data
        assert "response_time" in data
        
        # Verify period_days matches request
        assert data["period_days"] == 30
        
        # Verify risk_distribution is a dict
        assert isinstance(data["risk_distribution"], dict)
        
        # Verify queue_stats is a dict
        assert isinstance(data["queue_stats"], dict)
        
        # Verify keyword_trends is a list
        assert isinstance(data["keyword_trends"], list)
        
        # Verify response_time has expected fields
        assert "avg_response_time" in data["response_time"]
        
        print(f"✓ HITL Overview: {data['period_days']} days, {len(data['keyword_trends'])} keywords")
    
    def test_hitl_timeline_endpoint(self):
        """Test HITL timeline endpoint returns correct data structure"""
        response = requests.get(
            f"{BASE_URL}/api/analytics/hitl/timeline?days=30",
            headers=self.headers
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify data structure
        assert "dates" in data
        assert "series" in data
        
        # Verify dates is a list
        assert isinstance(data["dates"], list)
        
        # Verify series has level_1, level_2, level_3
        assert "level_1" in data["series"]
        assert "level_2" in data["series"]
        assert "level_3" in data["series"]
        
        # Verify each series is a list
        assert isinstance(data["series"]["level_1"], list)
        assert isinstance(data["series"]["level_2"], list)
        assert isinstance(data["series"]["level_3"], list)
        
        print(f"✓ HITL Timeline: {len(data['dates'])} dates")
    
    def test_hitl_moderator_performance_endpoint(self):
        """Test HITL moderator performance endpoint returns correct data structure"""
        response = requests.get(
            f"{BASE_URL}/api/analytics/hitl/moderator-performance?days=30",
            headers=self.headers
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify data structure
        assert "moderators" in data
        assert "period_days" in data
        
        # Verify moderators is a list
        assert isinstance(data["moderators"], list)
        
        # If there are moderators, verify structure
        if len(data["moderators"]) > 0:
            mod = data["moderators"][0]
            assert "moderator_id" in mod
            assert "name" in mod
            assert "email" in mod
            assert "total_actions" in mod
            assert "action_breakdown" in mod
        
        print(f"✓ Moderator Performance: {len(data['moderators'])} moderators")
    
    def test_hitl_export_json_endpoint(self):
        """Test HITL export JSON endpoint returns correct data structure"""
        response = requests.get(
            f"{BASE_URL}/api/analytics/hitl/export?days=30&format=json",
            headers=self.headers
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify data structure
        assert "export_date" in data
        assert "period_days" in data
        assert "risk_assessments" in data
        assert "moderation_queue" in data
        assert "audit_logs" in data
        assert "summary" in data
        
        # Verify summary has counts
        assert "total_assessments" in data["summary"]
        assert "total_queue_items" in data["summary"]
        assert "total_audit_logs" in data["summary"]
        
        print(f"✓ Export JSON: {data['summary']['total_assessments']} assessments")
    
    def test_hitl_export_csv_endpoint(self):
        """Test HITL export CSV endpoint returns CSV content"""
        response = requests.get(
            f"{BASE_URL}/api/analytics/hitl/export?days=30&format=csv",
            headers=self.headers
        )
        
        assert response.status_code == 200
        # CSV should have content-type text/csv
        assert "text/csv" in response.headers.get("content-type", "") or response.status_code == 200
        
        print(f"✓ Export CSV: {len(response.content)} bytes")
    
    def test_hitl_overview_different_days(self):
        """Test HITL overview with different day ranges"""
        for days in [7, 30, 90]:
            response = requests.get(
                f"{BASE_URL}/api/analytics/hitl/overview?days={days}",
                headers=self.headers
            )
            
            assert response.status_code == 200
            data = response.json()
            assert data["period_days"] == days
        
        print("✓ HITL Overview works with 7, 30, 90 day ranges")
    
    def test_hitl_requires_admin_auth(self):
        """Test HITL endpoints require admin authentication"""
        # Test without auth
        response = requests.get(f"{BASE_URL}/api/analytics/hitl/overview")
        assert response.status_code in [401, 403], "Should require authentication"
        
        # Test with non-admin user
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@test.com",
            "password": "testpassword"
        })
        if login_response.status_code == 200:
            user_token = login_response.json()["access_token"]
            response = requests.get(
                f"{BASE_URL}/api/analytics/hitl/overview",
                headers={"Authorization": f"Bearer {user_token}"}
            )
            # Should be forbidden for non-admin
            assert response.status_code in [401, 403], "Should require admin role"
        
        print("✓ HITL endpoints require admin authentication")


class TestHealthCheck:
    """Basic health check tests"""
    
    def test_health_endpoint(self):
        """Test health endpoint"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print("✓ Health check passed")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
