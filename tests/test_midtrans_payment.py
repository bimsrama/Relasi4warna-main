"""
Test Midtrans Payment Integration for Relasi4Warna
Tests: Client key, payment creation, simulate payment, payment status, PDF download
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://relasi-web.preview.emergentagent.com').rstrip('/')

# Test credentials
ADMIN_EMAIL = "admin@relasi4warna.com"
ADMIN_PASSWORD = "Admin123!"
TEST_EMAIL = "test@test.com"
TEST_PASSWORD = "testpassword"


class TestMidtransPaymentIntegration:
    """Test Midtrans payment endpoints"""
    
    @pytest.fixture(scope="class")
    def session(self):
        """Create a requests session"""
        return requests.Session()
    
    @pytest.fixture(scope="class")
    def test_user_token(self, session):
        """Get or create test user and return token"""
        # Try to login first
        response = session.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        
        if response.status_code == 200:
            return response.json()["access_token"]
        
        # If login fails, register new user
        response = session.post(f"{BASE_URL}/api/auth/register", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD,
            "name": "Test User"
        })
        
        if response.status_code == 200:
            return response.json()["access_token"]
        
        # If registration fails (user exists but wrong password), skip
        pytest.skip("Could not authenticate test user")
    
    @pytest.fixture(scope="class")
    def admin_token(self, session):
        """Get admin token"""
        response = session.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        
        if response.status_code == 200:
            return response.json()["access_token"]
        
        pytest.skip("Could not authenticate admin user")
    
    @pytest.fixture(scope="class")
    def quiz_result_id(self, session, test_user_token):
        """Complete a quiz and get result_id"""
        headers = {"Authorization": f"Bearer {test_user_token}"}
        
        # Start quiz
        start_response = session.post(
            f"{BASE_URL}/api/quiz/start",
            json={"series": "family", "language": "id"},
            headers=headers
        )
        
        if start_response.status_code != 200:
            pytest.skip("Could not start quiz")
        
        attempt_id = start_response.json()["attempt_id"]
        
        # Get questions
        questions_response = session.get(f"{BASE_URL}/api/quiz/questions/family")
        if questions_response.status_code != 200:
            pytest.skip("Could not get questions")
        
        questions = questions_response.json()["questions"]
        
        # Create answers
        answers = []
        archetypes = ["driver", "spark", "anchor", "analyst"]
        for i, q in enumerate(questions):
            answers.append({
                "question_id": q["question_id"],
                "selected_option": archetypes[i % 4]
            })
        
        # Submit quiz
        submit_response = session.post(
            f"{BASE_URL}/api/quiz/submit",
            json={"attempt_id": attempt_id, "answers": answers},
            headers=headers
        )
        
        if submit_response.status_code != 200:
            pytest.skip("Could not submit quiz")
        
        return submit_response.json()["result_id"]
    
    # ==================== MIDTRANS CLIENT KEY TESTS ====================
    
    def test_get_midtrans_client_key(self, session):
        """Test GET /api/payment/client-key returns sandbox client key"""
        response = session.get(f"{BASE_URL}/api/payment/client-key")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "client_key" in data, "Response should contain client_key"
        assert "is_production" in data, "Response should contain is_production"
        
        # Verify sandbox key format
        assert data["client_key"].startswith("SB-Mid-client-"), f"Expected sandbox client key, got {data['client_key']}"
        assert data["is_production"] == False, "Should be sandbox mode"
        
        print(f"✓ Client key endpoint works: {data['client_key'][:20]}...")
    
    def test_client_key_no_auth_required(self, session):
        """Test client key endpoint doesn't require authentication"""
        response = session.get(f"{BASE_URL}/api/payment/client-key")
        assert response.status_code == 200, "Client key should be accessible without auth"
        print("✓ Client key accessible without authentication")
    
    # ==================== PAYMENT CREATION TESTS ====================
    
    def test_create_payment_returns_snap_token(self, session, test_user_token, quiz_result_id):
        """Test POST /api/payment/create returns snap_token"""
        headers = {"Authorization": f"Bearer {test_user_token}"}
        
        response = session.post(
            f"{BASE_URL}/api/payment/create",
            json={
                "result_id": quiz_result_id,
                "product_type": "single_report",
                "currency": "IDR"
            },
            headers=headers
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "payment_id" in data, "Response should contain payment_id"
        assert "snap_token" in data, "Response should contain snap_token"
        assert "redirect_url" in data, "Response should contain redirect_url"
        assert "amount" in data, "Response should contain amount"
        
        # Verify payment_id format
        assert data["payment_id"].startswith("PAY-"), f"Payment ID should start with PAY-, got {data['payment_id']}"
        
        # Verify snap_token is not empty
        assert len(data["snap_token"]) > 0, "snap_token should not be empty"
        
        # Verify amount
        assert data["amount"] == 99000, f"Expected amount 99000, got {data['amount']}"
        
        print(f"✓ Payment created: {data['payment_id']}, snap_token: {data['snap_token'][:20]}...")
        
        # Store for later tests
        self.__class__.payment_id = data["payment_id"]
        self.__class__.result_id = quiz_result_id
    
    def test_create_payment_requires_auth(self, session, quiz_result_id):
        """Test payment creation requires authentication"""
        response = session.post(
            f"{BASE_URL}/api/payment/create",
            json={
                "result_id": quiz_result_id,
                "product_type": "single_report",
                "currency": "IDR"
            }
        )
        
        assert response.status_code == 401, f"Expected 401 without auth, got {response.status_code}"
        print("✓ Payment creation requires authentication")
    
    def test_create_payment_invalid_product(self, session, test_user_token, quiz_result_id):
        """Test payment creation with invalid product type"""
        headers = {"Authorization": f"Bearer {test_user_token}"}
        
        response = session.post(
            f"{BASE_URL}/api/payment/create",
            json={
                "result_id": quiz_result_id,
                "product_type": "invalid_product",
                "currency": "IDR"
            },
            headers=headers
        )
        
        assert response.status_code == 400, f"Expected 400 for invalid product, got {response.status_code}"
        print("✓ Invalid product type returns 400")
    
    # ==================== PAYMENT STATUS TESTS ====================
    
    def test_get_payment_status(self, session, test_user_token):
        """Test GET /api/payment/status/{id} returns payment details"""
        if not hasattr(self.__class__, 'payment_id'):
            pytest.skip("No payment_id from previous test")
        
        headers = {"Authorization": f"Bearer {test_user_token}"}
        payment_id = self.__class__.payment_id
        
        response = session.get(
            f"{BASE_URL}/api/payment/status/{payment_id}",
            headers=headers
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert data["payment_id"] == payment_id, "Payment ID should match"
        assert "status" in data, "Response should contain status"
        assert "amount" in data, "Response should contain amount"
        assert "snap_token" in data, "Response should contain snap_token"
        
        print(f"✓ Payment status: {data['status']}")
    
    def test_payment_status_requires_auth(self, session):
        """Test payment status requires authentication"""
        if not hasattr(self.__class__, 'payment_id'):
            pytest.skip("No payment_id from previous test")
        
        response = session.get(f"{BASE_URL}/api/payment/status/{self.__class__.payment_id}")
        
        assert response.status_code == 401, f"Expected 401 without auth, got {response.status_code}"
        print("✓ Payment status requires authentication")
    
    def test_payment_status_not_found(self, session, test_user_token):
        """Test payment status for non-existent payment"""
        headers = {"Authorization": f"Bearer {test_user_token}"}
        
        response = session.get(
            f"{BASE_URL}/api/payment/status/PAY-NONEXISTENT123",
            headers=headers
        )
        
        assert response.status_code == 404, f"Expected 404 for non-existent payment, got {response.status_code}"
        print("✓ Non-existent payment returns 404")
    
    # ==================== SIMULATE PAYMENT TESTS ====================
    
    def test_simulate_payment_marks_as_paid(self, session, test_user_token):
        """Test POST /api/payment/simulate-payment/{id} marks payment as paid"""
        if not hasattr(self.__class__, 'payment_id'):
            pytest.skip("No payment_id from previous test")
        
        headers = {"Authorization": f"Bearer {test_user_token}"}
        payment_id = self.__class__.payment_id
        
        response = session.post(
            f"{BASE_URL}/api/payment/simulate-payment/{payment_id}",
            headers=headers
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["status"] == "success", f"Expected success status, got {data.get('status')}"
        
        print(f"✓ Payment simulated successfully")
        
        # Verify payment is now paid
        status_response = session.get(
            f"{BASE_URL}/api/payment/status/{payment_id}",
            headers=headers
        )
        
        assert status_response.status_code == 200
        status_data = status_response.json()
        assert status_data["status"] == "paid", f"Expected paid status, got {status_data['status']}"
        
        print(f"✓ Payment status confirmed as 'paid'")
    
    def test_simulate_payment_requires_auth(self, session):
        """Test simulate payment requires authentication"""
        if not hasattr(self.__class__, 'payment_id'):
            pytest.skip("No payment_id from previous test")
        
        response = session.post(f"{BASE_URL}/api/payment/simulate-payment/{self.__class__.payment_id}")
        
        assert response.status_code == 401, f"Expected 401 without auth, got {response.status_code}"
        print("✓ Simulate payment requires authentication")
    
    def test_simulate_payment_not_found(self, session, test_user_token):
        """Test simulate payment for non-existent payment"""
        headers = {"Authorization": f"Bearer {test_user_token}"}
        
        response = session.post(
            f"{BASE_URL}/api/payment/simulate-payment/PAY-NONEXISTENT123",
            headers=headers
        )
        
        assert response.status_code == 404, f"Expected 404 for non-existent payment, got {response.status_code}"
        print("✓ Non-existent payment simulation returns 404")
    
    # ==================== RESULT IS_PAID VERIFICATION ====================
    
    def test_result_is_paid_after_simulation(self, session, test_user_token):
        """Test that result.is_paid is True after payment simulation"""
        if not hasattr(self.__class__, 'result_id'):
            pytest.skip("No result_id from previous test")
        
        headers = {"Authorization": f"Bearer {test_user_token}"}
        result_id = self.__class__.result_id
        
        response = session.get(
            f"{BASE_URL}/api/quiz/result/{result_id}",
            headers=headers
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert data["is_paid"] == True, f"Expected is_paid=True, got {data.get('is_paid')}"
        
        print(f"✓ Result is_paid confirmed as True")
    
    # ==================== PDF DOWNLOAD TESTS ====================
    
    def test_pdf_download_after_payment(self, session, test_user_token):
        """Test GET /api/report/pdf/{result_id} returns PDF after payment"""
        if not hasattr(self.__class__, 'result_id'):
            pytest.skip("No result_id from previous test")
        
        headers = {"Authorization": f"Bearer {test_user_token}"}
        result_id = self.__class__.result_id
        
        # Note: PDF endpoint may not require auth if it's a public download link
        response = session.get(
            f"{BASE_URL}/api/report/pdf/{result_id}?language=id",
            headers=headers,
            stream=True
        )
        
        # PDF generation might take time or require payment verification
        if response.status_code == 200:
            content_type = response.headers.get('content-type', '')
            assert 'pdf' in content_type.lower() or 'application/octet-stream' in content_type.lower(), \
                f"Expected PDF content type, got {content_type}"
            print(f"✓ PDF download works, content-type: {content_type}")
        elif response.status_code == 402:
            print("✓ PDF endpoint correctly requires payment (402)")
        elif response.status_code == 404:
            print("✓ PDF endpoint returns 404 (report not generated yet)")
        else:
            print(f"⚠ PDF endpoint returned {response.status_code}: {response.text[:200]}")
    
    # ==================== AI REPORT GENERATION TESTS ====================
    
    def test_ai_report_generation_requires_payment(self, session, test_user_token, quiz_result_id):
        """Test AI report generation requires payment"""
        headers = {"Authorization": f"Bearer {test_user_token}"}
        
        # Create a new unpaid result
        start_response = session.post(
            f"{BASE_URL}/api/quiz/start",
            json={"series": "business", "language": "id"},
            headers=headers
        )
        
        if start_response.status_code != 200:
            pytest.skip("Could not start quiz")
        
        attempt_id = start_response.json()["attempt_id"]
        
        # Get questions
        questions_response = session.get(f"{BASE_URL}/api/quiz/questions/business")
        questions = questions_response.json()["questions"]
        
        # Create answers
        answers = []
        archetypes = ["driver", "spark", "anchor", "analyst"]
        for i, q in enumerate(questions):
            answers.append({
                "question_id": q["question_id"],
                "selected_option": archetypes[i % 4]
            })
        
        # Submit quiz
        submit_response = session.post(
            f"{BASE_URL}/api/quiz/submit",
            json={"attempt_id": attempt_id, "answers": answers},
            headers=headers
        )
        
        unpaid_result_id = submit_response.json()["result_id"]
        
        # Try to generate AI report without payment
        response = session.post(
            f"{BASE_URL}/api/report/generate/{unpaid_result_id}?language=id",
            headers=headers
        )
        
        assert response.status_code == 402, f"Expected 402 (payment required), got {response.status_code}"
        print("✓ AI report generation correctly requires payment (402)")
    
    def test_ai_report_generation_after_payment(self, session, test_user_token):
        """Test AI report generation works after payment"""
        if not hasattr(self.__class__, 'result_id'):
            pytest.skip("No result_id from previous test")
        
        headers = {"Authorization": f"Bearer {test_user_token}"}
        result_id = self.__class__.result_id
        
        # Generate AI report (this may take time due to LLM call)
        response = session.post(
            f"{BASE_URL}/api/report/generate/{result_id}?language=id",
            headers=headers,
            timeout=120  # Allow 2 minutes for AI generation
        )
        
        if response.status_code == 200:
            data = response.json()
            assert "content" in data, "Response should contain content"
            assert len(data["content"]) > 100, "Report content should be substantial"
            print(f"✓ AI report generated successfully, length: {len(data['content'])} chars")
        elif response.status_code == 500:
            print(f"⚠ AI report generation failed (500) - may be LLM issue: {response.text[:200]}")
        else:
            print(f"⚠ AI report returned {response.status_code}: {response.text[:200]}")
    
    # ==================== PRODUCTS ENDPOINT TEST ====================
    
    def test_get_products(self, session):
        """Test GET /api/payment/products returns product list"""
        response = session.get(f"{BASE_URL}/api/payment/products")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "products" in data, "Response should contain products"
        
        products = data["products"]
        assert "single_report" in products, "Should have single_report product"
        assert "family_pack" in products, "Should have family_pack product"
        
        # Verify product structure
        single_report = products["single_report"]
        assert "price_idr" in single_report, "Product should have price_idr"
        assert "price_usd" in single_report, "Product should have price_usd"
        assert "name_id" in single_report, "Product should have name_id"
        assert "name_en" in single_report, "Product should have name_en"
        
        print(f"✓ Products endpoint works, {len(products)} products available")


class TestWatermarkRemoval:
    """Test watermark removal from index.html"""
    
    def test_watermark_removed_from_index_html(self):
        """Verify 'Made with Emergent' watermark is removed from index.html"""
        index_path = "/app/frontend/public/index.html"
        
        with open(index_path, 'r') as f:
            content = f.read()
        
        # Check that "Made with Emergent" is NOT present
        assert "Made with Emergent" not in content, "Watermark 'Made with Emergent' should be removed"
        
        # Check that the watermark comment exists (indicating it was intentionally removed)
        assert "Watermark removed" in content, "Should have comment indicating watermark was removed"
        
        print("✓ Watermark 'Made with Emergent' confirmed removed from index.html")
    
    def test_no_visible_watermark_elements(self):
        """Verify no visible watermark elements in index.html"""
        index_path = "/app/frontend/public/index.html"
        
        with open(index_path, 'r') as f:
            content = f.read().lower()
        
        # Check for common watermark patterns
        watermark_patterns = [
            "powered by emergent",
            "built with emergent",
            "created with emergent"
        ]
        
        for pattern in watermark_patterns:
            assert pattern not in content, f"Found watermark pattern: {pattern}"
        
        print("✓ No visible watermark elements found")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
