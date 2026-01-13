#!/usr/bin/env python3
"""
Gaea Store Backend API Testing Suite
Tests all backend endpoints according to test_result.md priorities
"""

import requests
import json
import sys
from typing import Dict, Any, Optional

# Base URL from environment
BASE_URL = "https://gaea-eco.preview.emergentagent.com/api"

class GaeaStoreAPITester:
    def __init__(self):
        self.base_url = BASE_URL
        self.auth_token = None
        self.test_user_email = "sarah.tester@gaea.com"
        self.test_user_password = "SecurePass123!"
        self.test_user_name = "Sarah Tester"
        self.product_id = None
        self.results = {
            "passed": 0,
            "failed": 0,
            "details": []
        }

    def log_result(self, test_name: str, success: bool, details: str = ""):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name}")
        if details:
            print(f"   Details: {details}")
        
        self.results["details"].append({
            "test": test_name,
            "success": success,
            "details": details
        })
        
        if success:
            self.results["passed"] += 1
        else:
            self.results["failed"] += 1

    def make_request(self, method: str, endpoint: str, data: Dict = None, headers: Dict = None) -> tuple:
        """Make HTTP request and return (success, response_data, status_code)"""
        url = f"{self.base_url}{endpoint}"
        default_headers = {"Content-Type": "application/json"}
        
        if headers:
            default_headers.update(headers)
        
        try:
            if method.upper() == "GET":
                response = requests.get(url, headers=default_headers, timeout=30)
            elif method.upper() == "POST":
                response = requests.post(url, json=data, headers=default_headers, timeout=30)
            elif method.upper() == "PUT":
                response = requests.put(url, json=data, headers=default_headers, timeout=30)
            elif method.upper() == "DELETE":
                response = requests.delete(url, headers=default_headers, timeout=30)
            else:
                return False, {"error": f"Unsupported method: {method}"}, 0
            
            try:
                response_data = response.json()
            except:
                response_data = {"raw_response": response.text}
            
            return response.status_code < 400, response_data, response.status_code
            
        except requests.exceptions.RequestException as e:
            return False, {"error": str(e)}, 0

    def test_health_check(self):
        """Test GET /api/health"""
        print("\n=== Testing Health Check API ===")
        success, data, status = self.make_request("GET", "/health")
        
        if success and data.get("status") == "healthy":
            self.log_result("Health Check API", True, f"Status: {data.get('status')}")
        else:
            self.log_result("Health Check API", False, f"Status: {status}, Data: {data}")

    def test_products_api(self):
        """Test GET /api/products with various filters"""
        print("\n=== Testing Products API ===")
        
        # Test 1: Get all products
        success, data, status = self.make_request("GET", "/products")
        if success and isinstance(data, list) and len(data) > 0:
            self.log_result("Products API - List all", True, f"Found {len(data)} products")
            # Store first product ID for cart testing
            if data[0].get("id"):
                self.product_id = data[0]["id"]
                print(f"   Stored product ID for cart testing: {self.product_id}")
        else:
            self.log_result("Products API - List all", False, f"Status: {status}, Data: {data}")
            return
        
        # Test 2: Filter by category
        success, data, status = self.make_request("GET", "/products?category=personal-care")
        if success and isinstance(data, list):
            personal_care_count = len(data)
            self.log_result("Products API - Filter by category", True, f"Found {personal_care_count} personal-care products")
        else:
            self.log_result("Products API - Filter by category", False, f"Status: {status}, Data: {data}")
        
        # Test 3: Filter by featured
        success, data, status = self.make_request("GET", "/products?featured=true")
        if success and isinstance(data, list):
            featured_count = len(data)
            self.log_result("Products API - Filter by featured", True, f"Found {featured_count} featured products")
        else:
            self.log_result("Products API - Filter by featured", False, f"Status: {status}, Data: {data}")

    def test_categories_api(self):
        """Test GET /api/categories"""
        print("\n=== Testing Categories API ===")
        success, data, status = self.make_request("GET", "/categories")
        
        if success and isinstance(data, list) and len(data) > 0:
            categories = [cat.get("name", "Unknown") for cat in data]
            self.log_result("Categories API", True, f"Found {len(data)} categories: {', '.join(categories)}")
        else:
            self.log_result("Categories API", False, f"Status: {status}, Data: {data}")

    def test_testimonials_api(self):
        """Test GET /api/testimonials"""
        print("\n=== Testing Testimonials API ===")
        success, data, status = self.make_request("GET", "/testimonials")
        
        if success and isinstance(data, list) and len(data) > 0:
            self.log_result("Testimonials API", True, f"Found {len(data)} testimonials")
        else:
            self.log_result("Testimonials API", False, f"Status: {status}, Data: {data}")

    def test_user_registration(self):
        """Test POST /api/auth/register"""
        print("\n=== Testing User Registration ===")
        
        user_data = {
            "email": self.test_user_email,
            "password": self.test_user_password,
            "name": self.test_user_name
        }
        
        success, data, status = self.make_request("POST", "/auth/register", user_data)
        
        if success and data.get("token") and data.get("user"):
            self.auth_token = data["token"]
            user_info = data["user"]
            self.log_result("User Registration", True, f"User created: {user_info.get('name')} ({user_info.get('email')})")
        elif status == 400 and "already registered" in str(data.get("error", "")).lower():
            # User already exists, try to login instead
            self.log_result("User Registration", True, "User already exists (expected for repeated tests)")
            self.test_user_login()  # Try to login with existing user
        else:
            self.log_result("User Registration", False, f"Status: {status}, Data: {data}")

    def test_user_login(self):
        """Test POST /api/auth/login"""
        print("\n=== Testing User Login ===")
        
        login_data = {
            "email": self.test_user_email,
            "password": self.test_user_password
        }
        
        success, data, status = self.make_request("POST", "/auth/login", login_data)
        
        if success and data.get("token") and data.get("user"):
            self.auth_token = data["token"]
            user_info = data["user"]
            self.log_result("User Login", True, f"Login successful: {user_info.get('name')} ({user_info.get('email')})")
        else:
            self.log_result("User Login", False, f"Status: {status}, Data: {data}")

    def test_auth_me(self):
        """Test GET /api/auth/me"""
        print("\n=== Testing Auth Me API ===")
        
        if not self.auth_token:
            self.log_result("Auth Me API", False, "No auth token available")
            return
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        success, data, status = self.make_request("GET", "/auth/me", headers=headers)
        
        if success and data.get("email") == self.test_user_email:
            self.log_result("Auth Me API", True, f"User profile retrieved: {data.get('name')}")
        else:
            self.log_result("Auth Me API", False, f"Status: {status}, Data: {data}")

    def test_cart_add_item(self):
        """Test POST /api/cart/add"""
        print("\n=== Testing Cart Add Item ===")
        
        if not self.auth_token:
            self.log_result("Cart Add Item", False, "No auth token available")
            return
        
        if not self.product_id:
            self.log_result("Cart Add Item", False, "No product ID available")
            return
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        cart_data = {
            "productId": self.product_id,
            "quantity": 2
        }
        
        success, data, status = self.make_request("POST", "/cart/add", cart_data, headers)
        
        if success and data.get("items") and len(data["items"]) > 0:
            item = data["items"][0]
            self.log_result("Cart Add Item", True, f"Added {item.get('quantity')} x {item.get('name')} to cart")
        else:
            self.log_result("Cart Add Item", False, f"Status: {status}, Data: {data}")

    def test_cart_get(self):
        """Test GET /api/cart"""
        print("\n=== Testing Get Cart ===")
        
        if not self.auth_token:
            self.log_result("Get Cart", False, "No auth token available")
            return
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        success, data, status = self.make_request("GET", "/cart", headers=headers)
        
        if success and "items" in data:
            item_count = len(data["items"])
            self.log_result("Get Cart", True, f"Cart retrieved with {item_count} items")
        else:
            self.log_result("Get Cart", False, f"Status: {status}, Data: {data}")

    def test_newsletter_subscription(self):
        """Test POST /api/newsletter"""
        print("\n=== Testing Newsletter Subscription ===")
        
        newsletter_data = {
            "email": "newsletter.test@gaea.com"
        }
        
        success, data, status = self.make_request("POST", "/newsletter", newsletter_data)
        
        if success and (data.get("success") or "subscribed" in str(data.get("message", "")).lower()):
            self.log_result("Newsletter Subscription", True, f"Message: {data.get('message')}")
        else:
            self.log_result("Newsletter Subscription", False, f"Status: {status}, Data: {data}")

    def test_b2b_leads_submission(self):
        """Test POST /api/leads"""
        print("\n=== Testing B2B Leads Submission ===")
        
        lead_data = {
            "companyName": "Sustainable Solutions Corp",
            "contactName": "Alex Johnson",
            "email": "alex.johnson@sustainablesolutions.com",
            "phone": "+1-555-0123",
            "type": "corporate",
            "message": "Interested in bulk orders for our office sustainability initiative.",
            "country": "United States"
        }
        
        success, data, status = self.make_request("POST", "/leads", lead_data)
        
        if success and (data.get("success") or "contact you soon" in str(data.get("message", "")).lower()):
            self.log_result("B2B Leads Submission", True, f"Message: {data.get('message')}")
        else:
            self.log_result("B2B Leads Submission", False, f"Status: {status}, Data: {data}")

    def run_all_tests(self):
        """Run all backend API tests in priority order"""
        print(f"🚀 Starting Gaea Store Backend API Tests")
        print(f"📍 Base URL: {self.base_url}")
        print("=" * 60)
        
        # High Priority Tests (from test_plan.current_focus)
        self.test_health_check()
        self.test_products_api()
        self.test_user_registration()
        self.test_user_login()
        self.test_auth_me()
        self.test_cart_add_item()
        self.test_cart_get()
        
        # Medium Priority Tests
        self.test_categories_api()
        self.test_testimonials_api()
        self.test_b2b_leads_submission()
        
        # Low Priority Tests
        self.test_newsletter_subscription()
        
        # Print Summary
        print("\n" + "=" * 60)
        print("🏁 TEST SUMMARY")
        print("=" * 60)
        print(f"✅ Passed: {self.results['passed']}")
        print(f"❌ Failed: {self.results['failed']}")
        print(f"📊 Total: {self.results['passed'] + self.results['failed']}")
        
        if self.results['failed'] > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.results['details']:
                if not result['success']:
                    print(f"   • {result['test']}: {result['details']}")
        
        return self.results['failed'] == 0

if __name__ == "__main__":
    tester = GaeaStoreAPITester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)