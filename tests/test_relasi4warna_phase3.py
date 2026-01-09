"""
Relasi4Warna Phase 3 Testing - Email, AI Report, and Couples Comparison Features
Tests: User auth, Quiz flow, Email endpoint, AI Report generation, Couples pack features
"""
import pytest
import requests
import os
import time
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://relasi4deploy.preview.emergentagent.com')

# Test credentials
TEST_EMAIL = "test@test.com"
TEST_PASSWORD = "testpassword"
TEST_USER_NAME = "Test User"

class TestHealthAndBasicEndpoints:
    """Basic health and endpoint tests"""
    
    def test_api_health(self):
        """Test API is accessible"""
        response = requests.get(f"{BASE_URL}/api/quiz/series")
        assert response.status_code == 200
        data = response.json()
        assert "series" in data
        assert len(data["series"]) == 4
        print(f"SUCCESS: API health check passed, {len(data['series'])} series found")
    
    def test_archetypes_endpoint(self):
        """Test archetypes endpoint"""
        response = requests.get(f"{BASE_URL}/api/quiz/archetypes")
        assert response.status_code == 200
        data = response.json()
        assert "archetypes" in data
        archetypes = data["archetypes"]
        assert "driver" in archetypes
        assert "spark" in archetypes
        assert "anchor" in archetypes
        assert "analyst" in archetypes
        print("SUCCESS: Archetypes endpoint working correctly")
    
    def test_products_endpoint(self):
        """Test payment products endpoint"""
        response = requests.get(f"{BASE_URL}/api/payment/products")
        assert response.status_code == 200
        data = response.json()
        assert "products" in data
        products = data["products"]
        assert "single_report" in products
        assert "couples_pack" in products
        print(f"SUCCESS: Products endpoint working, {len(products)} products found")


class TestUserAuthentication:
    """User registration and login tests"""
    
    @pytest.fixture(scope="class")
    def session(self):
        return requests.Session()
    
    def test_register_new_user(self, session):
        """Test user registration with unique email"""
        unique_email = f"test_{uuid.uuid4().hex[:8]}@test.com"
        response = session.post(f"{BASE_URL}/api/auth/register", json={
            "email": unique_email,
            "password": "testpassword123",
            "name": "Test User",
            "language": "id"
        })
        # May return 400 if email exists, 200 if new
        if response.status_code == 200:
            data = response.json()
            assert "access_token" in data
            assert "user" in data
            print(f"SUCCESS: New user registered: {unique_email}")
        elif response.status_code == 400:
            print(f"INFO: Email already registered (expected for existing users)")
        else:
            pytest.fail(f"Unexpected status code: {response.status_code}")
    
    def test_login_existing_user(self, session):
        """Test login with test credentials"""
        response = session.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "access_token" in data
        assert "user" in data
        assert data["user"]["email"] == TEST_EMAIL
        print(f"SUCCESS: Login successful for {TEST_EMAIL}")
        return data["access_token"]
    
    def test_login_invalid_credentials(self, session):
        """Test login with wrong password"""
        response = session.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        print("SUCCESS: Invalid credentials correctly rejected")
    
    def test_get_current_user(self, session):
        """Test /auth/me endpoint"""
        # First login
        login_response = session.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        token = login_response.json()["access_token"]
        
        # Get current user
        response = session.get(f"{BASE_URL}/api/auth/me", headers={
            "Authorization": f"Bearer {token}"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == TEST_EMAIL
        print(f"SUCCESS: /auth/me returned correct user data")


class TestQuizFlow:
    """Quiz start, questions, submit, and result tests"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get auth token for tests"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip("Could not authenticate - skipping quiz tests")
        return response.json()["access_token"]
    
    def test_get_questions_family(self, auth_token):
        """Test getting family series questions"""
        response = requests.get(f"{BASE_URL}/api/quiz/questions/family")
        assert response.status_code == 200
        data = response.json()
        assert "questions" in data
        assert len(data["questions"]) > 0
        print(f"SUCCESS: Family series has {len(data['questions'])} questions")
    
    def test_get_questions_couples(self, auth_token):
        """Test getting couples series questions"""
        response = requests.get(f"{BASE_URL}/api/quiz/questions/couples")
        assert response.status_code == 200
        data = response.json()
        assert "questions" in data
        assert len(data["questions"]) > 0
        print(f"SUCCESS: Couples series has {len(data['questions'])} questions")
    
    def test_start_quiz(self, auth_token):
        """Test starting a quiz"""
        response = requests.post(
            f"{BASE_URL}/api/quiz/start",
            json={"series": "couples", "language": "id"},
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "attempt_id" in data
        assert data["series"] == "couples"
        print(f"SUCCESS: Quiz started with attempt_id: {data['attempt_id']}")
        return data["attempt_id"]
    
    def test_submit_quiz_and_get_result(self, auth_token):
        """Test submitting quiz and getting result"""
        # Start quiz
        start_response = requests.post(
            f"{BASE_URL}/api/quiz/start",
            json={"series": "couples", "language": "id"},
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        attempt_id = start_response.json()["attempt_id"]
        
        # Get questions
        questions_response = requests.get(f"{BASE_URL}/api/quiz/questions/couples")
        questions = questions_response.json()["questions"]
        
        # Create answers (alternating archetypes for variety)
        archetypes = ["driver", "spark", "anchor", "analyst"]
        answers = []
        for i, q in enumerate(questions):
            answers.append({
                "question_id": q["question_id"],
                "selected_option": archetypes[i % 4]
            })
        
        # Submit quiz
        submit_response = requests.post(
            f"{BASE_URL}/api/quiz/submit",
            json={"attempt_id": attempt_id, "answers": answers},
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert submit_response.status_code == 200
        result = submit_response.json()
        assert "result_id" in result
        assert "primary_archetype" in result
        assert "secondary_archetype" in result
        assert "scores" in result
        print(f"SUCCESS: Quiz submitted, result_id: {result['result_id']}, primary: {result['primary_archetype']}")
        return result["result_id"]
    
    def test_get_quiz_history(self, auth_token):
        """Test getting quiz history"""
        response = requests.get(
            f"{BASE_URL}/api/quiz/history",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "results" in data
        print(f"SUCCESS: Quiz history returned {len(data['results'])} results")


class TestEmailEndpoint:
    """Email sending endpoint tests"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get auth token for tests"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip("Could not authenticate")
        return response.json()["access_token"]
    
    @pytest.fixture(scope="class")
    def paid_result_id(self, auth_token):
        """Create a quiz result and simulate payment"""
        # Start and submit quiz
        start_response = requests.post(
            f"{BASE_URL}/api/quiz/start",
            json={"series": "family", "language": "id"},
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        attempt_id = start_response.json()["attempt_id"]
        
        # Get questions and create answers
        questions_response = requests.get(f"{BASE_URL}/api/quiz/questions/family")
        questions = questions_response.json()["questions"]
        archetypes = ["driver", "spark", "anchor", "analyst"]
        answers = [{"question_id": q["question_id"], "selected_option": archetypes[i % 4]} for i, q in enumerate(questions)]
        
        # Submit
        submit_response = requests.post(
            f"{BASE_URL}/api/quiz/submit",
            json={"attempt_id": attempt_id, "answers": answers},
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        result_id = submit_response.json()["result_id"]
        
        # Create payment
        payment_response = requests.post(
            f"{BASE_URL}/api/payment/create",
            json={"result_id": result_id, "product_type": "single_report", "currency": "IDR"},
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        payment_id = payment_response.json()["payment_id"]
        
        # Simulate payment
        simulate_response = requests.post(
            f"{BASE_URL}/api/payment/simulate-payment/{payment_id}",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert simulate_response.status_code == 200
        print(f"SUCCESS: Created paid result: {result_id}")
        return result_id
    
    def test_send_email_requires_payment(self, auth_token):
        """Test that email sending requires paid result"""
        # Create unpaid result
        start_response = requests.post(
            f"{BASE_URL}/api/quiz/start",
            json={"series": "friendship", "language": "id"},
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        attempt_id = start_response.json()["attempt_id"]
        
        questions_response = requests.get(f"{BASE_URL}/api/quiz/questions/friendship")
        questions = questions_response.json()["questions"]
        answers = [{"question_id": q["question_id"], "selected_option": "driver"} for q in questions]
        
        submit_response = requests.post(
            f"{BASE_URL}/api/quiz/submit",
            json={"attempt_id": attempt_id, "answers": answers},
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        unpaid_result_id = submit_response.json()["result_id"]
        
        # Try to send email for unpaid result
        response = requests.post(
            f"{BASE_URL}/api/email/send-report",
            json={
                "result_id": unpaid_result_id,
                "recipient_email": "test@example.com",
                "language": "id"
            },
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 402, f"Expected 402 for unpaid result, got {response.status_code}"
        print("SUCCESS: Email endpoint correctly requires payment")
    
    def test_send_email_paid_result(self, auth_token, paid_result_id):
        """Test sending email for paid result (MOCKED - no real email sent)"""
        response = requests.post(
            f"{BASE_URL}/api/email/send-report",
            json={
                "result_id": paid_result_id,
                "recipient_email": "test@example.com",
                "language": "id"
            },
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200, f"Email send failed: {response.text}"
        data = response.json()
        assert data["status"] == "success"
        # Note: Email is MOCKED when RESEND_API_KEY is empty
        print(f"SUCCESS: Email endpoint returned success (MOCKED - no real email sent)")
    
    def test_send_email_invalid_result(self, auth_token):
        """Test sending email for non-existent result"""
        response = requests.post(
            f"{BASE_URL}/api/email/send-report",
            json={
                "result_id": "invalid_result_id",
                "recipient_email": "test@example.com",
                "language": "id"
            },
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 404
        print("SUCCESS: Email endpoint correctly returns 404 for invalid result")


class TestAIReportGeneration:
    """AI Report generation endpoint tests"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get auth token for tests"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip("Could not authenticate")
        return response.json()["access_token"]
    
    @pytest.fixture(scope="class")
    def paid_result_id(self, auth_token):
        """Create a paid quiz result"""
        # Start and submit quiz
        start_response = requests.post(
            f"{BASE_URL}/api/quiz/start",
            json={"series": "business", "language": "id"},
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        attempt_id = start_response.json()["attempt_id"]
        
        questions_response = requests.get(f"{BASE_URL}/api/quiz/questions/business")
        questions = questions_response.json()["questions"]
        archetypes = ["analyst", "anchor", "spark", "driver"]
        answers = [{"question_id": q["question_id"], "selected_option": archetypes[i % 4]} for i, q in enumerate(questions)]
        
        submit_response = requests.post(
            f"{BASE_URL}/api/quiz/submit",
            json={"attempt_id": attempt_id, "answers": answers},
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        result_id = submit_response.json()["result_id"]
        
        # Create and simulate payment
        payment_response = requests.post(
            f"{BASE_URL}/api/payment/create",
            json={"result_id": result_id, "product_type": "single_report", "currency": "IDR"},
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        payment_id = payment_response.json()["payment_id"]
        
        requests.post(
            f"{BASE_URL}/api/payment/simulate-payment/{payment_id}",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        print(f"SUCCESS: Created paid result for AI report test: {result_id}")
        return result_id
    
    def test_ai_report_requires_payment(self, auth_token):
        """Test that AI report generation requires payment"""
        # Create unpaid result
        start_response = requests.post(
            f"{BASE_URL}/api/quiz/start",
            json={"series": "family", "language": "id"},
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        attempt_id = start_response.json()["attempt_id"]
        
        questions_response = requests.get(f"{BASE_URL}/api/quiz/questions/family")
        questions = questions_response.json()["questions"]
        answers = [{"question_id": q["question_id"], "selected_option": "spark"} for q in questions]
        
        submit_response = requests.post(
            f"{BASE_URL}/api/quiz/submit",
            json={"attempt_id": attempt_id, "answers": answers},
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        unpaid_result_id = submit_response.json()["result_id"]
        
        # Try to generate AI report for unpaid result
        response = requests.post(
            f"{BASE_URL}/api/report/generate/{unpaid_result_id}?language=id",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 402, f"Expected 402 for unpaid result, got {response.status_code}"
        print("SUCCESS: AI report endpoint correctly requires payment")
    
    def test_ai_report_generation(self, auth_token, paid_result_id):
        """Test AI report generation for paid result"""
        response = requests.post(
            f"{BASE_URL}/api/report/generate/{paid_result_id}?language=id",
            headers={"Authorization": f"Bearer {auth_token}"},
            timeout=60  # AI generation may take time
        )
        assert response.status_code == 200, f"AI report generation failed: {response.text}"
        data = response.json()
        assert "content" in data or "report_id" in data
        print(f"SUCCESS: AI report generated successfully")
    
    def test_ai_report_invalid_result(self, auth_token):
        """Test AI report for non-existent result"""
        response = requests.post(
            f"{BASE_URL}/api/report/generate/invalid_result_id?language=id",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 404
        print("SUCCESS: AI report endpoint correctly returns 404 for invalid result")


class TestCouplesComparison:
    """Couples pack creation, invitation, and comparison tests"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get auth token for tests"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip("Could not authenticate")
        return response.json()["access_token"]
    
    def test_create_couples_pack(self, auth_token):
        """Test creating a couples pack"""
        response = requests.post(
            f"{BASE_URL}/api/couples/create-pack",
            json={"pack_name": f"Test Pack {uuid.uuid4().hex[:6]}"},
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200, f"Create pack failed: {response.text}"
        data = response.json()
        assert "pack_id" in data
        assert data["status"] == "created"
        print(f"SUCCESS: Couples pack created: {data['pack_id']}")
        return data["pack_id"]
    
    def test_get_my_packs(self, auth_token):
        """Test getting user's couples packs"""
        response = requests.get(
            f"{BASE_URL}/api/couples/my-packs",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "packs" in data
        print(f"SUCCESS: Retrieved {len(data['packs'])} couples packs")
    
    def test_get_pack_details(self, auth_token):
        """Test getting pack details"""
        # First create a pack
        create_response = requests.post(
            f"{BASE_URL}/api/couples/create-pack",
            json={"pack_name": "Detail Test Pack"},
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        pack_id = create_response.json()["pack_id"]
        
        # Get pack details
        response = requests.get(
            f"{BASE_URL}/api/couples/pack/{pack_id}",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["pack_id"] == pack_id
        assert data["status"] == "pending_partner"
        print(f"SUCCESS: Pack details retrieved correctly")
    
    def test_invite_partner(self, auth_token):
        """Test inviting partner to pack"""
        # Create pack
        create_response = requests.post(
            f"{BASE_URL}/api/couples/create-pack",
            json={"pack_name": "Invite Test Pack"},
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        pack_id = create_response.json()["pack_id"]
        
        # Invite partner
        response = requests.post(
            f"{BASE_URL}/api/couples/invite",
            json={"pack_id": pack_id, "partner_email": "partner@example.com"},
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "invited"
        print(f"SUCCESS: Partner invitation sent (MOCKED - no real email)")
    
    def test_get_nonexistent_pack(self, auth_token):
        """Test getting non-existent pack"""
        response = requests.get(
            f"{BASE_URL}/api/couples/pack/nonexistent_pack_id",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 404
        print("SUCCESS: Non-existent pack correctly returns 404")
    
    def test_link_result_to_pack(self, auth_token):
        """Test linking quiz result to couples pack"""
        # Create pack
        create_response = requests.post(
            f"{BASE_URL}/api/couples/create-pack",
            json={"pack_name": "Link Test Pack"},
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        pack_id = create_response.json()["pack_id"]
        
        # Create a couples quiz result
        start_response = requests.post(
            f"{BASE_URL}/api/quiz/start",
            json={"series": "couples", "language": "id"},
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        attempt_id = start_response.json()["attempt_id"]
        
        questions_response = requests.get(f"{BASE_URL}/api/quiz/questions/couples")
        questions = questions_response.json()["questions"]
        answers = [{"question_id": q["question_id"], "selected_option": "anchor"} for q in questions]
        
        submit_response = requests.post(
            f"{BASE_URL}/api/quiz/submit",
            json={"attempt_id": attempt_id, "answers": answers},
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        result_id = submit_response.json()["result_id"]
        
        # Link result to pack
        response = requests.post(
            f"{BASE_URL}/api/couples/link-result/{pack_id}?result_id={result_id}",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "linked"
        print(f"SUCCESS: Result linked to couples pack")


class TestPaymentFlow:
    """Payment creation and simulation tests"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get auth token for tests"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip("Could not authenticate")
        return response.json()["access_token"]
    
    def test_create_payment(self, auth_token):
        """Test creating a payment"""
        # First create a result
        start_response = requests.post(
            f"{BASE_URL}/api/quiz/start",
            json={"series": "family", "language": "id"},
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        attempt_id = start_response.json()["attempt_id"]
        
        questions_response = requests.get(f"{BASE_URL}/api/quiz/questions/family")
        questions = questions_response.json()["questions"]
        answers = [{"question_id": q["question_id"], "selected_option": "driver"} for q in questions]
        
        submit_response = requests.post(
            f"{BASE_URL}/api/quiz/submit",
            json={"attempt_id": attempt_id, "answers": answers},
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        result_id = submit_response.json()["result_id"]
        
        # Create payment
        response = requests.post(
            f"{BASE_URL}/api/payment/create",
            json={"result_id": result_id, "product_type": "single_report", "currency": "IDR"},
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "payment_id" in data
        assert "amount" in data
        print(f"SUCCESS: Payment created: {data['payment_id']}, amount: {data['amount']}")
        return data["payment_id"], result_id
    
    def test_simulate_payment(self, auth_token):
        """Test simulating payment"""
        # Create result and payment
        start_response = requests.post(
            f"{BASE_URL}/api/quiz/start",
            json={"series": "business", "language": "id"},
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        attempt_id = start_response.json()["attempt_id"]
        
        questions_response = requests.get(f"{BASE_URL}/api/quiz/questions/business")
        questions = questions_response.json()["questions"]
        answers = [{"question_id": q["question_id"], "selected_option": "analyst"} for q in questions]
        
        submit_response = requests.post(
            f"{BASE_URL}/api/quiz/submit",
            json={"attempt_id": attempt_id, "answers": answers},
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        result_id = submit_response.json()["result_id"]
        
        payment_response = requests.post(
            f"{BASE_URL}/api/payment/create",
            json={"result_id": result_id, "product_type": "single_report", "currency": "IDR"},
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        payment_id = payment_response.json()["payment_id"]
        
        # Simulate payment
        response = requests.post(
            f"{BASE_URL}/api/payment/simulate-payment/{payment_id}",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        print(f"SUCCESS: Payment simulated successfully")
        
        # Verify result is now paid
        result_response = requests.get(
            f"{BASE_URL}/api/quiz/result/{result_id}",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        result_data = result_response.json()
        assert result_data["is_paid"] == True
        print("SUCCESS: Result marked as paid after simulation")


class TestShareFeatures:
    """Share card and data endpoint tests"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get auth token for tests"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip("Could not authenticate")
        return response.json()["access_token"]
    
    @pytest.fixture(scope="class")
    def result_id(self, auth_token):
        """Create a quiz result"""
        start_response = requests.post(
            f"{BASE_URL}/api/quiz/start",
            json={"series": "friendship", "language": "id"},
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        attempt_id = start_response.json()["attempt_id"]
        
        questions_response = requests.get(f"{BASE_URL}/api/quiz/questions/friendship")
        questions = questions_response.json()["questions"]
        answers = [{"question_id": q["question_id"], "selected_option": "spark"} for q in questions]
        
        submit_response = requests.post(
            f"{BASE_URL}/api/quiz/submit",
            json={"attempt_id": attempt_id, "answers": answers},
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        return submit_response.json()["result_id"]
    
    def test_share_card_endpoint(self, result_id):
        """Test share card SVG generation"""
        response = requests.get(f"{BASE_URL}/api/share/card/{result_id}?language=id")
        assert response.status_code == 200
        assert "image/svg+xml" in response.headers.get("content-type", "")
        print("SUCCESS: Share card SVG generated")
    
    def test_share_data_endpoint(self, result_id):
        """Test share data endpoint"""
        response = requests.get(f"{BASE_URL}/api/share/data/{result_id}?language=id")
        assert response.status_code == 200
        data = response.json()
        assert "title" in data
        assert "description" in data
        assert "image_url" in data
        print(f"SUCCESS: Share data retrieved: {data['title']}")
    
    def test_share_card_invalid_result(self):
        """Test share card for invalid result"""
        response = requests.get(f"{BASE_URL}/api/share/card/invalid_result_id")
        assert response.status_code == 404
        print("SUCCESS: Share card correctly returns 404 for invalid result")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
