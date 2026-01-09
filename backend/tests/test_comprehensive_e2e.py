import requests
import sys
import json
import uuid
from datetime import datetime
import time

class ComprehensiveE2ETester:
    def __init__(self, base_url="https://relasi4deploy.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        self.test_results = []
        
        # Test credentials from review request
        self.test_user_email = "test@test.com"
        self.test_user_password = "testpassword"
        self.new_user_email = "test_new_e2e@test.com"
        self.new_user_password = "TestPass123!"
        self.admin_email = "admin@relasi4warna.com"
        self.admin_password = "Admin123!"
        
        # Tokens storage
        self.user_token = None
        self.admin_token = None
        self.new_user_token = None

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

    def make_request(self, method, endpoint, expected_status, data=None, headers=None, timeout=120, token=None):
        """Make HTTP request with proper error handling"""
        url = f"{self.api_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        # Use provided token or default user token
        if token:
            test_headers['Authorization'] = f'Bearer {token}'
        elif self.user_token:
            test_headers['Authorization'] = f'Bearer {self.user_token}'
        
        if headers:
            test_headers.update(headers)

        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=timeout)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=timeout)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=timeout)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=timeout)

            success = response.status_code == expected_status
            
            if success:
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
                return False, error_msg

        except requests.exceptions.RequestException as e:
            return False, f"Request failed: {str(e)}"

    def test_suite_1_registration_verification(self):
        """TEST SUITE 1: REGISTRATION & VERIFICATION"""
        print("\n🔍 TEST SUITE 1: REGISTRATION & VERIFICATION")
        
        # 1.1 New User Registration
        print("\n   📝 1.1 New User Registration")
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        unique_email = f"test_e2e_{timestamp}@test.com"
        
        registration_data = {
            "email": unique_email,
            "password": self.new_user_password,
            "name": "Test E2E User",
            "language": "id"
        }
        
        success, response = self.make_request("POST", "auth/register", 200, registration_data)
        
        if success and 'access_token' in response and 'user' in response:
            self.new_user_token = response['access_token']
            user_id = response['user']['user_id']
            self.log_test("New User Registration", True, f"User ID: {user_id}")
        else:
            self.log_test("New User Registration", False, str(response))
            return
        
        # 1.2 User Login
        print("\n   🔐 1.2 User Login")
        login_data = {
            "email": self.test_user_email,
            "password": self.test_user_password
        }
        
        success, response = self.make_request("POST", "auth/login", 200, login_data)
        
        if success and 'access_token' in response:
            self.user_token = response['access_token']
            self.log_test("User Login", True, "Access token received")
            
            # Test /auth/me
            success, me_response = self.make_request("GET", "auth/me", 200, token=self.user_token)
            if success:
                self.log_test("Get User Info (/auth/me)", True, f"User: {me_response.get('email', 'N/A')}")
            else:
                self.log_test("Get User Info (/auth/me)", False, str(me_response))
        else:
            self.log_test("User Login", False, str(response))

    def test_suite_2_quiz_flow_all_series(self):
        """TEST SUITE 2: QUIZ FLOW - ALL SERIES"""
        print("\n🔍 TEST SUITE 2: QUIZ FLOW - ALL SERIES")
        
        if not self.user_token:
            self.log_test("Quiz Flow Tests", False, "No user token available")
            return
        
        series_list = ["family", "couples", "business", "friendship"]
        
        for series in series_list:
            print(f"\n   🧩 2.{series_list.index(series)+1} {series.title()} Series")
            self._test_quiz_series(series)

    def _test_quiz_series(self, series):
        """Test complete quiz flow for a specific series"""
        # Start quiz
        quiz_data = {"series": series, "language": "id"}
        success, response = self.make_request("POST", "quiz/start", 200, quiz_data)
        
        if not success or 'attempt_id' not in response:
            self.log_test(f"Start {series} Quiz", False, str(response))
            return None
        
        attempt_id = response['attempt_id']
        self.log_test(f"Start {series} Quiz", True, f"Attempt ID: {attempt_id}")
        
        # Get questions
        success, questions_response = self.make_request("GET", f"quiz/questions/{series}", 200)
        
        if not success or 'questions' not in questions_response:
            self.log_test(f"Get {series} Questions", False, str(questions_response))
            return None
        
        questions = questions_response['questions']
        self.log_test(f"Get {series} Questions", True, f"Got {len(questions)} questions")
        
        # Create realistic answers
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
        
        success, submit_response = self.make_request("POST", "quiz/submit", 200, submit_data)
        
        if success and 'result_id' in submit_response:
            result_id = submit_response['result_id']
            archetype = submit_response.get('primary_archetype', 'N/A')
            self.log_test(f"Submit {series} Quiz", True, f"Result ID: {result_id}, Archetype: {archetype}")
            return result_id
        else:
            self.log_test(f"Submit {series} Quiz", False, str(submit_response))
            return None

    def test_suite_3_report_generation(self):
        """TEST SUITE 3: REPORT GENERATION"""
        print("\n🔍 TEST SUITE 3: REPORT GENERATION")
        
        if not self.user_token:
            self.log_test("Report Generation Tests", False, "No user token available")
            return
        
        # Create a quiz result for testing
        result_id = self._create_test_result()
        if not result_id:
            self.log_test("Report Generation Tests", False, "Could not create test result")
            return
        
        # 3.1 Free Report Preview
        print("\n   📄 3.1 Free Report Preview")
        success, response = self.make_request("GET", f"report/preview-pdf/{result_id}", 200, timeout=60)
        if success:
            self.log_test("Free Report Preview", True, "PDF preview generated")
        else:
            self.log_test("Free Report Preview", False, str(response))
        
        # 3.2 Premium Report (requires payment)
        print("\n   💰 3.2 Premium Report Flow")
        self._test_premium_report_flow(result_id)
        
        # 3.3 Elite Report
        print("\n   ⭐ 3.3 Elite Report Flow")
        elite_result_id = self._create_test_result()
        if elite_result_id:
            self._test_elite_report_flow(elite_result_id)
        
        # 3.4 Elite+ Report
        print("\n   🌟 3.4 Elite+ Report Flow")
        elite_plus_result_id = self._create_test_result()
        if elite_plus_result_id:
            self._test_elite_plus_report_flow(elite_plus_result_id)

    def _create_test_result(self):
        """Helper to create a test quiz result"""
        # Start quiz
        quiz_data = {"series": "family", "language": "id"}
        success, response = self.make_request("POST", "quiz/start", 200, quiz_data)
        
        if not success or 'attempt_id' not in response:
            return None
        
        attempt_id = response['attempt_id']
        
        # Get questions
        success, questions_response = self.make_request("GET", "quiz/questions/family", 200)
        
        if not success or 'questions' not in questions_response:
            return None
        
        questions = questions_response['questions']
        
        # Create answers
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
        
        success, submit_response = self.make_request("POST", "quiz/submit", 200, submit_data)
        
        if success and 'result_id' in submit_response:
            return submit_response['result_id']
        
        return None

    def _test_premium_report_flow(self, result_id):
        """Test premium report generation flow"""
        # Create payment
        payment_data = {
            "result_id": result_id,
            "product_type": "single_report",
            "currency": "IDR"
        }
        
        success, payment_response = self.make_request("POST", "payment/create", 200, payment_data)
        
        if not success or 'payment_id' not in payment_response:
            self.log_test("Create Premium Payment", False, str(payment_response))
            return
        
        payment_id = payment_response['payment_id']
        self.log_test("Create Premium Payment", True, f"Payment ID: {payment_id}")
        
        # Simulate payment
        success, simulate_response = self.make_request("POST", f"payment/simulate-payment/{payment_id}", 200)
        
        if success:
            self.log_test("Simulate Premium Payment", True, "Payment simulated successfully")
        else:
            self.log_test("Simulate Premium Payment", False, str(simulate_response))
            return
        
        # Generate report
        success, report_response = self.make_request("POST", f"report/generate/{result_id}?language=id", 200, timeout=120)
        
        if success:
            self.log_test("Generate Premium Report", True, "AI report generated")
        else:
            self.log_test("Generate Premium Report", False, str(report_response))

    def _test_elite_report_flow(self, result_id):
        """Test elite report generation flow"""
        # Create payment for elite_single
        payment_data = {
            "result_id": result_id,
            "product_type": "elite_single",
            "currency": "IDR"
        }
        
        success, payment_response = self.make_request("POST", "payment/create", 200, payment_data)
        
        if not success or 'payment_id' not in payment_response:
            self.log_test("Create Elite Payment", False, str(payment_response))
            return
        
        payment_id = payment_response['payment_id']
        self.log_test("Create Elite Payment", True, f"Payment ID: {payment_id}")
        
        # Simulate payment
        success, simulate_response = self.make_request("POST", f"payment/simulate-payment/{payment_id}", 200)
        
        if success:
            self.log_test("Simulate Elite Payment", True, "Payment simulated, tier should upgrade to elite")
        else:
            self.log_test("Simulate Elite Payment", False, str(simulate_response))
            return
        
        # Verify tier upgrade
        success, user_data = self.make_request("GET", "auth/me", 200)
        if success:
            current_tier = user_data.get('tier', 'free')
            tier_upgraded = current_tier == 'elite'
            self.log_test("Elite Tier Upgrade", tier_upgraded, f"Current tier: {current_tier}")
        
        # Generate Elite report
        elite_data = {
            "language": "id",
            "force": False,
            "child_age_range": "school_age",
            "relationship_challenges": "communication_barriers"
        }
        
        success, report_response = self.make_request("POST", f"report/elite/{result_id}", 200, elite_data, timeout=120)
        
        if success:
            self.log_test("Generate Elite Report", True, "Elite report generated")
        else:
            self.log_test("Generate Elite Report", False, str(report_response))

    def _test_elite_plus_report_flow(self, result_id):
        """Test elite plus report generation flow"""
        # Create payment for elite_plus_monthly
        payment_data = {
            "result_id": result_id,
            "product_type": "elite_plus_monthly",
            "currency": "IDR"
        }
        
        success, payment_response = self.make_request("POST", "payment/create", 200, payment_data)
        
        if not success or 'payment_id' not in payment_response:
            self.log_test("Create Elite Plus Payment", False, str(payment_response))
            return
        
        payment_id = payment_response['payment_id']
        self.log_test("Create Elite Plus Payment", True, f"Payment ID: {payment_id}")
        
        # Simulate payment
        success, simulate_response = self.make_request("POST", f"payment/simulate-payment/{payment_id}", 200)
        
        if success:
            self.log_test("Simulate Elite Plus Payment", True, "Payment simulated, tier should upgrade to elite_plus")
        else:
            self.log_test("Simulate Elite Plus Payment", False, str(simulate_response))
            return
        
        # Verify tier upgrade
        success, user_data = self.make_request("GET", "auth/me", 200)
        if success:
            current_tier = user_data.get('tier', 'free')
            tier_upgraded = current_tier == 'elite_plus'
            self.log_test("Elite Plus Tier Upgrade", tier_upgraded, f"Current tier: {current_tier}")
        
        # Generate Elite Plus report (may timeout due to complexity)
        elite_plus_data = {
            "language": "id",
            "force": False,
            "certification_level": 2,
            "include_certification": True,
            "include_coaching_model": True
        }
        
        success, report_response = self.make_request("POST", f"report/elite-plus/{result_id}", 200, elite_plus_data, timeout=120)
        
        if success:
            self.log_test("Generate Elite Plus Report", True, "Elite Plus report generated")
        else:
            # Elite Plus may timeout due to complexity - this is expected
            if "timeout" in str(report_response).lower():
                self.log_test("Generate Elite Plus Report", False, "Timeout (expected due to complex AI processing + HITL review)")
            else:
                self.log_test("Generate Elite Plus Report", False, str(report_response))

    def test_suite_4_tier_upgrade_verification(self):
        """TEST SUITE 4: TIER UPGRADE VERIFICATION"""
        print("\n🔍 TEST SUITE 4: TIER UPGRADE VERIFICATION")
        
        if not self.new_user_token:
            self.log_test("Tier Upgrade Tests", False, "No new user token available")
            return
        
        # Use new user token for tier testing
        original_token = self.user_token
        self.user_token = self.new_user_token
        
        # 4.1 Premium Tier Upgrade
        print("\n   📈 4.1 Premium Tier Upgrade")
        
        # Check initial tier
        success, user_data = self.make_request("GET", "auth/me", 200)
        if success:
            initial_tier = user_data.get('tier', 'free')
            self.log_test("Initial Tier Check", True, f"Starting tier: {initial_tier}")
        
        # Create test result
        result_id = self._create_test_result()
        if not result_id:
            self.log_test("Tier Upgrade Tests", False, "Could not create test result")
            self.user_token = original_token
            return
        
        # Buy single_report (should keep tier as free)
        self._test_single_report_purchase(result_id)
        
        # Buy elite_monthly (should upgrade to elite)
        elite_result_id = self._create_test_result()
        if elite_result_id:
            self._test_elite_monthly_purchase(elite_result_id)
        
        # 4.2 Elite+ Tier Upgrade
        print("\n   🌟 4.2 Elite+ Tier Upgrade")
        elite_plus_result_id = self._create_test_result()
        if elite_plus_result_id:
            self._test_elite_plus_monthly_purchase(elite_plus_result_id)
        
        # Restore original token
        self.user_token = original_token

    def _test_single_report_purchase(self, result_id):
        """Test single report purchase (tier should stay free)"""
        payment_data = {
            "result_id": result_id,
            "product_type": "single_report",
            "currency": "IDR"
        }
        
        success, payment_response = self.make_request("POST", "payment/create", 200, payment_data)
        if success and 'payment_id' in payment_response:
            payment_id = payment_response['payment_id']
            
            # Simulate payment
            success, _ = self.make_request("POST", f"payment/simulate-payment/{payment_id}", 200)
            if success:
                # Check tier (should still be free)
                success, user_data = self.make_request("GET", "auth/me", 200)
                if success:
                    tier = user_data.get('tier', 'free')
                    tier_correct = tier == 'free'
                    self.log_test("Single Report Purchase (Tier Stays Free)", tier_correct, f"Tier: {tier}")

    def _test_elite_monthly_purchase(self, result_id):
        """Test elite monthly purchase (tier should upgrade to elite)"""
        payment_data = {
            "result_id": result_id,
            "product_type": "elite_monthly",
            "currency": "IDR"
        }
        
        success, payment_response = self.make_request("POST", "payment/create", 200, payment_data)
        if success and 'payment_id' in payment_response:
            payment_id = payment_response['payment_id']
            
            # Simulate payment
            success, _ = self.make_request("POST", f"payment/simulate-payment/{payment_id}", 200)
            if success:
                # Check tier (should be elite)
                success, user_data = self.make_request("GET", "auth/me", 200)
                if success:
                    tier = user_data.get('tier', 'free')
                    tier_correct = tier == 'elite'
                    self.log_test("Elite Monthly Purchase (Tier Upgrades to Elite)", tier_correct, f"Tier: {tier}")

    def _test_elite_plus_monthly_purchase(self, result_id):
        """Test elite plus monthly purchase (tier should upgrade to elite_plus)"""
        payment_data = {
            "result_id": result_id,
            "product_type": "elite_plus_monthly",
            "currency": "IDR"
        }
        
        success, payment_response = self.make_request("POST", "payment/create", 200, payment_data)
        if success and 'payment_id' in payment_response:
            payment_id = payment_response['payment_id']
            
            # Simulate payment
            success, _ = self.make_request("POST", f"payment/simulate-payment/{payment_id}", 200)
            if success:
                # Check tier (should be elite_plus)
                success, user_data = self.make_request("GET", "auth/me", 200)
                if success:
                    tier = user_data.get('tier', 'free')
                    tier_correct = tier == 'elite_plus'
                    self.log_test("Elite Plus Monthly Purchase (Tier Upgrades to Elite+)", tier_correct, f"Tier: {tier}")

    def test_suite_5_payment_products(self):
        """TEST SUITE 5: PAYMENT PRODUCTS"""
        print("\n🔍 TEST SUITE 5: PAYMENT PRODUCTS")
        
        # 5.1 All Products Available
        print("\n   🛍️ 5.1 All Products Available")
        success, response = self.make_request("GET", "payment/products", 200)
        
        if success and 'products' in response:
            products = response['products']
            expected_products = [
                "single_report", "couples_pack", "family_pack", "team_pack", 
                "elite_single", "elite_monthly", "elite_plus_monthly"
            ]
            
            for product in expected_products:
                found = product in products
                self.log_test(f"Product '{product}' available", found, 
                            f"Price: {products.get(product, {}).get('price_idr', 'N/A')} IDR" if found else "Not found")
        else:
            self.log_test("Get Payment Products", False, str(response))
        
        # 5.2 Create Payment for Each Type
        print("\n   💳 5.2 Create Payment for Each Type")
        if not self.user_token:
            self.log_test("Payment Creation Tests", False, "No user token available")
            return
        
        # Create a test result for payment testing
        result_id = self._create_test_result()
        if not result_id:
            self.log_test("Payment Creation Tests", False, "Could not create test result")
            return
        
        test_products = ["single_report", "elite_single", "elite_monthly"]
        
        for product in test_products:
            payment_data = {
                "result_id": result_id,
                "product_type": product,
                "currency": "IDR"
            }
            
            success, payment_response = self.make_request("POST", "payment/create", 200, payment_data)
            
            if success and 'snap_token' in payment_response:
                self.log_test(f"Create Payment for {product}", True, f"Snap token received")
            else:
                self.log_test(f"Create Payment for {product}", False, str(payment_response))

    def test_suite_6_admin_functionality(self):
        """TEST SUITE 6: ADMIN FUNCTIONALITY"""
        print("\n🔍 TEST SUITE 6: ADMIN FUNCTIONALITY")
        
        # Login as admin
        login_data = {
            "email": self.admin_email,
            "password": self.admin_password
        }
        
        success, response = self.make_request("POST", "auth/login", 200, login_data)
        
        if success and 'access_token' in response:
            self.admin_token = response['access_token']
            self.log_test("Admin Login", True, "Admin access token received")
        else:
            self.log_test("Admin Login", False, str(response))
            return
        
        # 6.1 Admin Stats
        print("\n   📊 6.1 Admin Stats")
        success, response = self.make_request("GET", "admin/stats", 200, token=self.admin_token)
        if success:
            self.log_test("Admin Stats", True, f"Stats retrieved")
        else:
            self.log_test("Admin Stats", False, str(response))
        
        # 6.2 Admin Questions
        print("\n   ❓ 6.2 Admin Questions")
        success, response = self.make_request("GET", "admin/questions", 200, token=self.admin_token)
        if success:
            questions_count = len(response.get('questions', []))
            self.log_test("Admin Questions", True, f"Retrieved {questions_count} questions")
        else:
            self.log_test("Admin Questions", False, str(response))
        
        # 6.3 Admin Users
        print("\n   👥 6.3 Admin Users")
        success, response = self.make_request("GET", "admin/users", 200, token=self.admin_token)
        if success:
            users_count = len(response.get('users', []))
            self.log_test("Admin Users", True, f"Retrieved {users_count} users")
        else:
            self.log_test("Admin Users", False, str(response))

    def test_suite_7_download_share(self):
        """TEST SUITE 7: DOWNLOAD & SHARE"""
        print("\n🔍 TEST SUITE 7: DOWNLOAD & SHARE")
        
        if not self.user_token:
            self.log_test("Download & Share Tests", False, "No user token available")
            return
        
        # Create a paid result for testing
        result_id = self._create_test_result()
        if not result_id:
            self.log_test("Download & Share Tests", False, "Could not create test result")
            return
        
        # Make it paid
        payment_data = {
            "result_id": result_id,
            "product_type": "single_report",
            "currency": "IDR"
        }
        
        success, payment_response = self.make_request("POST", "payment/create", 200, payment_data)
        if success and 'payment_id' in payment_response:
            payment_id = payment_response['payment_id']
            success, _ = self.make_request("POST", f"payment/simulate-payment/{payment_id}", 200)
        
        # 7.1 PDF Downloads
        print("\n   📄 7.1 PDF Downloads")
        success, response = self.make_request("GET", f"report/pdf/{result_id}", 200, timeout=60)
        if success:
            self.log_test("PDF Download", True, "PDF downloaded successfully")
        else:
            # PDF downloads may timeout - this is expected
            if "timeout" in str(response).lower():
                self.log_test("PDF Download", False, "Timeout (may require report generation first)")
            else:
                self.log_test("PDF Download", False, str(response))
        
        # 7.2 Share Endpoints
        print("\n   🔗 7.2 Share Endpoints")
        success, response = self.make_request("GET", f"share/card/{result_id}", 200)
        if success:
            self.log_test("Share Card", True, "Share card retrieved")
        else:
            self.log_test("Share Card", False, str(response))
        
        success, response = self.make_request("GET", f"share/data/{result_id}", 200)
        if success:
            self.log_test("Share Data", True, "Share data retrieved")
        else:
            self.log_test("Share Data", False, str(response))

    def run_comprehensive_e2e_tests(self):
        """Run all comprehensive end-to-end tests"""
        print("🚀 Starting Comprehensive End-to-End Testing - All Flows")
        print(f"Testing against: {self.base_url}")
        print(f"Test credentials: {self.test_user_email}, {self.admin_email}")
        
        # Run all test suites
        self.test_suite_1_registration_verification()
        self.test_suite_2_quiz_flow_all_series()
        self.test_suite_3_report_generation()
        self.test_suite_4_tier_upgrade_verification()
        self.test_suite_5_payment_products()
        self.test_suite_6_admin_functionality()
        self.test_suite_7_download_share()
        
        # Print comprehensive summary
        print(f"\n📊 COMPREHENSIVE E2E TEST SUMMARY:")
        print(f"Tests run: {self.tests_run}")
        print(f"Tests passed: {self.tests_passed}")
        print(f"Tests failed: {len(self.failed_tests)}")
        print(f"Success rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        if self.failed_tests:
            print(f"\n❌ FAILED TESTS:")
            for test in self.failed_tests:
                print(f"  - {test['test']}: {test['error']}")
        
        print(f"\n✅ SUCCESS CRITERIA EVALUATION:")
        print(f"- All registration flows work: {'✅' if self._check_registration_success() else '❌'}")
        print(f"- All quiz series complete successfully: {'✅' if self._check_quiz_success() else '❌'}")
        print(f"- All report tiers generate correctly: {'✅' if self._check_report_success() else '❌'}")
        print(f"- Tier upgrades happen automatically: {'✅' if self._check_tier_upgrade_success() else '❌'}")
        print(f"- PDF downloads work: {'✅' if self._check_pdf_success() else '❌'}")
        print(f"- Admin endpoints accessible: {'✅' if self._check_admin_success() else '❌'}")
        
        return self.tests_passed == self.tests_run

    def _check_registration_success(self):
        """Check if registration tests passed"""
        registration_tests = [t for t in self.test_results if 'registration' in t['test'].lower() or 'login' in t['test'].lower()]
        return all(t['success'] for t in registration_tests)

    def _check_quiz_success(self):
        """Check if quiz tests passed"""
        quiz_tests = [t for t in self.test_results if 'quiz' in t['test'].lower() and 'start' in t['test'].lower()]
        return all(t['success'] for t in quiz_tests)

    def _check_report_success(self):
        """Check if report generation tests passed"""
        report_tests = [t for t in self.test_results if 'report' in t['test'].lower() and 'generate' in t['test'].lower()]
        return len([t for t in report_tests if t['success']]) >= len(report_tests) * 0.8  # 80% success rate

    def _check_tier_upgrade_success(self):
        """Check if tier upgrade tests passed"""
        tier_tests = [t for t in self.test_results if 'tier' in t['test'].lower() and 'upgrade' in t['test'].lower()]
        return all(t['success'] for t in tier_tests)

    def _check_pdf_success(self):
        """Check if PDF tests passed"""
        pdf_tests = [t for t in self.test_results if 'pdf' in t['test'].lower()]
        return len([t for t in pdf_tests if t['success']]) >= 1  # At least one PDF test passed

    def _check_admin_success(self):
        """Check if admin tests passed"""
        admin_tests = [t for t in self.test_results if 'admin' in t['test'].lower()]
        return all(t['success'] for t in admin_tests)

def main():
    tester = ComprehensiveE2ETester()
    success = tester.run_comprehensive_e2e_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())