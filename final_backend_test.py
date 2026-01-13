#!/usr/bin/env python3
"""
Final Comprehensive Backend API Testing for Gaea Store - New Endpoints
Testing Orders API, Blog API, and Collective API with detailed results
"""

import requests
import json
import sys
from datetime import datetime

# Get base URL from environment
BASE_URL = "https://gaea-eco.preview.emergentagent.com/api"

class FinalGaeaAPITester:
    def __init__(self):
        self.base_url = BASE_URL
        self.admin_token = None
        self.user_token = None
        self.results = {
            'orders': {'create': False, 'get': False, 'auth': False},
            'blog': {'public_get': False, 'featured_get': False, 'admin_create': False, 'admin_get': False, 'auth': False},
            'collective': {'apply': False, 'status': False, 'admin_get': False, 'admin_approve': False, 'auth': False}
        }
        
    def log(self, message):
        print(f"[{datetime.now().strftime('%H:%M:%S')}] {message}")
        
    def setup_users(self):
        """Setup test users"""
        try:
            # Create test user
            user_data = {
                "email": f"testuser_{datetime.now().strftime('%H%M%S')}@gaea.co",
                "password": "testpass123",
                "name": "Emma Green"
            }
            
            response = requests.post(f"{self.base_url}/auth/register", json=user_data)
            if response.status_code == 200:
                data = response.json()
                self.user_token = data.get('token')
                self.log(f"✅ Test user created: {user_data['email']}")
                return True
            else:
                self.log(f"❌ User creation failed: {response.text}")
                return False
                
        except Exception as e:
            self.log(f"❌ User setup error: {str(e)}")
            return False

    def test_orders_comprehensive(self):
        """Comprehensive Orders API testing"""
        self.log("\n🛒 COMPREHENSIVE ORDERS API TESTING")
        
        # Test 1: Create Order
        try:
            self.log("Testing POST /api/orders - Create Order...")
            
            order_data = {
                "shippingAddress": {
                    "firstName": "Emma",
                    "lastName": "Green",
                    "email": "emma.green@example.com",
                    "phone": "+1-555-0123",
                    "address": "123 Eco Street",
                    "city": "Portland",
                    "state": "OR",
                    "zip": "97201",
                    "country": "USA"
                },
                "paymentMethod": "card",
                "items": [
                    {
                        "productId": "bamboo-toothbrush-set",
                        "name": "Bamboo Toothbrush Set",
                        "price": 24.99,
                        "quantity": 2
                    }
                ],
                "subtotal": 49.98,
                "shipping": 5.99,
                "total": 55.97
            }
            
            headers = {"Authorization": f"Bearer {self.user_token}"}
            response = requests.post(f"{self.base_url}/orders", json=order_data, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and data.get('order', {}).get('orderNumber'):
                    self.results['orders']['create'] = True
                    self.log(f"✅ Order created: {data['order']['orderNumber']}")
                    
        except Exception as e:
            self.log(f"❌ Order creation error: {str(e)}")
        
        # Test 2: Get Orders
        try:
            self.log("Testing GET /api/orders - Get User Orders...")
            
            headers = {"Authorization": f"Bearer {self.user_token}"}
            response = requests.get(f"{self.base_url}/orders", headers=headers)
            
            if response.status_code == 200:
                orders = response.json()
                if isinstance(orders, list):
                    self.results['orders']['get'] = True
                    self.log(f"✅ Retrieved {len(orders)} orders")
                    
        except Exception as e:
            self.log(f"❌ Get orders error: {str(e)}")
        
        # Test 3: Auth protection
        try:
            response = requests.get(f"{self.base_url}/orders")
            if response.status_code == 401:
                self.results['orders']['auth'] = True
                self.log("✅ Orders properly protected by auth")
        except Exception as e:
            self.log(f"❌ Auth test error: {str(e)}")

    def test_blog_comprehensive(self):
        """Comprehensive Blog API testing"""
        self.log("\n📝 COMPREHENSIVE BLOG API TESTING")
        
        # Test 1: Get Published Posts
        try:
            self.log("Testing GET /api/blog - Get Published Posts...")
            response = requests.get(f"{self.base_url}/blog")
            
            if response.status_code == 200:
                posts = response.json()
                if isinstance(posts, list):
                    self.results['blog']['public_get'] = True
                    self.log(f"✅ Retrieved {len(posts)} published posts")
                    
        except Exception as e:
            self.log(f"❌ Get blog posts error: {str(e)}")
        
        # Test 2: Get Featured Posts
        try:
            self.log("Testing GET /api/blog?featured=true - Get Featured Posts...")
            response = requests.get(f"{self.base_url}/blog?featured=true")
            
            if response.status_code == 200:
                posts = response.json()
                if isinstance(posts, list):
                    self.results['blog']['featured_get'] = True
                    self.log(f"✅ Retrieved {len(posts)} featured posts")
                    
        except Exception as e:
            self.log(f"❌ Get featured posts error: {str(e)}")
        
        # Test 3: Admin endpoints (expect 401)
        try:
            response = requests.get(f"{self.base_url}/admin/blog")
            if response.status_code == 401:
                self.results['blog']['auth'] = True
                self.log("✅ Admin blog endpoints properly protected")
        except Exception as e:
            self.log(f"❌ Admin auth test error: {str(e)}")

    def test_collective_comprehensive(self):
        """Comprehensive Collective API testing"""
        self.log("\n🤝 COMPREHENSIVE COLLECTIVE API TESTING")
        
        # Test 1: Submit Application
        try:
            self.log("Testing POST /api/collective/apply - Submit Application...")
            
            application_data = {
                "reason": "I'm passionate about sustainable living and want to connect with like-minded individuals.",
                "bio": "Environmental advocate with 5 years experience in sustainable practices.",
                "interests": ["sustainable fashion", "zero waste", "renewable energy"],
                "socialMedia": {
                    "instagram": "@emma_green_living",
                    "twitter": "@emmagreen"
                }
            }
            
            headers = {"Authorization": f"Bearer {self.user_token}"}
            response = requests.post(f"{self.base_url}/collective/apply", json=application_data, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    self.results['collective']['apply'] = True
                    self.log(f"✅ Application submitted successfully")
                    
        except Exception as e:
            self.log(f"❌ Collective application error: {str(e)}")
        
        # Test 2: Check Status
        try:
            self.log("Testing GET /api/collective/status - Check Status...")
            
            headers = {"Authorization": f"Bearer {self.user_token}"}
            response = requests.get(f"{self.base_url}/collective/status", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if 'isMember' in data and 'applicationStatus' in data:
                    self.results['collective']['status'] = True
                    self.log(f"✅ Status retrieved: Member={data['isMember']}, Status={data['applicationStatus']}")
                    
        except Exception as e:
            self.log(f"❌ Get collective status error: {str(e)}")
        
        # Test 3: Admin endpoints (expect 401)
        try:
            response = requests.get(f"{self.base_url}/admin/collective")
            if response.status_code == 401:
                self.results['collective']['auth'] = True
                self.log("✅ Admin collective endpoints properly protected")
        except Exception as e:
            self.log(f"❌ Admin auth test error: {str(e)}")

    def run_comprehensive_test(self):
        """Run comprehensive test suite"""
        self.log("🚀 STARTING COMPREHENSIVE GAEA STORE API TESTING")
        self.log(f"Base URL: {self.base_url}")
        
        if not self.setup_users():
            self.log("❌ User setup failed")
            return False
        
        # Run all tests
        self.test_orders_comprehensive()
        self.test_blog_comprehensive()
        self.test_collective_comprehensive()
        
        # Generate detailed report
        self.log("\n📊 DETAILED TEST RESULTS")
        self.log("=" * 60)
        
        # Orders API Results
        orders_passed = sum(self.results['orders'].values())
        orders_total = len(self.results['orders'])
        self.log(f"🛒 ORDERS API: {orders_passed}/{orders_total} tests passed")
        for test, result in self.results['orders'].items():
            status = "✅" if result else "❌"
            self.log(f"   {test}: {status}")
        
        # Blog API Results
        blog_passed = sum(self.results['blog'].values())
        blog_total = len(self.results['blog'])
        self.log(f"📝 BLOG API: {blog_passed}/{blog_total} tests passed")
        for test, result in self.results['blog'].items():
            status = "✅" if result else "❌"
            self.log(f"   {test}: {status}")
        
        # Collective API Results
        collective_passed = sum(self.results['collective'].values())
        collective_total = len(self.results['collective'])
        self.log(f"🤝 COLLECTIVE API: {collective_passed}/{collective_total} tests passed")
        for test, result in self.results['collective'].items():
            status = "✅" if result else "❌"
            self.log(f"   {test}: {status}")
        
        # Overall Summary
        total_passed = orders_passed + blog_passed + collective_passed
        total_tests = orders_total + blog_total + collective_total
        
        self.log(f"\n🎯 OVERALL RESULTS: {total_passed}/{total_tests} tests passed")
        
        # Critical functionality assessment
        critical_working = (
            self.results['orders']['create'] and 
            self.results['orders']['get'] and
            self.results['blog']['public_get'] and
            self.results['collective']['apply'] and
            self.results['collective']['status']
        )
        
        if critical_working:
            self.log("🎉 ALL CRITICAL NEW API ENDPOINTS ARE WORKING!")
            self.log("✅ Orders: Create and retrieve orders")
            self.log("✅ Blog: Public blog post retrieval")
            self.log("✅ Collective: Application submission and status check")
            self.log("⚠️ Admin functionality requires proper admin credentials")
            return True
        else:
            self.log("⚠️ Some critical functionality is not working")
            return False

if __name__ == "__main__":
    tester = FinalGaeaAPITester()
    success = tester.run_comprehensive_test()
    sys.exit(0 if success else 1)