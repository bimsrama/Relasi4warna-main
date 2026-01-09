#!/usr/bin/env python3
"""
Test PDF download functionality
"""
import requests

BASE_URL = "https://relasi4deploy.preview.emergentagent.com"
API_URL = f"{BASE_URL}/api"

def test_pdf_downloads():
    print("🔍 Testing PDF Downloads...")
    
    # Login with test user
    login_data = {
        "email": "test@test.com",
        "password": "testpassword"
    }
    
    response = requests.post(f"{API_URL}/auth/login", json=login_data, timeout=30)
    if response.status_code != 200:
        print(f"❌ Login failed: {response.status_code}")
        return
    
    token = response.json()['access_token']
    headers = {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}
    
    # Get user's quiz results to find a valid result_id
    response = requests.get(f"{API_URL}/quiz/history", headers=headers, timeout=30)
    if response.status_code != 200:
        print(f"❌ Failed to get quiz history: {response.status_code}")
        return
    
    results = response.json().get('results', [])
    if not results:
        print("❌ No quiz results found")
        return
    
    # Find a paid result
    paid_result = None
    for result in results:
        if result.get('is_paid', False):
            paid_result = result
            break
    
    if not paid_result:
        print("❌ No paid results found")
        return
    
    result_id = paid_result['result_id']
    print(f"✅ Found paid result: {result_id}")
    
    # Test preview PDF download
    print("🔄 Testing preview PDF download...")
    response = requests.get(f"{API_URL}/report/preview-pdf/{result_id}", headers=headers, timeout=60)
    if response.status_code == 200:
        print(f"   ✅ Preview PDF downloaded successfully ({len(response.content)} bytes)")
    else:
        print(f"   ❌ Preview PDF download failed: {response.status_code}")
        try:
            error = response.json()
            print(f"      Error: {error}")
        except:
            print(f"      Response: {response.text[:200]}")
    
    # Test premium PDF download
    print("🔄 Testing premium PDF download...")
    response = requests.get(f"{API_URL}/report/pdf/{result_id}", headers=headers, timeout=60)
    if response.status_code == 200:
        print(f"   ✅ Premium PDF downloaded successfully ({len(response.content)} bytes)")
    else:
        print(f"   ❌ Premium PDF download failed: {response.status_code}")
        try:
            error = response.json()
            print(f"      Error: {error}")
        except:
            print(f"      Response: {response.text[:200]}")

if __name__ == "__main__":
    test_pdf_downloads()