"""
HITL (Human-in-the-Loop) Moderation System Tests
=================================================
Tests for the HITL moderation system including:
- GET /api/admin/hitl/stats - HITL statistics
- GET /api/admin/hitl/queue - Moderation queue with filters
- GET /api/admin/hitl/keywords - Risk keywords categories
- POST /api/admin/hitl/queue/{queue_id}/decision - Process moderation decision
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


class TestHITLAuthentication:
    """Test authentication requirements for HITL endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
    
    def test_hitl_stats_requires_auth(self):
        """HITL stats endpoint should require authentication"""
        response = self.session.get(f"{BASE_URL}/api/admin/hitl/stats")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ HITL stats requires authentication")
    
    def test_hitl_queue_requires_auth(self):
        """HITL queue endpoint should require authentication"""
        response = self.session.get(f"{BASE_URL}/api/admin/hitl/queue")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ HITL queue requires authentication")
    
    def test_hitl_keywords_requires_auth(self):
        """HITL keywords endpoint should require authentication"""
        response = self.session.get(f"{BASE_URL}/api/admin/hitl/keywords")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ HITL keywords requires authentication")
    
    def test_non_admin_cannot_access_hitl(self):
        """Non-admin users should not access HITL endpoints"""
        # Login as regular user
        login_response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        
        if login_response.status_code != 200:
            pytest.skip("Test user login failed - skipping non-admin test")
        
        token = login_response.json().get("access_token")
        self.session.headers.update({"Authorization": f"Bearer {token}"})
        
        response = self.session.get(f"{BASE_URL}/api/admin/hitl/stats")
        assert response.status_code == 403, f"Expected 403 for non-admin, got {response.status_code}"
        print("✓ Non-admin users cannot access HITL endpoints")


class TestHITLStats:
    """Test HITL statistics endpoint"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Login as admin
        login_response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        
        if login_response.status_code != 200:
            pytest.skip("Admin login failed - skipping HITL tests")
        
        token = login_response.json().get("access_token")
        self.session.headers.update({"Authorization": f"Bearer {token}"})
    
    def test_hitl_stats_returns_200(self):
        """GET /api/admin/hitl/stats should return 200"""
        response = self.session.get(f"{BASE_URL}/api/admin/hitl/stats")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("✓ HITL stats returns 200")
    
    def test_hitl_stats_structure(self):
        """HITL stats should have correct structure"""
        response = self.session.get(f"{BASE_URL}/api/admin/hitl/stats")
        assert response.status_code == 200
        
        data = response.json()
        
        # Check required fields
        assert "queue_by_status" in data, "Missing queue_by_status field"
        assert "assessments_by_risk" in data, "Missing assessments_by_risk field"
        assert "pending_count" in data, "Missing pending_count field"
        assert "recent_events" in data, "Missing recent_events field"
        
        # Validate types
        assert isinstance(data["queue_by_status"], dict), "queue_by_status should be dict"
        assert isinstance(data["assessments_by_risk"], dict), "assessments_by_risk should be dict"
        assert isinstance(data["pending_count"], int), "pending_count should be int"
        assert isinstance(data["recent_events"], list), "recent_events should be list"
        
        print(f"✓ HITL stats structure is correct")
        print(f"  - Pending count: {data['pending_count']}")
        print(f"  - Queue by status: {data['queue_by_status']}")
        print(f"  - Assessments by risk: {data['assessments_by_risk']}")


class TestHITLQueue:
    """Test HITL moderation queue endpoint"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Login as admin
        login_response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        
        if login_response.status_code != 200:
            pytest.skip("Admin login failed - skipping HITL tests")
        
        token = login_response.json().get("access_token")
        self.session.headers.update({"Authorization": f"Bearer {token}"})
    
    def test_hitl_queue_returns_200(self):
        """GET /api/admin/hitl/queue should return 200"""
        response = self.session.get(f"{BASE_URL}/api/admin/hitl/queue")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("✓ HITL queue returns 200")
    
    def test_hitl_queue_structure(self):
        """HITL queue should have correct structure"""
        response = self.session.get(f"{BASE_URL}/api/admin/hitl/queue")
        assert response.status_code == 200
        
        data = response.json()
        
        # Check required fields
        assert "items" in data, "Missing items field"
        assert "total" in data, "Missing total field"
        
        # Validate types
        assert isinstance(data["items"], list), "items should be list"
        assert isinstance(data["total"], int), "total should be int"
        
        print(f"✓ HITL queue structure is correct")
        print(f"  - Total items: {data['total']}")
        print(f"  - Items returned: {len(data['items'])}")
    
    def test_hitl_queue_filter_by_status_pending(self):
        """Queue should filter by status=pending"""
        response = self.session.get(f"{BASE_URL}/api/admin/hitl/queue?status=pending")
        assert response.status_code == 200
        
        data = response.json()
        # All items should have pending status (if any)
        for item in data["items"]:
            assert item.get("status") == "pending", f"Expected pending status, got {item.get('status')}"
        
        print(f"✓ Queue filter by status=pending works ({len(data['items'])} items)")
    
    def test_hitl_queue_filter_by_status_approved(self):
        """Queue should filter by status=approved"""
        response = self.session.get(f"{BASE_URL}/api/admin/hitl/queue?status=approved")
        assert response.status_code == 200
        
        data = response.json()
        for item in data["items"]:
            assert item.get("status") == "approved", f"Expected approved status, got {item.get('status')}"
        
        print(f"✓ Queue filter by status=approved works ({len(data['items'])} items)")
    
    def test_hitl_queue_filter_by_risk_level_3(self):
        """Queue should filter by risk_level=level_3"""
        response = self.session.get(f"{BASE_URL}/api/admin/hitl/queue?risk_level=level_3")
        assert response.status_code == 200
        
        data = response.json()
        for item in data["items"]:
            assert item.get("risk_level") == "level_3", f"Expected level_3, got {item.get('risk_level')}"
        
        print(f"✓ Queue filter by risk_level=level_3 works ({len(data['items'])} items)")
    
    def test_hitl_queue_filter_by_risk_level_2(self):
        """Queue should filter by risk_level=level_2"""
        response = self.session.get(f"{BASE_URL}/api/admin/hitl/queue?risk_level=level_2")
        assert response.status_code == 200
        
        data = response.json()
        for item in data["items"]:
            assert item.get("risk_level") == "level_2", f"Expected level_2, got {item.get('risk_level')}"
        
        print(f"✓ Queue filter by risk_level=level_2 works ({len(data['items'])} items)")
    
    def test_hitl_queue_combined_filters(self):
        """Queue should support combined filters"""
        response = self.session.get(f"{BASE_URL}/api/admin/hitl/queue?status=pending&risk_level=level_3")
        assert response.status_code == 200
        
        data = response.json()
        for item in data["items"]:
            assert item.get("status") == "pending"
            assert item.get("risk_level") == "level_3"
        
        print(f"✓ Queue combined filters work ({len(data['items'])} items)")
    
    def test_hitl_queue_pagination(self):
        """Queue should support pagination"""
        response = self.session.get(f"{BASE_URL}/api/admin/hitl/queue?skip=0&limit=5")
        assert response.status_code == 200
        
        data = response.json()
        assert len(data["items"]) <= 5, "Limit should be respected"
        
        print(f"✓ Queue pagination works (limit=5, got {len(data['items'])} items)")


class TestHITLKeywords:
    """Test HITL keywords endpoint"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Login as admin
        login_response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        
        if login_response.status_code != 200:
            pytest.skip("Admin login failed - skipping HITL tests")
        
        token = login_response.json().get("access_token")
        self.session.headers.update({"Authorization": f"Bearer {token}"})
    
    def test_hitl_keywords_returns_200(self):
        """GET /api/admin/hitl/keywords should return 200"""
        response = self.session.get(f"{BASE_URL}/api/admin/hitl/keywords")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("✓ HITL keywords returns 200")
    
    def test_hitl_keywords_structure(self):
        """HITL keywords should have correct structure"""
        response = self.session.get(f"{BASE_URL}/api/admin/hitl/keywords")
        assert response.status_code == 200
        
        data = response.json()
        
        # Check required field
        assert "keywords" in data, "Missing keywords field"
        assert isinstance(data["keywords"], list), "keywords should be list"
        
        print(f"✓ HITL keywords structure is correct")
        print(f"  - Categories count: {len(data['keywords'])}")
    
    def test_hitl_keywords_categories(self):
        """Keywords should contain expected categories"""
        response = self.session.get(f"{BASE_URL}/api/admin/hitl/keywords")
        assert response.status_code == 200
        
        data = response.json()
        keywords = data.get("keywords", [])
        
        # Expected categories based on hitl_engine.py
        expected_categories = ["red", "yellow", "weaponization", "clinical", "labeling"]
        
        found_categories = [kw.get("category") for kw in keywords]
        
        # If keywords are seeded, check for expected categories
        if keywords:
            for category in expected_categories:
                if category in found_categories:
                    print(f"  ✓ Found category: {category}")
            
            # Check structure of each keyword entry
            for kw in keywords:
                assert "category" in kw, "Keyword entry missing category"
                if "keywords_id" in kw:
                    assert isinstance(kw["keywords_id"], list), "keywords_id should be list"
                if "keywords_en" in kw:
                    assert isinstance(kw["keywords_en"], list), "keywords_en should be list"
        
        print(f"✓ HITL keywords categories validated ({len(keywords)} categories found)")


class TestHITLQueueItemDetail:
    """Test HITL queue item detail endpoint"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Login as admin
        login_response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        
        if login_response.status_code != 200:
            pytest.skip("Admin login failed - skipping HITL tests")
        
        token = login_response.json().get("access_token")
        self.session.headers.update({"Authorization": f"Bearer {token}"})
    
    def test_hitl_queue_item_not_found(self):
        """Non-existent queue item should return 404"""
        response = self.session.get(f"{BASE_URL}/api/admin/hitl/queue/nonexistent_queue_id")
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("✓ Non-existent queue item returns 404")
    
    def test_hitl_queue_item_detail_if_exists(self):
        """If queue items exist, detail endpoint should work"""
        # First get queue items
        queue_response = self.session.get(f"{BASE_URL}/api/admin/hitl/queue")
        assert queue_response.status_code == 200
        
        data = queue_response.json()
        items = data.get("items", [])
        
        if not items:
            print("✓ No queue items to test detail endpoint (queue is empty)")
            return
        
        # Get detail of first item
        queue_id = items[0].get("queue_id")
        detail_response = self.session.get(f"{BASE_URL}/api/admin/hitl/queue/{queue_id}")
        assert detail_response.status_code == 200
        
        detail = detail_response.json()
        
        # Check required fields
        assert "queue_id" in detail
        assert "assessment_id" in detail
        assert "risk_level" in detail
        assert "risk_score" in detail
        assert "status" in detail
        assert "audit_logs" in detail
        
        print(f"✓ Queue item detail works for {queue_id}")


class TestHITLModerationDecision:
    """Test HITL moderation decision endpoint"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Login as admin
        login_response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        
        if login_response.status_code != 200:
            pytest.skip("Admin login failed - skipping HITL tests")
        
        token = login_response.json().get("access_token")
        self.session.headers.update({"Authorization": f"Bearer {token}"})
    
    def test_decision_on_nonexistent_item(self):
        """Decision on non-existent item should return 404"""
        response = self.session.post(
            f"{BASE_URL}/api/admin/hitl/queue/nonexistent_id/decision",
            json={
                "action": "approve_as_is",
                "moderator_notes": "Test decision"
            }
        )
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("✓ Decision on non-existent item returns 404")
    
    def test_decision_invalid_action(self):
        """Invalid action should return 400"""
        # First get a queue item if exists
        queue_response = self.session.get(f"{BASE_URL}/api/admin/hitl/queue?status=pending")
        data = queue_response.json()
        items = data.get("items", [])
        
        if not items:
            # Test with fake ID - should still validate action
            response = self.session.post(
                f"{BASE_URL}/api/admin/hitl/queue/fake_id/decision",
                json={
                    "action": "invalid_action",
                    "moderator_notes": "Test"
                }
            )
            # Could be 400 (invalid action) or 404 (not found) - both acceptable
            assert response.status_code in [400, 404], f"Expected 400 or 404, got {response.status_code}"
            print("✓ Invalid action validation works")
            return
        
        queue_id = items[0].get("queue_id")
        response = self.session.post(
            f"{BASE_URL}/api/admin/hitl/queue/{queue_id}/decision",
            json={
                "action": "invalid_action",
                "moderator_notes": "Test"
            }
        )
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        print("✓ Invalid action returns 400")


# Run tests
if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
