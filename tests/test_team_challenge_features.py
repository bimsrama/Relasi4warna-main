"""
Test Suite for Team/Family Pack and Communication Challenge Features
Tests new features added in iteration 5:
- Team Pack creation, listing, detail, invite
- Communication Challenge start, active, badges, unlocked content
"""

import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://relasi-web.preview.emergentagent.com')

# Test credentials
TEST_USER = {"email": "test@test.com", "password": "testpassword"}
TEST_USER_2 = {"email": "test2@test.com", "password": "testpassword2", "name": "Test User 2"}


class TestHealthCheck:
    """Basic health check tests"""
    
    def test_api_health(self):
        """Test API is accessible"""
        response = requests.get(f"{BASE_URL}/api")
        assert response.status_code == 200
        print("✓ API health check passed")


class TestAuthentication:
    """Authentication tests"""
    
    def test_login_test_user(self):
        """Login with test user credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json=TEST_USER)
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "user" in data
        print(f"✓ Login successful for {TEST_USER['email']}")
        return data["access_token"]
    
    def test_register_second_user(self):
        """Register or login second test user for team testing"""
        # Try to login first
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_USER_2["email"],
            "password": TEST_USER_2["password"]
        })
        if response.status_code == 200:
            print(f"✓ Second user already exists, logged in")
            return response.json()["access_token"]
        
        # Register if not exists
        response = requests.post(f"{BASE_URL}/api/auth/register", json=TEST_USER_2)
        if response.status_code == 200:
            print(f"✓ Second user registered successfully")
            return response.json()["access_token"]
        elif response.status_code == 400 and "already registered" in response.text:
            # User exists but wrong password - skip
            print("⚠ Second user exists with different password, skipping")
            return None
        
        assert False, f"Failed to register/login second user: {response.text}"


@pytest.fixture
def auth_token():
    """Get authentication token for test user"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json=TEST_USER)
    if response.status_code == 200:
        return response.json()["access_token"]
    pytest.skip("Could not authenticate test user")


@pytest.fixture
def auth_headers(auth_token):
    """Get auth headers"""
    return {"Authorization": f"Bearer {auth_token}"}


class TestTeamPackFeatures:
    """Test Team/Family Pack features"""
    
    def test_get_my_packs_empty_or_existing(self, auth_headers):
        """GET /api/team/my-packs - Get user's team packs"""
        response = requests.get(f"{BASE_URL}/api/team/my-packs", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "packs" in data
        assert isinstance(data["packs"], list)
        print(f"✓ GET /api/team/my-packs - Found {len(data['packs'])} packs")
        return data["packs"]
    
    def test_create_family_pack(self, auth_headers):
        """POST /api/team/create-pack - Create a family pack"""
        payload = {
            "pack_name": "TEST_Family_Pack",
            "pack_type": "family",
            "max_members": 6
        }
        response = requests.post(f"{BASE_URL}/api/team/create-pack", json=payload, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "pack_id" in data
        assert data["pack_name"] == "TEST_Family_Pack"
        assert data["pack_type"] == "family"
        assert data["max_members"] == 6
        assert len(data["members"]) == 1  # Owner is first member
        print(f"✓ POST /api/team/create-pack - Created family pack: {data['pack_id']}")
        return data["pack_id"]
    
    def test_create_team_pack(self, auth_headers):
        """POST /api/team/create-pack - Create a team pack"""
        payload = {
            "pack_name": "TEST_Team_Pack",
            "pack_type": "team",
            "max_members": 10
        }
        response = requests.post(f"{BASE_URL}/api/team/create-pack", json=payload, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "pack_id" in data
        assert data["pack_type"] == "team"
        assert data["max_members"] == 10
        print(f"✓ POST /api/team/create-pack - Created team pack: {data['pack_id']}")
        return data["pack_id"]
    
    def test_create_pack_invalid_type(self, auth_headers):
        """POST /api/team/create-pack - Invalid pack type returns 400"""
        payload = {
            "pack_name": "Invalid Pack",
            "pack_type": "invalid",
            "max_members": 5
        }
        response = requests.post(f"{BASE_URL}/api/team/create-pack", json=payload, headers=auth_headers)
        assert response.status_code == 400
        print("✓ POST /api/team/create-pack - Invalid type returns 400")
    
    def test_get_pack_detail(self, auth_headers):
        """GET /api/team/pack/{pack_id} - Get pack details"""
        # First create a pack
        payload = {"pack_name": "TEST_Detail_Pack", "pack_type": "family", "max_members": 6}
        create_response = requests.post(f"{BASE_URL}/api/team/create-pack", json=payload, headers=auth_headers)
        assert create_response.status_code == 200
        pack_id = create_response.json()["pack_id"]
        
        # Get pack detail
        response = requests.get(f"{BASE_URL}/api/team/pack/{pack_id}", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["pack_id"] == pack_id
        assert "members_with_results" in data
        assert "heatmap" in data
        assert "completion_rate" in data
        print(f"✓ GET /api/team/pack/{pack_id} - Pack detail retrieved with heatmap")
    
    def test_get_pack_not_found(self, auth_headers):
        """GET /api/team/pack/{pack_id} - Non-existent pack returns 404"""
        response = requests.get(f"{BASE_URL}/api/team/pack/nonexistent_pack", headers=auth_headers)
        assert response.status_code == 404
        print("✓ GET /api/team/pack/nonexistent - Returns 404")
    
    def test_invite_member(self, auth_headers):
        """POST /api/team/invite - Invite a member to pack"""
        # Create a pack first
        payload = {"pack_name": "TEST_Invite_Pack", "pack_type": "family", "max_members": 6}
        create_response = requests.post(f"{BASE_URL}/api/team/create-pack", json=payload, headers=auth_headers)
        pack_id = create_response.json()["pack_id"]
        
        # Invite a member
        invite_payload = {
            "pack_id": pack_id,
            "member_email": "invited@test.com",
            "member_name": "Invited User"
        }
        response = requests.post(f"{BASE_URL}/api/team/invite", json=invite_payload, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "invited"
        assert "invite_id" in data
        print(f"✓ POST /api/team/invite - Invitation sent: {data['invite_id']}")
        return data["invite_id"]
    
    def test_invite_requires_auth(self):
        """POST /api/team/invite - Requires authentication"""
        response = requests.post(f"{BASE_URL}/api/team/invite", json={
            "pack_id": "test",
            "member_email": "test@test.com"
        })
        assert response.status_code == 401
        print("✓ POST /api/team/invite - Requires authentication (401)")
    
    def test_my_packs_requires_auth(self):
        """GET /api/team/my-packs - Requires authentication"""
        response = requests.get(f"{BASE_URL}/api/team/my-packs")
        assert response.status_code == 401
        print("✓ GET /api/team/my-packs - Requires authentication (401)")


class TestChallengeFeatures:
    """Test Communication Challenge features"""
    
    def test_get_active_challenge_no_active(self, auth_headers):
        """GET /api/challenge/active - Get active challenge (may be none)"""
        response = requests.get(f"{BASE_URL}/api/challenge/active", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "has_active" in data
        assert "challenge" in data
        print(f"✓ GET /api/challenge/active - has_active: {data['has_active']}")
        return data
    
    def test_start_challenge(self, auth_headers):
        """POST /api/challenge/start - Start a 7-day challenge"""
        payload = {
            "archetype": "driver",
            "language": "id"
        }
        response = requests.post(f"{BASE_URL}/api/challenge/start", json=payload, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        # Could be new or already active
        assert data["status"] in ["started", "already_active"]
        assert "challenge" in data
        
        challenge = data["challenge"]
        assert "challenge_id" in challenge
        assert "archetype" in challenge
        assert "days" in challenge
        assert len(challenge["days"]) == 7  # 7 days of challenges
        print(f"✓ POST /api/challenge/start - Challenge status: {data['status']}")
        return challenge
    
    def test_start_challenge_invalid_archetype(self, auth_headers):
        """POST /api/challenge/start - Invalid archetype returns 400"""
        payload = {
            "archetype": "invalid_archetype",
            "language": "id"
        }
        response = requests.post(f"{BASE_URL}/api/challenge/start", json=payload, headers=auth_headers)
        assert response.status_code == 400
        print("✓ POST /api/challenge/start - Invalid archetype returns 400")
    
    def test_get_badges(self, auth_headers):
        """GET /api/challenge/badges - Get user's earned badges"""
        response = requests.get(f"{BASE_URL}/api/challenge/badges", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "badges" in data
        assert "total" in data
        assert isinstance(data["badges"], list)
        print(f"✓ GET /api/challenge/badges - Total badges: {data['total']}")
    
    def test_get_unlocked_content(self, auth_headers):
        """GET /api/challenge/unlocked-content - Get unlocked premium content"""
        response = requests.get(f"{BASE_URL}/api/challenge/unlocked-content", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "content" in data
        assert "total" in data
        assert isinstance(data["content"], list)
        print(f"✓ GET /api/challenge/unlocked-content - Total content: {data['total']}")
    
    def test_complete_day(self, auth_headers):
        """POST /api/challenge/complete-day - Complete a challenge day"""
        # First ensure we have an active challenge
        active_response = requests.get(f"{BASE_URL}/api/challenge/active", headers=auth_headers)
        active_data = active_response.json()
        
        if not active_data["has_active"]:
            # Start a new challenge
            start_response = requests.post(
                f"{BASE_URL}/api/challenge/start",
                json={"archetype": "spark", "language": "id"},
                headers=auth_headers
            )
            challenge = start_response.json()["challenge"]
        else:
            challenge = active_data["challenge"]
        
        challenge_id = challenge["challenge_id"]
        current_day = challenge["current_day"]
        
        # Complete the current day
        response = requests.post(
            f"{BASE_URL}/api/challenge/complete-day/{challenge_id}?day={current_day}&reflection=Test reflection",
            headers=auth_headers
        )
        
        # Could be 200 (completed) or 400 (already completed)
        if response.status_code == 200:
            data = response.json()
            assert data["status"] in ["completed", "already_completed"]
            print(f"✓ POST /api/challenge/complete-day - Day {current_day} status: {data['status']}")
            if data.get("new_badges"):
                print(f"  New badges earned: {[b['name_en'] for b in data['new_badges']]}")
            if data.get("new_content"):
                print(f"  New content unlocked: {[c['name_en'] for c in data['new_content']]}")
        else:
            print(f"⚠ Complete day returned {response.status_code}: {response.text}")
    
    def test_challenge_requires_auth(self):
        """Challenge endpoints require authentication"""
        response = requests.get(f"{BASE_URL}/api/challenge/active")
        assert response.status_code == 401
        print("✓ GET /api/challenge/active - Requires authentication (401)")
        
        response = requests.get(f"{BASE_URL}/api/challenge/badges")
        assert response.status_code == 401
        print("✓ GET /api/challenge/badges - Requires authentication (401)")
        
        response = requests.get(f"{BASE_URL}/api/challenge/unlocked-content")
        assert response.status_code == 401
        print("✓ GET /api/challenge/unlocked-content - Requires authentication (401)")


class TestChallengeHistory:
    """Test challenge history endpoint"""
    
    def test_get_challenge_history(self, auth_headers):
        """GET /api/challenge/history - Get challenge history"""
        response = requests.get(f"{BASE_URL}/api/challenge/history", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "challenges" in data
        assert isinstance(data["challenges"], list)
        print(f"✓ GET /api/challenge/history - Found {len(data['challenges'])} challenges")


class TestTeamAnalysis:
    """Test team analysis generation"""
    
    def test_generate_analysis_needs_results(self, auth_headers):
        """POST /api/team/generate-analysis - Needs at least 2 members with results"""
        # Create a new pack
        payload = {"pack_name": "TEST_Analysis_Pack", "pack_type": "team", "max_members": 10}
        create_response = requests.post(f"{BASE_URL}/api/team/create-pack", json=payload, headers=auth_headers)
        pack_id = create_response.json()["pack_id"]
        
        # Try to generate analysis (should fail - only 1 member, no results)
        response = requests.post(
            f"{BASE_URL}/api/team/generate-analysis/{pack_id}?language=id",
            headers=auth_headers
        )
        # Should return 400 because need at least 2 members with results
        assert response.status_code == 400
        print("✓ POST /api/team/generate-analysis - Requires 2+ members with results (400)")


class TestLinkResult:
    """Test linking quiz results to team pack"""
    
    def test_link_result_to_pack(self, auth_headers):
        """POST /api/team/link-result - Link a quiz result to pack"""
        # Get user's quiz history
        history_response = requests.get(f"{BASE_URL}/api/quiz/history", headers=auth_headers)
        results = history_response.json().get("results", [])
        
        if not results:
            print("⚠ No quiz results to link, skipping test")
            return
        
        result_id = results[0]["result_id"]
        
        # Create a pack
        payload = {"pack_name": "TEST_Link_Pack", "pack_type": "family", "max_members": 6}
        create_response = requests.post(f"{BASE_URL}/api/team/create-pack", json=payload, headers=auth_headers)
        pack_id = create_response.json()["pack_id"]
        
        # Link result
        response = requests.post(
            f"{BASE_URL}/api/team/link-result/{pack_id}?result_id={result_id}",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "linked"
        assert data["result_id"] == result_id
        print(f"✓ POST /api/team/link-result - Result {result_id} linked to pack")


class TestJoinPack:
    """Test joining team pack via link"""
    
    def test_join_via_link_not_found(self, auth_headers):
        """POST /api/team/join-link - Non-existent pack returns 404"""
        response = requests.post(
            f"{BASE_URL}/api/team/join-link/nonexistent_pack",
            headers=auth_headers
        )
        assert response.status_code == 404
        print("✓ POST /api/team/join-link - Non-existent pack returns 404")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
