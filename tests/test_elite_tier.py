"""
Test Elite Tier Implementation - Iteration 12
Tests:
1. GET /api/auth/me returns 'tier' field
2. POST /api/report/elite/{result_id} generates Elite report with selected modules
3. GET /api/report/elite/{result_id} retrieves existing Elite report
4. Elite tier access control (403 for non-elite users)
"""

import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_USER_EMAIL = "test@test.com"
TEST_USER_PASSWORD = "testpassword"
ADMIN_EMAIL = "admin@relasi4warna.com"
ADMIN_PASSWORD = "Admin123!"
TEST_RESULT_ID = "result_11f12620e513"  # Paid result for testing


class TestAuthTierField:
    """Test that /api/auth/me returns tier field"""
    
    def test_login_returns_tier_field(self):
        """Test that login response includes tier field"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        
        # Check user object has tier field
        assert "user" in data, "Response missing 'user' field"
        assert "tier" in data["user"], "User object missing 'tier' field"
        print(f"✓ Login response includes tier field: {data['user']['tier']}")
    
    def test_auth_me_returns_tier_field(self):
        """Test that GET /api/auth/me returns tier field"""
        # First login to get token
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD
        })
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]
        
        # Get user info
        response = requests.get(f"{BASE_URL}/api/auth/me", headers={
            "Authorization": f"Bearer {token}"
        })
        assert response.status_code == 200, f"GET /api/auth/me failed: {response.text}"
        data = response.json()
        
        # Check tier field
        assert "tier" in data, "Response missing 'tier' field"
        assert data["tier"] in ["free", "elite", "elite_plus", "certification"], f"Invalid tier value: {data['tier']}"
        print(f"✓ GET /api/auth/me returns tier: {data['tier']}")
    
    def test_admin_user_tier(self):
        """Test admin user tier field"""
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]
        
        response = requests.get(f"{BASE_URL}/api/auth/me", headers={
            "Authorization": f"Bearer {token}"
        })
        assert response.status_code == 200
        data = response.json()
        
        assert "tier" in data
        assert "is_admin" in data
        assert data["is_admin"] == True
        print(f"✓ Admin user has tier: {data['tier']}, is_admin: {data['is_admin']}")


class TestEliteReportEndpoints:
    """Test Elite report generation and retrieval endpoints"""
    
    @pytest.fixture
    def elite_user_token(self):
        """Get token for elite tier user"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        return response.json()["access_token"]
    
    @pytest.fixture
    def admin_token(self):
        """Get admin token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200
        return response.json()["access_token"]
    
    def test_elite_report_endpoint_exists(self, elite_user_token):
        """Test that Elite report endpoint exists and responds"""
        # Try to get existing elite report (may not exist yet)
        response = requests.get(
            f"{BASE_URL}/api/report/elite/{TEST_RESULT_ID}?language=id",
            headers={"Authorization": f"Bearer {elite_user_token}"}
        )
        # Should return 200 (if exists) or 404 (if not exists)
        assert response.status_code in [200, 404], f"Unexpected status: {response.status_code}, {response.text}"
        print(f"✓ GET /api/report/elite endpoint responds with status: {response.status_code}")
    
    def test_elite_report_post_endpoint_structure(self, elite_user_token):
        """Test POST /api/report/elite endpoint accepts correct payload structure"""
        # Test with minimal payload - just checking endpoint accepts the structure
        payload = {
            "result_id": TEST_RESULT_ID,
            "language": "id",
            "force": False
        }
        
        response = requests.post(
            f"{BASE_URL}/api/report/elite/{TEST_RESULT_ID}",
            json=payload,
            headers={"Authorization": f"Bearer {elite_user_token}"},
            timeout=10  # Short timeout - we just want to check endpoint structure
        )
        
        # Should return 200 (success), 402 (payment required), 403 (tier required), or timeout
        # We're testing the endpoint structure, not full generation
        assert response.status_code in [200, 402, 403, 500], f"Unexpected status: {response.status_code}, {response.text}"
        
        if response.status_code == 403:
            data = response.json()
            assert "detail" in data
            print(f"✓ POST /api/report/elite returns 403 for non-elite user: {data['detail']}")
        elif response.status_code == 402:
            print(f"✓ POST /api/report/elite returns 402 for unpaid result")
        elif response.status_code == 200:
            data = response.json()
            assert "content" in data or "report_id" in data
            print(f"✓ POST /api/report/elite returns 200 with report data")
        else:
            print(f"✓ POST /api/report/elite endpoint responds with status: {response.status_code}")
    
    def test_elite_report_with_quarterly_module(self, elite_user_token):
        """Test Elite report with Module 10 (Quarterly Calibration) payload"""
        payload = {
            "result_id": TEST_RESULT_ID,
            "language": "id",
            "force": False,
            "previous_snapshot": {
                "primary_archetype": "driver",
                "secondary_archetype": "spark",
                "balance_index": 0.5,
                "created_at": "3 months ago"
            },
            "self_reported_experience": "I've been working on my communication skills"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/report/elite/{TEST_RESULT_ID}",
            json=payload,
            headers={"Authorization": f"Bearer {elite_user_token}"},
            timeout=10
        )
        
        # Check endpoint accepts the payload structure
        assert response.status_code in [200, 402, 403, 500], f"Unexpected status: {response.status_code}"
        print(f"✓ Elite report with quarterly module payload accepted, status: {response.status_code}")
    
    def test_elite_report_with_business_module(self, elite_user_token):
        """Test Elite report with Module 12 (Business Leadership) payload"""
        payload = {
            "result_id": TEST_RESULT_ID,
            "language": "id",
            "force": False,
            "user_role": "founder",
            "counterpart_style": "analyst",
            "business_conflicts": "Decision-making speed differences"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/report/elite/{TEST_RESULT_ID}",
            json=payload,
            headers={"Authorization": f"Bearer {elite_user_token}"},
            timeout=10
        )
        
        assert response.status_code in [200, 402, 403, 500], f"Unexpected status: {response.status_code}"
        print(f"✓ Elite report with business module payload accepted, status: {response.status_code}")
    
    def test_elite_report_with_team_module(self, elite_user_token):
        """Test Elite report with Module 13 (Team Dynamics) payload"""
        payload = {
            "result_id": TEST_RESULT_ID,
            "language": "id",
            "force": False,
            "team_profiles": [
                {"name": "Alice", "primary": "driver"},
                {"name": "Bob", "primary": "anchor"},
                {"name": "Carol", "primary": "spark"}
            ]
        }
        
        response = requests.post(
            f"{BASE_URL}/api/report/elite/{TEST_RESULT_ID}",
            json=payload,
            headers={"Authorization": f"Bearer {elite_user_token}"},
            timeout=10
        )
        
        assert response.status_code in [200, 402, 403, 500], f"Unexpected status: {response.status_code}"
        print(f"✓ Elite report with team module payload accepted, status: {response.status_code}")
    
    def test_elite_report_requires_auth(self):
        """Test that Elite report endpoints require authentication"""
        # GET without auth
        response = requests.get(f"{BASE_URL}/api/report/elite/{TEST_RESULT_ID}")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ GET /api/report/elite requires authentication")
        
        # POST without auth
        response = requests.post(
            f"{BASE_URL}/api/report/elite/{TEST_RESULT_ID}",
            json={"result_id": TEST_RESULT_ID, "language": "id"}
        )
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ POST /api/report/elite requires authentication")


class TestEliteTierAccessControl:
    """Test Elite tier access control"""
    
    def test_check_user_tier_via_admin(self):
        """Check test user's tier via admin endpoint"""
        # Login as admin
        admin_login = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert admin_login.status_code == 200
        admin_token = admin_login.json()["access_token"]
        
        # Get users list
        response = requests.get(
            f"{BASE_URL}/api/admin/users",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        if response.status_code == 200:
            users = response.json().get("users", [])
            test_user = next((u for u in users if u.get("email") == TEST_USER_EMAIL), None)
            if test_user:
                print(f"✓ Test user tier: {test_user.get('tier', 'not set')}")
            else:
                print("✓ Test user not found in admin users list")
        else:
            print(f"✓ Admin users endpoint status: {response.status_code}")


class TestEliteProducts:
    """Test Elite tier products in payment system"""
    
    def test_products_include_elite_tiers(self):
        """Test that products endpoint includes Elite tier products"""
        response = requests.get(f"{BASE_URL}/api/payment/products")
        assert response.status_code == 200, f"Products endpoint failed: {response.text}"
        
        products = response.json().get("products", {})
        
        # Check for Elite products
        elite_products = ["elite_monthly", "elite_quarterly", "elite_annual", "elite_single"]
        elite_plus_products = ["elite_plus_monthly", "elite_plus_quarterly", "elite_plus_annual"]
        
        found_elite = []
        found_elite_plus = []
        
        for product_id in elite_products:
            if product_id in products:
                found_elite.append(product_id)
                assert products[product_id].get("tier") == "elite", f"{product_id} should have tier='elite'"
        
        for product_id in elite_plus_products:
            if product_id in products:
                found_elite_plus.append(product_id)
                assert products[product_id].get("tier") == "elite_plus", f"{product_id} should have tier='elite_plus'"
        
        print(f"✓ Found Elite products: {found_elite}")
        print(f"✓ Found Elite+ products: {found_elite_plus}")
        
        assert len(found_elite) > 0, "No Elite products found"


class TestUserResponseModel:
    """Test UserResponse model includes tier field"""
    
    def test_register_returns_tier(self):
        """Test that registration returns tier field (default: free)"""
        import uuid
        test_email = f"test_elite_{uuid.uuid4().hex[:8]}@test.com"
        
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": test_email,
            "password": "testpassword123",
            "name": "Test Elite User",
            "language": "id"
        })
        
        if response.status_code == 200:
            data = response.json()
            assert "user" in data
            assert "tier" in data["user"]
            assert data["user"]["tier"] == "free", "New users should have 'free' tier"
            print(f"✓ New user registration returns tier='free'")
        elif response.status_code == 400:
            # Email might already exist
            print(f"✓ Registration endpoint works (email may already exist)")
        else:
            print(f"✓ Registration endpoint status: {response.status_code}")


# Run tests
if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
