"""
Test Suite for Iteration 11 Features:
1. Admin CMS - Questions Tab (Add, Toggle, Delete)
2. Admin CMS - Pricing Tab (Create, Edit, List)
3. Admin CMS - Coupons Tab (Advanced coupon creation)
4. Admin CMS - Dashboard Overview endpoint
5. HITL Analytics Dashboard endpoints
6. Deep Dive Questions endpoint (16 questions)
7. Deep Dive Generate Report endpoint
"""

import pytest
import requests
import os
import uuid
from datetime import datetime, timedelta

# Get BASE_URL from environment
BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "admin@relasi4warna.com"
ADMIN_PASSWORD = "Admin123!"
TEST_USER_EMAIL = "test@test.com"
TEST_USER_PASSWORD = "testpassword"


class TestAdminAuthentication:
    """Test admin authentication for CMS access"""
    
    def test_admin_login_success(self):
        """Test admin login returns valid token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Admin login failed: {response.text}"
        data = response.json()
        assert "access_token" in data
        assert data["user"]["is_admin"] == True
        print(f"✅ Admin login successful, is_admin={data['user']['is_admin']}")
        return data["access_token"]
    
    def test_regular_user_not_admin(self):
        """Test regular user cannot access admin endpoints"""
        # Login as regular user
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip("Test user not found, skipping")
        
        token = response.json()["access_token"]
        
        # Try to access admin endpoint
        admin_response = requests.get(
            f"{BASE_URL}/api/admin/dashboard/overview",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert admin_response.status_code == 403, "Regular user should not access admin endpoints"
        print("✅ Regular user correctly denied admin access")


class TestAdminDashboardOverview:
    """Test Admin Dashboard Overview endpoint"""
    
    @pytest.fixture
    def admin_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        return response.json()["access_token"]
    
    def test_dashboard_overview_returns_stats(self, admin_token):
        """Test dashboard overview returns user/quiz/payment stats"""
        response = requests.get(
            f"{BASE_URL}/api/admin/dashboard/overview",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200, f"Dashboard overview failed: {response.text}"
        data = response.json()
        
        # Verify structure
        assert "users" in data
        assert "quizzes" in data
        assert "payments" in data
        assert "distributions" in data
        
        # Verify user stats
        assert "total" in data["users"]
        assert "today" in data["users"]
        assert "week" in data["users"]
        
        # Verify quiz stats
        assert "total" in data["quizzes"]
        
        # Verify payment stats
        assert "total_paid" in data["payments"]
        assert "revenue_month" in data["payments"]
        
        print(f"✅ Dashboard overview: {data['users']['total']} users, {data['quizzes']['total']} quizzes, {data['payments']['total_paid']} paid")


class TestAdminQuestionsManagement:
    """Test Admin CMS Questions Tab functionality"""
    
    @pytest.fixture
    def admin_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        return response.json()["access_token"]
    
    def test_get_questions_list(self, admin_token):
        """Test getting questions list"""
        response = requests.get(
            f"{BASE_URL}/api/admin/questions",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200, f"Get questions failed: {response.text}"
        data = response.json()
        assert "questions" in data
        print(f"✅ Questions list retrieved: {len(data['questions'])} questions")
    
    def test_create_question(self, admin_token):
        """Test creating a new question"""
        unique_id = uuid.uuid4().hex[:8]
        question_data = {
            "series": "family",
            "question_id_text": f"TEST_Pertanyaan uji coba {unique_id}",
            "question_en_text": f"TEST_Test question {unique_id}",
            "question_type": "forced_choice",
            "options": [
                {"text_id": "Opsi A", "text_en": "Option A", "archetype": "driver", "weight": 1},
                {"text_id": "Opsi B", "text_en": "Option B", "archetype": "spark", "weight": 1},
                {"text_id": "Opsi C", "text_en": "Option C", "archetype": "anchor", "weight": 1},
                {"text_id": "Opsi D", "text_en": "Option D", "archetype": "analyst", "weight": 1}
            ],
            "scoring_map": {"driver": 1, "spark": 1, "anchor": 1, "analyst": 1},
            "stress_marker_flag": False,
            "active": True,
            "order": 999
        }
        
        response = requests.post(
            f"{BASE_URL}/api/admin/questions",
            headers={"Authorization": f"Bearer {admin_token}"},
            json=question_data
        )
        assert response.status_code == 200, f"Create question failed: {response.text}"
        data = response.json()
        assert "question_id" in data
        print(f"✅ Question created: {data['question_id']}")
        return data["question_id"]
    
    def test_toggle_question_status(self, admin_token):
        """Test toggling question active status"""
        # First create a question
        unique_id = uuid.uuid4().hex[:8]
        create_response = requests.post(
            f"{BASE_URL}/api/admin/questions",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={
                "series": "family",
                "question_id_text": f"TEST_Toggle test {unique_id}",
                "question_en_text": f"TEST_Toggle test {unique_id}",
                "question_type": "forced_choice",
                "options": [
                    {"text_id": "A", "text_en": "A", "archetype": "driver", "weight": 1}
                ],
                "scoring_map": {"driver": 1},
                "active": True,
                "order": 998
            }
        )
        question_id = create_response.json()["question_id"]
        
        # Toggle the question
        toggle_response = requests.post(
            f"{BASE_URL}/api/admin/questions/{question_id}/toggle",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert toggle_response.status_code == 200, f"Toggle question failed: {toggle_response.text}"
        data = toggle_response.json()
        assert "active" in data
        print(f"✅ Question toggled: active={data['active']}")
    
    def test_delete_question(self, admin_token):
        """Test deleting a question"""
        # First create a question
        unique_id = uuid.uuid4().hex[:8]
        create_response = requests.post(
            f"{BASE_URL}/api/admin/questions",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={
                "series": "family",
                "question_id_text": f"TEST_Delete test {unique_id}",
                "question_en_text": f"TEST_Delete test {unique_id}",
                "question_type": "forced_choice",
                "options": [
                    {"text_id": "A", "text_en": "A", "archetype": "driver", "weight": 1}
                ],
                "scoring_map": {"driver": 1},
                "active": True,
                "order": 997
            }
        )
        question_id = create_response.json()["question_id"]
        
        # Delete the question
        delete_response = requests.delete(
            f"{BASE_URL}/api/admin/questions/{question_id}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert delete_response.status_code == 200, f"Delete question failed: {delete_response.text}"
        print(f"✅ Question deleted: {question_id}")
    
    def test_get_questions_stats(self, admin_token):
        """Test getting questions statistics by series"""
        response = requests.get(
            f"{BASE_URL}/api/admin/questions/stats",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200, f"Get questions stats failed: {response.text}"
        data = response.json()
        assert "by_series" in data
        print(f"✅ Questions stats: {data['by_series']}")


class TestAdminPricingManagement:
    """Test Admin CMS Pricing Tab functionality"""
    
    @pytest.fixture
    def admin_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        return response.json()["access_token"]
    
    def test_get_pricing_list(self, admin_token):
        """Test getting pricing tiers list"""
        response = requests.get(
            f"{BASE_URL}/api/admin/pricing",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200, f"Get pricing failed: {response.text}"
        data = response.json()
        assert "pricing" in data
        print(f"✅ Pricing list retrieved: {len(data['pricing'])} tiers")
    
    def test_create_pricing_tier(self, admin_token):
        """Test creating a new pricing tier"""
        unique_id = uuid.uuid4().hex[:8]
        pricing_data = {
            "product_id": f"TEST_product_{unique_id}",
            "name_id": f"TEST_Paket Uji {unique_id}",
            "name_en": f"TEST_Test Package {unique_id}",
            "description_id": "Deskripsi paket uji coba",
            "description_en": "Test package description",
            "price_idr": 99000,
            "price_usd": 6.99,
            "features_id": ["Fitur 1", "Fitur 2"],
            "features_en": ["Feature 1", "Feature 2"],
            "active": True,
            "is_popular": False
        }
        
        response = requests.post(
            f"{BASE_URL}/api/admin/pricing",
            headers={"Authorization": f"Bearer {admin_token}"},
            json=pricing_data
        )
        assert response.status_code == 200, f"Create pricing failed: {response.text}"
        data = response.json()
        assert "product_id" in data
        print(f"✅ Pricing tier created: {data['product_id']}")
        
        # Cleanup - delete the test pricing
        requests.delete(
            f"{BASE_URL}/api/admin/pricing/{pricing_data['product_id']}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
    
    def test_update_pricing_tier(self, admin_token):
        """Test updating a pricing tier"""
        unique_id = uuid.uuid4().hex[:8]
        product_id = f"TEST_update_{unique_id}"
        
        # Create first
        requests.post(
            f"{BASE_URL}/api/admin/pricing",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={
                "product_id": product_id,
                "name_id": "Original Name",
                "name_en": "Original Name",
                "price_idr": 50000,
                "price_usd": 3.99,
                "active": True
            }
        )
        
        # Update - API requires all fields for PricingUpdate model
        update_response = requests.put(
            f"{BASE_URL}/api/admin/pricing/{product_id}",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={
                "product_id": product_id,
                "name_id": "Updated Name",
                "name_en": "Updated Name EN",
                "price_idr": 75000,
                "price_usd": 4.99,
                "active": True
            }
        )
        assert update_response.status_code == 200, f"Update pricing failed: {update_response.text}"
        print(f"✅ Pricing tier updated: {product_id}")
        
        # Cleanup
        requests.delete(
            f"{BASE_URL}/api/admin/pricing/{product_id}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )


class TestAdminCouponsManagement:
    """Test Admin CMS Coupons Tab functionality with advanced options"""
    
    @pytest.fixture
    def admin_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        return response.json()["access_token"]
    
    def test_get_coupons_list(self, admin_token):
        """Test getting coupons list"""
        response = requests.get(
            f"{BASE_URL}/api/admin/coupons",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200, f"Get coupons failed: {response.text}"
        data = response.json()
        assert "coupons" in data
        print(f"✅ Coupons list retrieved: {len(data['coupons'])} coupons")
    
    def test_create_simple_coupon(self, admin_token):
        """Test creating a simple coupon"""
        unique_code = f"TEST{uuid.uuid4().hex[:6].upper()}"
        coupon_data = {
            "code": unique_code,
            "discount_percent": 15,
            "max_uses": 50
        }
        
        response = requests.post(
            f"{BASE_URL}/api/admin/coupons",
            headers={"Authorization": f"Bearer {admin_token}"},
            json=coupon_data
        )
        assert response.status_code == 200, f"Create coupon failed: {response.text}"
        data = response.json()
        assert "coupon_id" in data
        print(f"✅ Simple coupon created: {unique_code}")
        
        # Cleanup
        requests.delete(
            f"{BASE_URL}/api/admin/coupons/{data['coupon_id']}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
    
    def test_create_advanced_coupon_with_discount_type(self, admin_token):
        """Test creating advanced coupon with discount_type (percent/fixed_idr/fixed_usd)"""
        unique_code = f"TESTADV{uuid.uuid4().hex[:4].upper()}"
        
        # Test percent discount
        coupon_data = {
            "code": unique_code,
            "discount_type": "percent",
            "discount_value": 20,
            "max_uses": 100,
            "min_purchase_idr": 50000,
            "valid_products": [],
            "valid_from": datetime.now().isoformat(),
            "valid_until": (datetime.now() + timedelta(days=30)).isoformat(),
            "one_per_user": True,
            "active": True
        }
        
        response = requests.post(
            f"{BASE_URL}/api/admin/coupons/advanced",
            headers={"Authorization": f"Bearer {admin_token}"},
            json=coupon_data
        )
        assert response.status_code == 200, f"Create advanced coupon failed: {response.text}"
        data = response.json()
        assert "coupon_id" in data
        assert data["coupon"]["discount_type"] == "percent"
        assert data["coupon"]["discount_value"] == 20
        assert data["coupon"]["min_purchase_idr"] == 50000
        print(f"✅ Advanced coupon created: {unique_code} (percent discount)")
        
        # Cleanup
        requests.delete(
            f"{BASE_URL}/api/admin/coupons/{data['coupon_id']}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
    
    def test_create_fixed_idr_coupon(self, admin_token):
        """Test creating coupon with fixed IDR discount"""
        unique_code = f"TESTIDR{uuid.uuid4().hex[:4].upper()}"
        
        coupon_data = {
            "code": unique_code,
            "discount_type": "fixed_idr",
            "discount_value": 25000,
            "max_uses": 50,
            "min_purchase_idr": 100000,
            "one_per_user": True,
            "active": True
        }
        
        response = requests.post(
            f"{BASE_URL}/api/admin/coupons/advanced",
            headers={"Authorization": f"Bearer {admin_token}"},
            json=coupon_data
        )
        assert response.status_code == 200, f"Create fixed IDR coupon failed: {response.text}"
        data = response.json()
        assert data["coupon"]["discount_type"] == "fixed_idr"
        assert data["coupon"]["discount_value"] == 25000
        print(f"✅ Fixed IDR coupon created: {unique_code} (Rp 25,000 off)")
        
        # Cleanup
        requests.delete(
            f"{BASE_URL}/api/admin/coupons/{data['coupon_id']}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
    
    def test_toggle_coupon_status(self, admin_token):
        """Test toggling coupon active status"""
        unique_code = f"TESTTOG{uuid.uuid4().hex[:4].upper()}"
        
        # Create coupon
        create_response = requests.post(
            f"{BASE_URL}/api/admin/coupons",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"code": unique_code, "discount_percent": 10, "max_uses": 10}
        )
        coupon_id = create_response.json()["coupon_id"]
        
        # Toggle
        toggle_response = requests.post(
            f"{BASE_URL}/api/admin/coupons/{coupon_id}/toggle",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert toggle_response.status_code == 200, f"Toggle coupon failed: {toggle_response.text}"
        data = toggle_response.json()
        assert "active" in data
        print(f"✅ Coupon toggled: active={data['active']}")
        
        # Cleanup
        requests.delete(
            f"{BASE_URL}/api/admin/coupons/{coupon_id}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
    
    def test_get_coupon_usage_stats(self, admin_token):
        """Test getting coupon usage statistics"""
        response = requests.get(
            f"{BASE_URL}/api/admin/coupons/usage-stats",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200, f"Get coupon stats failed: {response.text}"
        data = response.json()
        assert "summary" in data
        assert "top_coupons" in data
        print(f"✅ Coupon stats: {data['summary']}")


class TestHITLAnalyticsDashboard:
    """Test HITL Analytics Dashboard endpoints"""
    
    @pytest.fixture
    def admin_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        return response.json()["access_token"]
    
    def test_hitl_overview_endpoint(self, admin_token):
        """Test HITL overview returns risk distribution and queue stats"""
        response = requests.get(
            f"{BASE_URL}/api/analytics/hitl/overview?days=30",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200, f"HITL overview failed: {response.text}"
        data = response.json()
        
        assert "risk_distribution" in data
        assert "queue_stats" in data
        assert "keyword_trends" in data
        assert "response_time" in data
        print(f"✅ HITL overview: risk_distribution={data['risk_distribution']}")
    
    def test_hitl_overview_different_day_ranges(self, admin_token):
        """Test HITL overview with different day ranges (7, 30, 90)"""
        for days in [7, 30, 90]:
            response = requests.get(
                f"{BASE_URL}/api/analytics/hitl/overview?days={days}",
                headers={"Authorization": f"Bearer {admin_token}"}
            )
            assert response.status_code == 200, f"HITL overview for {days} days failed"
        print("✅ HITL overview works with 7, 30, 90 day ranges")
    
    def test_hitl_timeline_endpoint(self, admin_token):
        """Test HITL timeline returns dates and series data"""
        response = requests.get(
            f"{BASE_URL}/api/analytics/hitl/timeline?days=30",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200, f"HITL timeline failed: {response.text}"
        data = response.json()
        
        assert "dates" in data
        assert "series" in data
        print(f"✅ HITL timeline: {len(data.get('dates', []))} dates")
    
    def test_hitl_moderator_performance(self, admin_token):
        """Test HITL moderator performance endpoint"""
        response = requests.get(
            f"{BASE_URL}/api/analytics/hitl/moderator-performance?days=30",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200, f"HITL moderator performance failed: {response.text}"
        data = response.json()
        
        assert "moderators" in data
        print(f"✅ HITL moderator performance: {len(data['moderators'])} moderators")
    
    def test_hitl_export_json(self, admin_token):
        """Test HITL export returns JSON data"""
        response = requests.get(
            f"{BASE_URL}/api/analytics/hitl/export?days=30&format=json",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200, f"HITL export JSON failed: {response.text}"
        data = response.json()
        
        assert "export_date" in data
        assert "period_days" in data
        print("✅ HITL export JSON successful")
    
    def test_hitl_export_csv(self, admin_token):
        """Test HITL export returns CSV format"""
        response = requests.get(
            f"{BASE_URL}/api/analytics/hitl/export?days=30&format=csv",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200, f"HITL export CSV failed: {response.text}"
        assert "text/csv" in response.headers.get("content-type", "") or response.text.startswith("date,")
        print("✅ HITL export CSV successful")
    
    def test_hitl_requires_admin_auth(self):
        """Test HITL endpoints require admin authentication"""
        # Without auth
        response = requests.get(f"{BASE_URL}/api/analytics/hitl/overview")
        assert response.status_code == 401, "HITL should require auth"
        
        # With regular user
        user_login = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD
        })
        if user_login.status_code == 200:
            user_token = user_login.json()["access_token"]
            response = requests.get(
                f"{BASE_URL}/api/analytics/hitl/overview",
                headers={"Authorization": f"Bearer {user_token}"}
            )
            assert response.status_code == 403, "Regular user should not access HITL"
        
        print("✅ HITL endpoints properly protected")


class TestDeepDiveQuestions:
    """Test Deep Dive Questions endpoint returns 16 questions"""
    
    @pytest.fixture
    def user_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD
        })
        if response.status_code != 200:
            # Create test user if not exists
            register_response = requests.post(f"{BASE_URL}/api/auth/register", json={
                "email": TEST_USER_EMAIL,
                "password": TEST_USER_PASSWORD,
                "name": "Test User",
                "language": "id"
            })
            if register_response.status_code == 200:
                return register_response.json()["access_token"]
            pytest.skip("Could not create test user")
        return response.json()["access_token"]
    
    def test_deep_dive_questions_returns_16_indonesian(self, user_token):
        """Test Deep Dive questions returns 16 questions in Indonesian"""
        response = requests.get(
            f"{BASE_URL}/api/deep-dive/questions?language=id",
            headers={"Authorization": f"Bearer {user_token}"}
        )
        assert response.status_code == 200, f"Deep Dive questions failed: {response.text}"
        data = response.json()
        
        assert "questions" in data
        assert len(data["questions"]) == 16, f"Expected 16 questions, got {len(data['questions'])}"
        
        # Verify sections
        sections = set(q.get("section") for q in data["questions"])
        expected_sections = {"inner_motivation", "stress_response", "relationship_dynamics", "communication_patterns"}
        assert sections == expected_sections, f"Missing sections: {expected_sections - sections}"
        
        print(f"✅ Deep Dive questions: {len(data['questions'])} questions, sections: {sections}")
    
    def test_deep_dive_questions_returns_16_english(self, user_token):
        """Test Deep Dive questions returns 16 questions in English"""
        response = requests.get(
            f"{BASE_URL}/api/deep-dive/questions?language=en",
            headers={"Authorization": f"Bearer {user_token}"}
        )
        assert response.status_code == 200, f"Deep Dive questions (EN) failed: {response.text}"
        data = response.json()
        
        assert len(data["questions"]) == 16, f"Expected 16 questions, got {len(data['questions'])}"
        print(f"✅ Deep Dive questions (English): {len(data['questions'])} questions")
    
    def test_deep_dive_questions_have_4_options(self, user_token):
        """Test each Deep Dive question has 4 archetype options"""
        response = requests.get(
            f"{BASE_URL}/api/deep-dive/questions?language=id",
            headers={"Authorization": f"Bearer {user_token}"}
        )
        data = response.json()
        
        for q in data["questions"]:
            assert len(q.get("options", [])) == 4, f"Question {q.get('question_id')} should have 4 options"
            archetypes = [opt.get("archetype") for opt in q["options"]]
            assert set(archetypes) == {"driver", "spark", "anchor", "analyst"}, f"Missing archetypes in question {q.get('question_id')}"
        
        print("✅ All Deep Dive questions have 4 archetype options")


class TestDeepDiveTypeInteractions:
    """Test Deep Dive Type Interactions endpoint"""
    
    @pytest.fixture
    def user_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip("Test user not found")
        return response.json()["access_token"]
    
    def test_type_interactions_for_all_archetypes(self, user_token):
        """Test type interactions returns data for all 4 archetypes"""
        for archetype in ["driver", "spark", "anchor", "analyst"]:
            response = requests.get(
                f"{BASE_URL}/api/deep-dive/type-interactions/{archetype}",
                headers={"Authorization": f"Bearer {user_token}"}
            )
            assert response.status_code == 200, f"Type interactions for {archetype} failed: {response.text}"
            data = response.json()
            
            assert "archetype" in data
            assert "interactions" in data
            assert len(data["interactions"]) == 4, f"Expected 4 interactions for {archetype}"
        
        print("✅ Type interactions work for all 4 archetypes")
    
    def test_type_interactions_invalid_archetype(self, user_token):
        """Test type interactions returns 400 for invalid archetype"""
        response = requests.get(
            f"{BASE_URL}/api/deep-dive/type-interactions/invalid",
            headers={"Authorization": f"Bearer {user_token}"}
        )
        assert response.status_code == 400, "Should return 400 for invalid archetype"
        print("✅ Type interactions correctly rejects invalid archetype")


# Run tests if executed directly
if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
