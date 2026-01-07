import requests
import sys
import json
from datetime import datetime

class Relasi4WarnaAPITester:
    def __init__(self, base_url="https://relasi-web.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        self.test_results = []

    def log_test(self, name, success, details="", endpoint=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
        else:
            print(f"❌ {name} - {details}")
            self.failed_tests.append({
                "test": name,
                "endpoint": endpoint,
                "error": details
            })
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details,
            "endpoint": endpoint
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            
            if success:
                self.log_test(name, True, endpoint=endpoint)
                try:
                    return True, response.json()
                except:
                    return True, response.text
            else:
                error_msg = f"Expected {expected_status}, got {response.status_code}"
                try:
                    error_detail = response.json().get('detail', '')
                    if error_detail:
                        error_msg += f" - {error_detail}"
                except:
                    pass
                self.log_test(name, False, error_msg, endpoint)
                return False, {}

        except requests.exceptions.RequestException as e:
            self.log_test(name, False, f"Request failed: {str(e)}", endpoint)
            return False, {}

    def test_health_endpoints(self):
        """Test basic health endpoints"""
        print("\n🔍 Testing Health Endpoints...")
        
        # Test root endpoint
        self.run_test("API Root", "GET", "", 200)
        
        # Test health endpoint
        self.run_test("Health Check", "GET", "health", 200)

    def test_quiz_series(self):
        """Test quiz series endpoint"""
        print("\n🔍 Testing Quiz Series...")
        
        success, response = self.run_test("Get Quiz Series", "GET", "quiz/series", 200)
        
        if success and 'series' in response:
            series_list = response['series']
            expected_series = ['family', 'business', 'friendship', 'couples']
            
            for expected in expected_series:
                found = any(s['id'] == expected for s in series_list)
                self.log_test(f"Series '{expected}' exists", found, 
                            "" if found else f"Series {expected} not found")

    def test_archetypes(self):
        """Test archetypes endpoint"""
        print("\n🔍 Testing Archetypes...")
        
        success, response = self.run_test("Get Archetypes", "GET", "quiz/archetypes", 200)
        
        if success and 'archetypes' in response:
            archetypes = response['archetypes']
            expected_archetypes = ['driver', 'spark', 'anchor', 'analyst']
            
            for expected in expected_archetypes:
                found = expected in archetypes
                self.log_test(f"Archetype '{expected}' exists", found,
                            "" if found else f"Archetype {expected} not found")

    def test_questions(self):
        """Test questions endpoints for each series"""
        print("\n🔍 Testing Questions...")
        
        series_list = ['family', 'business', 'friendship', 'couples']
        
        for series in series_list:
            success, response = self.run_test(
                f"Get Questions for {series}", 
                "GET", 
                f"quiz/questions/{series}?language=id", 
                200
            )
            
            if success and 'questions' in response:
                questions = response['questions']
                self.log_test(f"Questions for {series} not empty", 
                            len(questions) > 0,
                            f"Got {len(questions)} questions" if len(questions) > 0 else "No questions found")

    def test_user_registration(self):
        """Test user registration"""
        print("\n🔍 Testing User Registration...")
        
        # Generate unique email for testing
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        test_email = f"test_{timestamp}@example.com"
        
        user_data = {
            "email": test_email,
            "password": "Test123!",
            "name": "Test User",
            "language": "id"
        }
        
        success, response = self.run_test(
            "User Registration", 
            "POST", 
            "auth/register", 
            200, 
            user_data
        )
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            self.user_id = response['user']['user_id']
            self.log_test("Registration returns token", True)
            self.log_test("Registration returns user data", 'user' in response)
        else:
            self.log_test("Registration failed", False, "No token received")

    def test_user_login(self):
        """Test user login with admin credentials"""
        print("\n🔍 Testing User Login...")
        
        login_data = {
            "email": "admin@relasi4warna.com",
            "password": "Admin123!"
        }
        
        success, response = self.run_test(
            "Admin Login", 
            "POST", 
            "auth/login", 
            200, 
            login_data
        )
        
        if success and 'access_token' in response:
            # Store admin token for later tests
            self.admin_token = response['access_token']
            self.log_test("Login returns token", True)
            self.log_test("Login returns user data", 'user' in response)

    def test_protected_endpoints(self):
        """Test protected endpoints that require authentication"""
        print("\n🔍 Testing Protected Endpoints...")
        
        if not self.token:
            self.log_test("Protected endpoints test", False, "No auth token available")
            return
        
        # Test /auth/me
        self.run_test("Get Current User", "GET", "auth/me", 200)
        
        # Test quiz history
        self.run_test("Get Quiz History", "GET", "quiz/history", 200)

    def test_quiz_flow(self):
        """Test complete quiz flow"""
        print("\n🔍 Testing Quiz Flow...")
        
        if not self.token:
            self.log_test("Quiz flow test", False, "No auth token available")
            return
        
        # Start quiz
        quiz_data = {"series": "family", "language": "id"}
        success, response = self.run_test(
            "Start Quiz", 
            "POST", 
            "quiz/start", 
            200, 
            quiz_data
        )
        
        if not success or 'attempt_id' not in response:
            self.log_test("Quiz flow test", False, "Failed to start quiz")
            return
        
        attempt_id = response['attempt_id']
        
        # Get questions for the quiz
        success, questions_response = self.run_test(
            "Get Quiz Questions", 
            "GET", 
            "quiz/questions/family?language=id", 
            200
        )
        
        if not success or 'questions' not in questions_response:
            self.log_test("Quiz flow test", False, "Failed to get questions")
            return
        
        questions = questions_response['questions']
        
        # Create sample answers
        answers = []
        archetypes = ['driver', 'spark', 'anchor', 'analyst']
        
        for i, question in enumerate(questions):
            answers.append({
                "question_id": question['question_id'],
                "selected_option": archetypes[i % len(archetypes)]
            })
        
        # Submit quiz
        submit_data = {
            "attempt_id": attempt_id,
            "answers": answers
        }
        
        success, submit_response = self.run_test(
            "Submit Quiz", 
            "POST", 
            "quiz/submit", 
            200, 
            submit_data
        )
        
        if success and 'result_id' in submit_response:
            result_id = submit_response['result_id']
            
            # Test get result
            self.run_test(
                "Get Quiz Result", 
                "GET", 
                f"quiz/result/{result_id}", 
                200
            )
            
            self.log_test("Complete quiz flow", True, f"Result ID: {result_id}")
        else:
            self.log_test("Complete quiz flow", False, "Failed to submit quiz")

    def test_payment_endpoints(self):
        """Test payment-related endpoints"""
        print("\n🔍 Testing Payment Endpoints...")
        
        # Test get products
        self.run_test("Get Payment Products", "GET", "payment/products", 200)
        
        if not self.token:
            self.log_test("Payment creation test", False, "No auth token available")
            return
        
        # Test create payment (this will fail without a valid result_id, but we test the endpoint)
        payment_data = {
            "result_id": "dummy_result_id",
            "product_type": "single_report",
            "currency": "IDR"
        }
        
        # This might return 404 due to invalid result_id, but we're testing endpoint availability
        success, response = self.run_test(
            "Create Payment", 
            "POST", 
            "payment/create", 
            404,  # Expecting 404 for dummy result_id
            payment_data
        )

    def test_admin_endpoints(self):
        """Test admin-only endpoints"""
        print("\n🔍 Testing Admin Endpoints...")
        
        if not hasattr(self, 'admin_token') or not self.admin_token:
            self.log_test("Admin endpoints test", False, "No admin token available")
            return
        
        # Store current token and use admin token
        user_token = self.token
        self.token = self.admin_token
        
        # Test admin stats
        self.run_test("Get Admin Stats", "GET", "admin/stats", 200)
        
        # Test admin questions
        self.run_test("Get Admin Questions", "GET", "admin/questions", 200)
        self.run_test("Get Admin Questions for Family", "GET", "admin/questions?series=family", 200)
        
        # Test admin coupons
        self.run_test("Get Admin Coupons", "GET", "admin/coupons", 200)
        
        # Test admin users
        self.run_test("Get Admin Users", "GET", "admin/users", 200)
        
        # Test admin results
        self.run_test("Get Admin Results", "GET", "admin/results", 200)
        
        # Restore user token
        self.token = user_token

    def test_share_endpoints(self):
        """Test share-related endpoints"""
        print("\n🔍 Testing Share Endpoints...")
        
        # Test share card with dummy result_id (should return 404)
        success, response = self.run_test(
            "Get Share Card", 
            "GET", 
            "share/card/dummy_result_id", 
            404
        )
        
        # Test share data with dummy result_id (should return 404)
        success, response = self.run_test(
            "Get Share Data", 
            "GET", 
            "share/data/dummy_result_id", 
            404
        )

    def test_expanded_questions(self):
        """Test that each series has 24 questions (Phase 2 feature)"""
        print("\n🔍 Testing Expanded Questions (24 per series)...")
        
        series_list = ['family', 'business', 'friendship', 'couples']
        
        for series in series_list:
            success, response = self.run_test(
                f"Get Questions for {series}", 
                "GET", 
                f"quiz/questions/{series}?language=id", 
                200
            )
            
            if success and 'questions' in response:
                questions = response['questions']
                expected_count = 24
                actual_count = len(questions)
                
                self.log_test(
                    f"{series} has 24 questions", 
                    actual_count == expected_count,
                    f"Expected {expected_count}, got {actual_count}"
                )
            else:
                self.log_test(f"{series} questions test", False, "Failed to get questions")

    def test_pdf_report_endpoint(self):
        """Test PDF report generation endpoint"""
        print("\n🔍 Testing PDF Report Endpoint...")
        
        if not self.token:
            self.log_test("PDF report test", False, "No auth token available")
            return
        
        # Test PDF report with dummy result_id (should return 404)
        success, response = self.run_test(
            "Get PDF Report", 
            "GET", 
            "report/pdf/dummy_result_id", 
            404
        )

    def run_all_tests(self):
        """Run all tests"""
        print("🚀 Starting Relasi4Warna API Tests...")
        print(f"Testing against: {self.base_url}")
        
        # Run tests in order
        self.test_health_endpoints()
        self.test_quiz_series()
        self.test_archetypes()
        self.test_questions()
        self.test_expanded_questions()  # New Phase 2 test
        self.test_user_registration()
        self.test_user_login()
        self.test_protected_endpoints()
        self.test_quiz_flow()
        self.test_payment_endpoints()
        self.test_admin_endpoints()  # New Phase 2 test
        self.test_share_endpoints()  # New Phase 2 test
        self.test_pdf_report_endpoint()  # New Phase 2 test
        
        # Print summary
        print(f"\n📊 Test Summary:")
        print(f"Tests run: {self.tests_run}")
        print(f"Tests passed: {self.tests_passed}")
        print(f"Tests failed: {len(self.failed_tests)}")
        print(f"Success rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        if self.failed_tests:
            print(f"\n❌ Failed Tests:")
            for test in self.failed_tests:
                print(f"  - {test['test']}: {test['error']}")
        
        return self.tests_passed == self.tests_run

def main():
    tester = Relasi4WarnaAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())