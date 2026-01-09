#!/usr/bin/env python3
"""
Focused test for report generation and tier upgrade flows
"""
import requests
import json
import time

BASE_URL = "https://relasi4deploy.preview.emergentagent.com"
API_URL = f"{BASE_URL}/api"

def test_report_flows():
    print("🔍 Testing Report Generation & Tier Upgrade Flows...")
    
    # Login with test user
    login_data = {
        "email": "test@test.com",
        "password": "testpassword"
    }
    
    print("1. Logging in...")
    response = requests.post(f"{API_URL}/auth/login", json=login_data, timeout=30)
    if response.status_code != 200:
        print(f"❌ Login failed: {response.status_code}")
        return
    
    token = response.json()['access_token']
    user_id = response.json()['user']['user_id']
    headers = {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}
    
    # Check user tier
    print("2. Checking user tier...")
    response = requests.get(f"{API_URL}/auth/me", headers=headers, timeout=30)
    if response.status_code == 200:
        tier = response.json().get('tier', 'free')
        print(f"   Current tier: {tier}")
    
    # Create a quiz result
    print("3. Creating quiz result...")
    result_id = create_quiz_result(headers)
    if not result_id:
        print("❌ Failed to create quiz result")
        return
    
    print(f"   Created result: {result_id}")
    
    # Test Premium Report Flow
    print("\n4. Testing Premium Report Flow...")
    test_premium_flow(result_id, headers)
    
    # Test Elite Report Flow
    print("\n5. Testing Elite Report Flow...")
    result_id_2 = create_quiz_result(headers)
    if result_id_2:
        test_elite_flow(result_id_2, headers)
    
    # Test Elite Plus Report Flow
    print("\n6. Testing Elite Plus Report Flow...")
    result_id_3 = create_quiz_result(headers)
    if result_id_3:
        test_elite_plus_flow(result_id_3, headers)

def create_quiz_result(headers):
    """Create a quiz and return result_id"""
    # Start quiz
    quiz_data = {"series": "family", "language": "id"}
    response = requests.post(f"{API_URL}/quiz/start", json=quiz_data, headers=headers, timeout=30)
    if response.status_code != 200:
        return None
    
    attempt_id = response.json()['attempt_id']
    
    # Get questions
    response = requests.get(f"{API_URL}/quiz/questions/family?language=id", headers=headers, timeout=30)
    if response.status_code != 200:
        return None
    
    questions = response.json()['questions']
    
    # Create answers
    answers = []
    archetypes = ['driver', 'spark', 'anchor', 'analyst']
    for i, question in enumerate(questions):
        answers.append({
            "question_id": question['question_id'],
            "selected_option": archetypes[i % len(archetypes)]
        })
    
    # Submit quiz
    submit_data = {"attempt_id": attempt_id, "answers": answers}
    response = requests.post(f"{API_URL}/quiz/submit", json=submit_data, headers=headers, timeout=30)
    if response.status_code != 200:
        return None
    
    return response.json()['result_id']

def test_premium_flow(result_id, headers):
    """Test premium report flow"""
    # Create payment
    payment_data = {
        "result_id": result_id,
        "product_type": "single_report",
        "currency": "IDR"
    }
    
    response = requests.post(f"{API_URL}/payment/create", json=payment_data, headers=headers, timeout=30)
    if response.status_code != 200:
        print(f"   ❌ Payment creation failed: {response.status_code}")
        return
    
    payment_id = response.json()['payment_id']
    print(f"   ✅ Payment created: {payment_id}")
    
    # Simulate payment
    response = requests.post(f"{API_URL}/payment/simulate-payment/{payment_id}", headers=headers, timeout=30)
    if response.status_code != 200:
        print(f"   ❌ Payment simulation failed: {response.status_code}")
        return
    
    print("   ✅ Payment simulated")
    
    # Generate report
    print("   🔄 Generating premium report (may take 60+ seconds)...")
    response = requests.post(f"{API_URL}/report/generate/{result_id}?language=id", headers=headers, timeout=120)
    if response.status_code == 200:
        print("   ✅ Premium report generated successfully")
    else:
        print(f"   ❌ Premium report generation failed: {response.status_code}")
        try:
            error = response.json()
            print(f"      Error: {error}")
        except:
            print(f"      Response: {response.text[:200]}")

def test_elite_flow(result_id, headers):
    """Test elite report flow"""
    # Create payment for elite_single
    payment_data = {
        "result_id": result_id,
        "product_type": "elite_single",
        "currency": "IDR"
    }
    
    response = requests.post(f"{API_URL}/payment/create", json=payment_data, headers=headers, timeout=30)
    if response.status_code != 200:
        print(f"   ❌ Elite payment creation failed: {response.status_code}")
        return
    
    payment_id = response.json()['payment_id']
    print(f"   ✅ Elite payment created: {payment_id}")
    
    # Simulate payment
    response = requests.post(f"{API_URL}/payment/simulate-payment/{payment_id}", headers=headers, timeout=30)
    if response.status_code != 200:
        print(f"   ❌ Elite payment simulation failed: {response.status_code}")
        return
    
    print("   ✅ Elite payment simulated")
    
    # Check tier upgrade
    response = requests.get(f"{API_URL}/auth/me", headers=headers, timeout=30)
    if response.status_code == 200:
        tier = response.json().get('tier', 'free')
        print(f"   ✅ Tier after payment: {tier}")
    
    # Generate Elite report
    print("   🔄 Generating elite report (may take 60+ seconds)...")
    elite_data = {
        "language": "id",
        "force": False,
        "child_age_range": "school_age",
        "relationship_challenges": "communication_barriers"
    }
    
    response = requests.post(f"{API_URL}/report/elite/{result_id}", json=elite_data, headers=headers, timeout=120)
    if response.status_code == 200:
        print("   ✅ Elite report generated successfully")
    else:
        print(f"   ❌ Elite report generation failed: {response.status_code}")
        try:
            error = response.json()
            print(f"      Error: {error}")
        except:
            print(f"      Response: {response.text[:200]}")

def test_elite_plus_flow(result_id, headers):
    """Test elite plus report flow"""
    # Create payment for elite_plus_monthly
    payment_data = {
        "result_id": result_id,
        "product_type": "elite_plus_monthly",
        "currency": "IDR"
    }
    
    response = requests.post(f"{API_URL}/payment/create", json=payment_data, headers=headers, timeout=30)
    if response.status_code != 200:
        print(f"   ❌ Elite Plus payment creation failed: {response.status_code}")
        return
    
    payment_id = response.json()['payment_id']
    print(f"   ✅ Elite Plus payment created: {payment_id}")
    
    # Simulate payment
    response = requests.post(f"{API_URL}/payment/simulate-payment/{payment_id}", headers=headers, timeout=30)
    if response.status_code != 200:
        print(f"   ❌ Elite Plus payment simulation failed: {response.status_code}")
        return
    
    print("   ✅ Elite Plus payment simulated")
    
    # Check tier upgrade
    response = requests.get(f"{API_URL}/auth/me", headers=headers, timeout=30)
    if response.status_code == 200:
        tier = response.json().get('tier', 'free')
        print(f"   ✅ Tier after payment: {tier}")
    
    # Generate Elite Plus report
    print("   🔄 Generating elite plus report (may take 60+ seconds)...")
    elite_plus_data = {
        "language": "id",
        "force": False,
        "certification_level": 2,
        "include_certification": True,
        "include_coaching_model": True
    }
    
    response = requests.post(f"{API_URL}/report/elite-plus/{result_id}", json=elite_plus_data, headers=headers, timeout=120)
    if response.status_code == 200:
        print("   ✅ Elite Plus report generated successfully")
    else:
        print(f"   ❌ Elite Plus report generation failed: {response.status_code}")
        try:
            error = response.json()
            print(f"      Error: {error}")
        except:
            print(f"      Response: {response.text[:200]}")

if __name__ == "__main__":
    test_report_flows()