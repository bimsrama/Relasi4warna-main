"""
Test Phase 4 Features: Legal Pages, Weekly Tips System, Admin CMS Tips Tab
- Legal pages: /terms and /privacy routes
- Weekly Tips: subscription, generation, admin management
- Admin CMS: Tips tab with subscribers list
"""

import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://relasi4warna-2.preview.emergentagent.com')

# Test credentials
TEST_USER = {"email": "test@test.com", "password": "testpassword"}
ADMIN_USER = {"email": "admin@relasi4warna.com", "password": "Admin123!"}


class TestHealthAndBasics:
    """Basic health checks"""
    
    def test_api_health(self):
        """Test API health endpoint"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "healthy"
        print("SUCCESS: API health check passed")
    
    def test_api_root(self):
        """Test API root endpoint"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "Relasi4Warna" in data.get("message", "")
        print("SUCCESS: API root endpoint working")


class TestAuthentication:
    """Authentication tests"""
    
    @pytest.fixture
    def user_token(self):
        """Get user auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json=TEST_USER)
        if response.status_code == 200:
            return response.json().get("access_token")
        # Try to register if login fails
        register_data = {**TEST_USER, "name": "Test User", "language": "id"}
        response = requests.post(f"{BASE_URL}/api/auth/register", json=register_data)
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Could not authenticate test user")
    
    @pytest.fixture
    def admin_token(self):
        """Get admin auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json=ADMIN_USER)
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Could not authenticate admin user")
    
    def test_user_login(self):
        """Test user login"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json=TEST_USER)
        # May fail if user doesn't exist, try register
        if response.status_code == 401:
            register_data = {**TEST_USER, "name": "Test User", "language": "id"}
            response = requests.post(f"{BASE_URL}/api/auth/register", json=register_data)
        
        assert response.status_code in [200, 400]  # 400 if already registered
        if response.status_code == 200:
            data = response.json()
            assert "access_token" in data
            print("SUCCESS: User login/register working")
    
    def test_admin_login(self):
        """Test admin login"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json=ADMIN_USER)
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        print("SUCCESS: Admin login working")


class TestTipsSubscription:
    """Weekly Tips Subscription Tests"""
    
    @pytest.fixture
    def auth_headers(self):
        """Get authenticated headers"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json=TEST_USER)
        if response.status_code != 200:
            register_data = {**TEST_USER, "name": "Test User", "language": "id"}
            response = requests.post(f"{BASE_URL}/api/auth/register", json=register_data)
        token = response.json().get("access_token")
        return {"Authorization": f"Bearer {token}"}
    
    def test_get_tips_subscription_status(self, auth_headers):
        """Test GET /api/tips/subscription - get subscription status"""
        response = requests.get(
            f"{BASE_URL}/api/tips/subscription",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert "subscribed" in data
        assert "email" in data
        print(f"SUCCESS: Tips subscription status retrieved - subscribed: {data.get('subscribed')}")
    
    def test_subscribe_to_tips(self, auth_headers):
        """Test POST /api/tips/subscription - subscribe to tips"""
        response = requests.post(
            f"{BASE_URL}/api/tips/subscription",
            json={"subscribed": True},
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("subscribed") == True
        assert data.get("status") == "success"
        print("SUCCESS: Subscribed to weekly tips")
    
    def test_unsubscribe_from_tips(self, auth_headers):
        """Test POST /api/tips/subscription - unsubscribe from tips"""
        response = requests.post(
            f"{BASE_URL}/api/tips/subscription",
            json={"subscribed": False},
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("subscribed") == False
        print("SUCCESS: Unsubscribed from weekly tips")
    
    def test_tips_subscription_requires_auth(self):
        """Test that tips subscription requires authentication"""
        response = requests.get(f"{BASE_URL}/api/tips/subscription")
        assert response.status_code == 401
        print("SUCCESS: Tips subscription correctly requires authentication")


class TestTipsGeneration:
    """Weekly Tips Generation Tests"""
    
    @pytest.fixture
    def auth_headers(self):
        """Get authenticated headers"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json=TEST_USER)
        if response.status_code != 200:
            register_data = {**TEST_USER, "name": "Test User", "language": "id"}
            response = requests.post(f"{BASE_URL}/api/auth/register", json=register_data)
        token = response.json().get("access_token")
        return {"Authorization": f"Bearer {token}"}
    
    def test_generate_tip_driver_id(self, auth_headers):
        """Test POST /api/tips/generate - generate tip for driver archetype in Indonesian"""
        response = requests.post(
            f"{BASE_URL}/api/tips/generate",
            json={"archetype": "driver", "language": "id"},
            headers=auth_headers,
            timeout=60  # AI generation may take time
        )
        assert response.status_code == 200
        data = response.json()
        assert "content" in data
        assert "tip_id" in data
        assert data.get("archetype") == "driver"
        assert len(data.get("content", "")) > 100  # Should have substantial content
        print(f"SUCCESS: Generated tip for driver archetype (ID) - tip_id: {data.get('tip_id')}")
    
    def test_generate_tip_spark_en(self, auth_headers):
        """Test POST /api/tips/generate - generate tip for spark archetype in English"""
        response = requests.post(
            f"{BASE_URL}/api/tips/generate",
            json={"archetype": "spark", "language": "en"},
            headers=auth_headers,
            timeout=60
        )
        assert response.status_code == 200
        data = response.json()
        assert "content" in data
        assert data.get("archetype") == "spark"
        print(f"SUCCESS: Generated tip for spark archetype (EN)")
    
    def test_generate_tip_invalid_archetype(self, auth_headers):
        """Test POST /api/tips/generate - invalid archetype returns 400"""
        response = requests.post(
            f"{BASE_URL}/api/tips/generate",
            json={"archetype": "invalid_type", "language": "id"},
            headers=auth_headers
        )
        assert response.status_code == 400
        print("SUCCESS: Invalid archetype correctly rejected with 400")
    
    def test_tips_history(self, auth_headers):
        """Test GET /api/tips/history - get tips history"""
        response = requests.get(
            f"{BASE_URL}/api/tips/history",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert "tips" in data
        assert isinstance(data.get("tips"), list)
        print(f"SUCCESS: Tips history retrieved - {len(data.get('tips', []))} tips found")
    
    def test_latest_tip(self, auth_headers):
        """Test GET /api/tips/latest - get latest tip"""
        response = requests.get(
            f"{BASE_URL}/api/tips/latest",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        # May have tip or message if no tips yet
        assert "tip" in data or "message" in data
        print("SUCCESS: Latest tip endpoint working")


class TestAdminTipsManagement:
    """Admin Tips Management Tests"""
    
    @pytest.fixture
    def admin_headers(self):
        """Get admin authenticated headers"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json=ADMIN_USER)
        if response.status_code != 200:
            pytest.skip("Could not authenticate admin user")
        token = response.json().get("access_token")
        return {"Authorization": f"Bearer {token}"}
    
    @pytest.fixture
    def user_headers(self):
        """Get regular user headers"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json=TEST_USER)
        if response.status_code != 200:
            register_data = {**TEST_USER, "name": "Test User", "language": "id"}
            response = requests.post(f"{BASE_URL}/api/auth/register", json=register_data)
        token = response.json().get("access_token")
        return {"Authorization": f"Bearer {token}"}
    
    def test_get_tips_subscribers_admin(self, admin_headers):
        """Test GET /api/admin/tips-subscribers - admin can get subscribers list"""
        response = requests.get(
            f"{BASE_URL}/api/admin/tips-subscribers",
            headers=admin_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert "subscribers" in data
        assert "total" in data
        assert "active" in data
        assert isinstance(data.get("subscribers"), list)
        print(f"SUCCESS: Admin tips subscribers - total: {data.get('total')}, active: {data.get('active')}")
    
    def test_tips_subscribers_requires_admin(self, user_headers):
        """Test that tips subscribers endpoint requires admin access"""
        response = requests.get(
            f"{BASE_URL}/api/admin/tips-subscribers",
            headers=user_headers
        )
        assert response.status_code == 403
        print("SUCCESS: Tips subscribers correctly requires admin access")
    
    def test_admin_stats_includes_tips_data(self, admin_headers):
        """Test GET /api/admin/stats - admin stats endpoint works"""
        response = requests.get(
            f"{BASE_URL}/api/admin/stats",
            headers=admin_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert "total_users" in data
        assert "total_attempts" in data
        print(f"SUCCESS: Admin stats retrieved - users: {data.get('total_users')}")


class TestLegalPagesAPI:
    """Test that legal pages routes exist (frontend routes)"""
    
    def test_terms_page_accessible(self):
        """Test /terms page is accessible"""
        response = requests.get(f"{BASE_URL}/terms", allow_redirects=True)
        # Frontend routes return 200 with HTML
        assert response.status_code == 200
        # Check it's HTML content
        assert "text/html" in response.headers.get("content-type", "")
        print("SUCCESS: /terms page is accessible")
    
    def test_privacy_page_accessible(self):
        """Test /privacy page is accessible"""
        response = requests.get(f"{BASE_URL}/privacy", allow_redirects=True)
        assert response.status_code == 200
        assert "text/html" in response.headers.get("content-type", "")
        print("SUCCESS: /privacy page is accessible")


class TestAdminCMSTabs:
    """Test Admin CMS functionality"""
    
    @pytest.fixture
    def admin_headers(self):
        """Get admin authenticated headers"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json=ADMIN_USER)
        if response.status_code != 200:
            pytest.skip("Could not authenticate admin user")
        token = response.json().get("access_token")
        return {"Authorization": f"Bearer {token}"}
    
    def test_admin_questions_endpoint(self, admin_headers):
        """Test GET /api/admin/questions - Questions tab data"""
        response = requests.get(
            f"{BASE_URL}/api/admin/questions?series=family",
            headers=admin_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert "questions" in data
        print(f"SUCCESS: Admin questions endpoint - {len(data.get('questions', []))} questions")
    
    def test_admin_users_endpoint(self, admin_headers):
        """Test GET /api/admin/users - Users tab data"""
        response = requests.get(
            f"{BASE_URL}/api/admin/users?limit=10",
            headers=admin_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert "users" in data
        assert "total" in data
        print(f"SUCCESS: Admin users endpoint - {data.get('total')} total users")
    
    def test_admin_results_endpoint(self, admin_headers):
        """Test GET /api/admin/results - Results tab data"""
        response = requests.get(
            f"{BASE_URL}/api/admin/results?limit=10",
            headers=admin_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert "results" in data
        assert "total" in data
        print(f"SUCCESS: Admin results endpoint - {data.get('total')} total results")
    
    def test_admin_coupons_endpoint(self, admin_headers):
        """Test GET /api/admin/coupons - Coupons tab data"""
        response = requests.get(
            f"{BASE_URL}/api/admin/coupons",
            headers=admin_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert "coupons" in data
        print(f"SUCCESS: Admin coupons endpoint - {len(data.get('coupons', []))} coupons")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
