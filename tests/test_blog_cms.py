"""
Test Blog CMS Feature - Iteration 6
Tests for Blog categories, articles, featured articles, and admin CRUD operations
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_USER = {"email": "test@test.com", "password": "testpassword"}
ADMIN_USER = {"email": "admin@relasi4warna.com", "password": "Admin123!"}


class TestBlogPublicEndpoints:
    """Test public blog endpoints (no auth required)"""
    
    def test_get_blog_categories(self):
        """GET /api/blog/categories - Get all blog categories"""
        response = requests.get(f"{BASE_URL}/api/blog/categories")
        assert response.status_code == 200
        
        data = response.json()
        assert "categories" in data
        categories = data["categories"]
        assert len(categories) == 5  # communication, relationships, archetypes, tips, stories
        
        # Verify category structure
        category_ids = [c["id"] for c in categories]
        assert "communication" in category_ids
        assert "relationships" in category_ids
        assert "archetypes" in category_ids
        assert "tips" in category_ids
        assert "stories" in category_ids
        
        # Verify dual-language support
        for cat in categories:
            assert "name_id" in cat
            assert "name_en" in cat
        print(f"✓ Blog categories returned: {category_ids}")
    
    def test_get_blog_articles_list(self):
        """GET /api/blog/articles - Get paginated articles list"""
        response = requests.get(f"{BASE_URL}/api/blog/articles")
        assert response.status_code == 200
        
        data = response.json()
        assert "articles" in data
        assert "total" in data
        assert "page" in data
        assert "limit" in data
        assert "total_pages" in data
        
        print(f"✓ Blog articles list: {data['total']} total articles, page {data['page']}/{data['total_pages']}")
    
    def test_get_blog_articles_with_pagination(self):
        """GET /api/blog/articles - Test pagination parameters"""
        response = requests.get(f"{BASE_URL}/api/blog/articles?page=1&limit=5")
        assert response.status_code == 200
        
        data = response.json()
        assert data["page"] == 1
        assert data["limit"] == 5
        print(f"✓ Pagination works: page={data['page']}, limit={data['limit']}")
    
    def test_get_blog_articles_by_category(self):
        """GET /api/blog/articles - Filter by category"""
        response = requests.get(f"{BASE_URL}/api/blog/articles?category=communication")
        assert response.status_code == 200
        
        data = response.json()
        assert "articles" in data
        # All returned articles should be in communication category
        for article in data["articles"]:
            assert article["category"] == "communication"
        print(f"✓ Category filter works: {len(data['articles'])} communication articles")
    
    def test_get_featured_articles(self):
        """GET /api/blog/featured - Get featured articles for homepage"""
        response = requests.get(f"{BASE_URL}/api/blog/featured")
        assert response.status_code == 200
        
        data = response.json()
        assert "articles" in data
        # Featured should return max 3 by default
        assert len(data["articles"]) <= 3
        
        # Featured articles should not include full content
        for article in data["articles"]:
            assert "content_id" not in article or article.get("content_id") is None
            assert "content_en" not in article or article.get("content_en") is None
        print(f"✓ Featured articles: {len(data['articles'])} articles returned")
    
    def test_get_featured_articles_custom_limit(self):
        """GET /api/blog/featured - Custom limit parameter"""
        response = requests.get(f"{BASE_URL}/api/blog/featured?limit=5")
        assert response.status_code == 200
        
        data = response.json()
        assert "articles" in data
        assert len(data["articles"]) <= 5
        print(f"✓ Featured with custom limit: {len(data['articles'])} articles")


class TestBlogArticleDetail:
    """Test single article retrieval"""
    
    def test_get_nonexistent_article(self):
        """GET /api/blog/articles/{slug} - Non-existent article returns 404"""
        response = requests.get(f"{BASE_URL}/api/blog/articles/nonexistent-slug-12345")
        assert response.status_code == 404
        print("✓ Non-existent article returns 404")


class TestAdminBlogEndpoints:
    """Test admin blog CRUD operations"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get admin token before each test"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json=ADMIN_USER)
        if response.status_code == 200:
            self.admin_token = response.json()["access_token"]
            self.headers = {"Authorization": f"Bearer {self.admin_token}"}
        else:
            pytest.skip("Admin login failed - skipping admin tests")
    
    def test_admin_login(self):
        """Verify admin can login"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json=ADMIN_USER)
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["user"]["is_admin"] == True
        print(f"✓ Admin login successful: {data['user']['email']}")
    
    def test_admin_get_all_articles(self):
        """GET /api/admin/blog/articles - Get all articles (including drafts)"""
        response = requests.get(
            f"{BASE_URL}/api/admin/blog/articles?status=all",
            headers=self.headers
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "articles" in data
        assert "total" in data
        print(f"✓ Admin articles list: {data['total']} total articles")
    
    def test_admin_create_article(self):
        """POST /api/admin/blog/articles - Create new article"""
        unique_slug = f"test-article-{uuid.uuid4().hex[:8]}"
        article_data = {
            "title_id": "TEST Artikel Komunikasi Efektif",
            "title_en": "TEST Effective Communication Article",
            "slug": unique_slug,
            "excerpt_id": "TEST Ringkasan artikel tentang komunikasi efektif dalam hubungan.",
            "excerpt_en": "TEST Summary of article about effective communication in relationships.",
            "content_id": "## Pendahuluan\n\nTEST Konten artikel dalam Bahasa Indonesia.\n\n- Poin pertama\n- Poin kedua",
            "content_en": "## Introduction\n\nTEST Article content in English.\n\n- First point\n- Second point",
            "category": "communication",
            "tags": ["communication", "tips", "test"],
            "status": "draft"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/admin/blog/articles",
            json=article_data,
            headers=self.headers
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "article_id" in data
        assert data["slug"] == unique_slug
        assert data["title_id"] == article_data["title_id"]
        assert data["title_en"] == article_data["title_en"]
        assert data["category"] == "communication"
        assert data["status"] == "draft"
        assert "tags" in data
        assert "test" in data["tags"]
        
        # Store for cleanup
        self.created_article_id = data["article_id"]
        print(f"✓ Article created: {data['article_id']} with slug '{unique_slug}'")
        
        # Cleanup - delete the test article
        cleanup_response = requests.delete(
            f"{BASE_URL}/api/admin/blog/articles/{data['article_id']}",
            headers=self.headers
        )
        assert cleanup_response.status_code == 200
        print(f"✓ Test article cleaned up")
    
    def test_admin_create_article_duplicate_slug(self):
        """POST /api/admin/blog/articles - Duplicate slug returns 400"""
        unique_slug = f"test-dup-slug-{uuid.uuid4().hex[:8]}"
        article_data = {
            "title_id": "TEST Artikel 1",
            "title_en": "TEST Article 1",
            "slug": unique_slug,
            "excerpt_id": "TEST Ringkasan",
            "excerpt_en": "TEST Summary",
            "content_id": "TEST Konten",
            "content_en": "TEST Content",
            "category": "tips",
            "tags": [],
            "status": "draft"
        }
        
        # Create first article
        response1 = requests.post(
            f"{BASE_URL}/api/admin/blog/articles",
            json=article_data,
            headers=self.headers
        )
        assert response1.status_code == 200
        article_id = response1.json()["article_id"]
        
        # Try to create second article with same slug
        response2 = requests.post(
            f"{BASE_URL}/api/admin/blog/articles",
            json=article_data,
            headers=self.headers
        )
        assert response2.status_code == 400
        assert "Slug already exists" in response2.json().get("detail", "")
        print("✓ Duplicate slug correctly rejected with 400")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/admin/blog/articles/{article_id}", headers=self.headers)
    
    def test_admin_update_article(self):
        """PUT /api/admin/blog/articles/{article_id} - Update article"""
        # First create an article
        unique_slug = f"test-update-{uuid.uuid4().hex[:8]}"
        create_data = {
            "title_id": "TEST Original Title ID",
            "title_en": "TEST Original Title EN",
            "slug": unique_slug,
            "excerpt_id": "TEST Original excerpt",
            "excerpt_en": "TEST Original excerpt EN",
            "content_id": "TEST Original content",
            "content_en": "TEST Original content EN",
            "category": "tips",
            "tags": ["original"],
            "status": "draft"
        }
        
        create_response = requests.post(
            f"{BASE_URL}/api/admin/blog/articles",
            json=create_data,
            headers=self.headers
        )
        assert create_response.status_code == 200
        article_id = create_response.json()["article_id"]
        
        # Update the article
        update_data = {
            "title_en": "TEST Updated Title EN",
            "status": "published",
            "tags": ["updated", "test"]
        }
        
        update_response = requests.put(
            f"{BASE_URL}/api/admin/blog/articles/{article_id}",
            json=update_data,
            headers=self.headers
        )
        assert update_response.status_code == 200
        
        updated = update_response.json()
        assert updated["title_en"] == "TEST Updated Title EN"
        assert updated["status"] == "published"
        assert "updated" in updated["tags"]
        # Original fields should remain
        assert updated["title_id"] == "TEST Original Title ID"
        print(f"✓ Article updated: {article_id}")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/admin/blog/articles/{article_id}", headers=self.headers)
    
    def test_admin_delete_article(self):
        """DELETE /api/admin/blog/articles/{article_id} - Delete article"""
        # First create an article
        unique_slug = f"test-delete-{uuid.uuid4().hex[:8]}"
        create_data = {
            "title_id": "TEST To Delete",
            "title_en": "TEST To Delete EN",
            "slug": unique_slug,
            "excerpt_id": "TEST",
            "excerpt_en": "TEST",
            "content_id": "TEST",
            "content_en": "TEST",
            "category": "stories",
            "tags": [],
            "status": "draft"
        }
        
        create_response = requests.post(
            f"{BASE_URL}/api/admin/blog/articles",
            json=create_data,
            headers=self.headers
        )
        assert create_response.status_code == 200
        article_id = create_response.json()["article_id"]
        
        # Delete the article
        delete_response = requests.delete(
            f"{BASE_URL}/api/admin/blog/articles/{article_id}",
            headers=self.headers
        )
        assert delete_response.status_code == 200
        assert delete_response.json()["status"] == "deleted"
        print(f"✓ Article deleted: {article_id}")
        
        # Verify it's gone
        get_response = requests.get(f"{BASE_URL}/api/blog/articles/{unique_slug}")
        assert get_response.status_code == 404
        print("✓ Deleted article returns 404")
    
    def test_admin_delete_nonexistent_article(self):
        """DELETE /api/admin/blog/articles/{article_id} - Non-existent returns 404"""
        response = requests.delete(
            f"{BASE_URL}/api/admin/blog/articles/nonexistent_article_id",
            headers=self.headers
        )
        assert response.status_code == 404
        print("✓ Delete non-existent article returns 404")
    
    def test_admin_update_nonexistent_article(self):
        """PUT /api/admin/blog/articles/{article_id} - Non-existent returns 404"""
        response = requests.put(
            f"{BASE_URL}/api/admin/blog/articles/nonexistent_article_id",
            json={"title_en": "Updated"},
            headers=self.headers
        )
        assert response.status_code == 404
        print("✓ Update non-existent article returns 404")


class TestAdminBlogAuth:
    """Test admin blog endpoints require authentication"""
    
    def test_create_article_requires_admin(self):
        """POST /api/admin/blog/articles - Requires admin auth"""
        # No auth
        response = requests.post(
            f"{BASE_URL}/api/admin/blog/articles",
            json={"title_id": "Test", "title_en": "Test", "slug": "test"}
        )
        assert response.status_code == 401
        print("✓ Create article requires auth (401)")
    
    def test_create_article_requires_admin_role(self):
        """POST /api/admin/blog/articles - Regular user gets 403"""
        # Login as regular user
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json=TEST_USER)
        if login_response.status_code != 200:
            pytest.skip("Test user login failed")
        
        user_token = login_response.json()["access_token"]
        
        response = requests.post(
            f"{BASE_URL}/api/admin/blog/articles",
            json={"title_id": "Test", "title_en": "Test", "slug": "test"},
            headers={"Authorization": f"Bearer {user_token}"}
        )
        assert response.status_code == 403
        print("✓ Create article requires admin role (403)")
    
    def test_admin_list_requires_admin(self):
        """GET /api/admin/blog/articles - Requires admin auth"""
        response = requests.get(f"{BASE_URL}/api/admin/blog/articles")
        assert response.status_code == 401
        print("✓ Admin list articles requires auth (401)")


class TestBlogArticleViewCount:
    """Test article view count increment"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Create a test article for view count testing"""
        # Login as admin
        response = requests.post(f"{BASE_URL}/api/auth/login", json=ADMIN_USER)
        if response.status_code != 200:
            pytest.skip("Admin login failed")
        
        self.admin_token = response.json()["access_token"]
        self.headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Create test article
        self.test_slug = f"test-views-{uuid.uuid4().hex[:8]}"
        create_data = {
            "title_id": "TEST View Count Article",
            "title_en": "TEST View Count Article EN",
            "slug": self.test_slug,
            "excerpt_id": "TEST",
            "excerpt_en": "TEST",
            "content_id": "TEST Content",
            "content_en": "TEST Content EN",
            "category": "tips",
            "tags": [],
            "status": "published"
        }
        
        create_response = requests.post(
            f"{BASE_URL}/api/admin/blog/articles",
            json=create_data,
            headers=self.headers
        )
        if create_response.status_code == 200:
            self.article_id = create_response.json()["article_id"]
        else:
            pytest.skip("Failed to create test article")
        
        yield
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/admin/blog/articles/{self.article_id}", headers=self.headers)
    
    def test_view_count_increments(self):
        """GET /api/blog/articles/{slug} - View count increments on each view"""
        # First view
        response1 = requests.get(f"{BASE_URL}/api/blog/articles/{self.test_slug}")
        assert response1.status_code == 200
        views1 = response1.json()["views"]
        
        # Second view
        response2 = requests.get(f"{BASE_URL}/api/blog/articles/{self.test_slug}")
        assert response2.status_code == 200
        views2 = response2.json()["views"]
        
        assert views2 == views1 + 1
        print(f"✓ View count incremented: {views1} -> {views2}")


class TestBlogArticleStructure:
    """Test article data structure and dual-language support"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Create a test article"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json=ADMIN_USER)
        if response.status_code != 200:
            pytest.skip("Admin login failed")
        
        self.admin_token = response.json()["access_token"]
        self.headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        self.test_slug = f"test-structure-{uuid.uuid4().hex[:8]}"
        create_data = {
            "title_id": "TEST Judul Bahasa Indonesia",
            "title_en": "TEST English Title",
            "slug": self.test_slug,
            "excerpt_id": "TEST Ringkasan dalam Bahasa Indonesia",
            "excerpt_en": "TEST Summary in English",
            "content_id": "## Heading ID\n\nTEST Konten dalam Bahasa Indonesia.\n\n- Poin 1\n- Poin 2",
            "content_en": "## Heading EN\n\nTEST Content in English.\n\n- Point 1\n- Point 2",
            "category": "relationships",
            "tags": ["test", "dual-language"],
            "status": "published"
        }
        
        create_response = requests.post(
            f"{BASE_URL}/api/admin/blog/articles",
            json=create_data,
            headers=self.headers
        )
        if create_response.status_code == 200:
            self.article_id = create_response.json()["article_id"]
        else:
            pytest.skip("Failed to create test article")
        
        yield
        
        requests.delete(f"{BASE_URL}/api/admin/blog/articles/{self.article_id}", headers=self.headers)
    
    def test_article_has_dual_language_fields(self):
        """Verify article has both ID and EN fields"""
        response = requests.get(f"{BASE_URL}/api/blog/articles/{self.test_slug}")
        assert response.status_code == 200
        
        article = response.json()
        
        # Check dual-language fields
        assert "title_id" in article
        assert "title_en" in article
        assert "excerpt_id" in article
        assert "excerpt_en" in article
        assert "content_id" in article
        assert "content_en" in article
        
        # Verify content
        assert article["title_id"] == "TEST Judul Bahasa Indonesia"
        assert article["title_en"] == "TEST English Title"
        
        print("✓ Article has all dual-language fields")
    
    def test_article_has_metadata(self):
        """Verify article has required metadata"""
        response = requests.get(f"{BASE_URL}/api/blog/articles/{self.test_slug}")
        assert response.status_code == 200
        
        article = response.json()
        
        assert "article_id" in article
        assert "slug" in article
        assert "category" in article
        assert "tags" in article
        assert "status" in article
        assert "author_name" in article
        assert "views" in article
        assert "created_at" in article
        
        print("✓ Article has all required metadata")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
