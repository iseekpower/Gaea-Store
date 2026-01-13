'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { 
  Menu, X, ShoppingBag, User, Search, ChevronRight, Star, Leaf, 
  ArrowRight, Instagram, Twitter, Facebook, Mail, MapPin, Phone,
  Minus, Plus, Trash2, Heart, Globe, Building2, Package, Filter,
  Check, CreditCard, Truck, Shield, ChevronDown, SlidersHorizontal, Users
} from 'lucide-react';

export default function GaeaStore() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [productModal, setProductModal] = useState(null);
  const [b2bModal, setB2bModal] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [collectiveModal, setCollectiveModal] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [cart, setCart] = useState({ items: [] });
  const [user, setUser] = useState(null);
  const [authTab, setAuthTab] = useState('login');
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState('');
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [blogPosts, setBlogPosts] = useState([]);
  const [collectiveStatus, setCollectiveStatus] = useState({ isMember: false, applicationStatus: null });
  
  // Search and Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState([0, 200]);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [sortBy, setSortBy] = useState('featured');
  
  // Checkout form state
  const [checkoutForm, setCheckoutForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    address: '', city: '', state: '', zip: '', country: 'USA'
  });
  const [checkoutStep, setCheckoutStep] = useState(1);
  
  const [authForm, setAuthForm] = useState({ email: '', password: '', name: '' });
  const [authError, setAuthError] = useState('');

  const [b2bForm, setB2bForm] = useState({
    companyName: '', contactName: '', email: '', phone: '', type: 'corporate', message: '', country: ''
  });

  const [collectiveForm, setCollectiveForm] = useState({
    bio: '', interests: [], reason: '', instagram: '', twitter: ''
  });

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 1.1]);

  const materials = ['Bamboo', 'Teak', 'Walnut', 'Neem', 'Steel & Bamboo'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes, testimonialsRes, blogRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/categories'),
          fetch('/api/testimonials'),
          fetch('/api/blog?limit=6')
        ]);
        
        setProducts(await productsRes.json());
        setCategories(await categoriesRes.json());
        setTestimonials(await testimonialsRes.json());
        
        const blogData = await blogRes.json();
        setBlogPosts(Array.isArray(blogData) ? blogData : []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const token = localStorage.getItem('gaea_token');
    if (token) {
      fetchUser(token);
      fetchCollectiveStatus(token);
    }
  }, []);

  const fetchCollectiveStatus = async (token) => {
    try {
      const res = await fetch('/api/collective/status', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCollectiveStatus(data);
      }
    } catch (error) {
      console.error('Error fetching collective status:', error);
    }
  };

  const fetchUser = async (token) => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
        fetchCart(token);
      } else {
        localStorage.removeItem('gaea_token');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const fetchCart = async (token) => {
    try {
      const res = await fetch('/api/cart', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setCart(await res.json());
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    
    const endpoint = authTab === 'login' ? '/api/auth/login' : '/api/auth/register';
    const payload = authTab === 'login' 
      ? { email: authForm.email, password: authForm.password }
      : authForm;

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error);
        return;
      }

      localStorage.setItem('gaea_token', data.token);
      setUser(data.user);
      setAuthOpen(false);
      setAuthForm({ email: '', password: '', name: '' });
      fetchCart(data.token);
    } catch (error) {
      setAuthError('Something went wrong. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('gaea_token');
    setUser(null);
    setCart({ items: [] });
  };

  const addToCart = async (product) => {
    if (!user) {
      setAuthOpen(true);
      return;
    }

    const token = localStorage.getItem('gaea_token');
    try {
      const res = await fetch('/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ productId: product.id, quantity: 1 })
      });

      if (res.ok) {
        setCart(await res.json());
        setCartOpen(true);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const updateCartItem = async (productId, quantity) => {
    const token = localStorage.getItem('gaea_token');
    try {
      const res = await fetch('/api/cart/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ productId, quantity })
      });

      if (res.ok) {
        setCart(await res.json());
      }
    } catch (error) {
      console.error('Error updating cart:', error);
    }
  };

  const handleNewsletter = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail })
      });
      const data = await res.json();
      setNewsletterStatus(data.message);
      setNewsletterEmail('');
      setTimeout(() => setNewsletterStatus(''), 3000);
    } catch (error) {
      setNewsletterStatus('Something went wrong');
    }
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (checkoutStep < 3) {
      setCheckoutStep(checkoutStep + 1);
      return;
    }
    
    // Process order
    const token = localStorage.getItem('gaea_token');
    try {
      const shippingCost = cartTotal >= 50 ? 0 : 5.99;
      const orderTotal = cartTotal + shippingCost;
      
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          shippingAddress: {
            firstName: checkoutForm.firstName,
            lastName: checkoutForm.lastName,
            email: checkoutForm.email,
            phone: checkoutForm.phone,
            address: checkoutForm.address,
            city: checkoutForm.city,
            state: checkoutForm.state,
            zip: checkoutForm.zip,
            country: checkoutForm.country
          },
          paymentMethod: 'card',
          items: cart.items,
          subtotal: cartTotal,
          shipping: shippingCost,
          total: orderTotal
        })
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        setCart({ items: [] });
        setOrderComplete(true);
        setOrderDetails(data.order);
        setCheckoutStep(1);
        setCheckoutForm({
          firstName: '', lastName: '', email: '', phone: '',
          address: '', city: '', state: '', zip: '', country: 'USA'
        });
        
        setTimeout(() => {
          setCheckoutOpen(false);
          setOrderComplete(false);
          setOrderDetails(null);
        }, 5000);
      } else {
        alert(data.error || 'Failed to place order');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to place order. Please try again.');
    }
  };

  const handleB2bSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(b2bForm)
      });
      if (res.ok) {
        setB2bModal(false);
        setB2bForm({ companyName: '', contactName: '', email: '', phone: '', type: 'corporate', message: '', country: '' });
      }
    } catch (error) {
      console.error('Error submitting lead:', error);
    }
  };

  const handleCollectiveApply = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('gaea_token');
    try {
      const res = await fetch('/api/collective/apply', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          bio: collectiveForm.bio,
          interests: collectiveForm.interests,
          reason: collectiveForm.reason,
          socialMedia: {
            instagram: collectiveForm.instagram,
            twitter: collectiveForm.twitter
          }
        })
      });
      const data = await res.json();
      if (res.ok) {
        setCollectiveModal(false);
        setCollectiveForm({ bio: '', interests: [], reason: '', instagram: '', twitter: '' });
        setCollectiveStatus({ ...collectiveStatus, applicationStatus: 'pending' });
        alert(data.message || 'Application submitted successfully!');
      } else {
        alert(data.error || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Error applying to collective:', error);
      alert('Failed to submit application. Please try again.');
    }
  };

  const featuredProducts = products.filter(p => p.featured);
  const newArrivals = products.filter(p => p.newArrival);
  
  // Advanced filtering
  const filteredProducts = products
    .filter(p => {
      // Category filter
      if (selectedCategory && p.category !== selectedCategory) return false;
      // Search filter
      if (searchQuery && !p.name?.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !p.description?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      // Price filter
      if (p.price < priceRange[0] || p.price > priceRange[1]) return false;
      // Material filter
      if (selectedMaterials.length > 0 && !selectedMaterials.includes(p.material)) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low': return a.price - b.price;
        case 'price-high': return b.price - a.price;
        case 'newest': return b.newArrival ? 1 : -1;
        case 'rating': return (b.rating || 0) - (a.rating || 0);
        default: return b.featured ? 1 : -1;
      }
    });

  const toggleMaterial = (material) => {
    setSelectedMaterials(prev => 
      prev.includes(material) 
        ? prev.filter(m => m !== material)
        : [...prev, material]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setPriceRange([0, 200]);
    setSelectedMaterials([]);
    setSortBy('featured');
    setSelectedCategory(null);
  };

  const cartTotal = cart.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
  const cartCount = cart.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Leaf className="w-16 h-16 text-[#2d5a27] mx-auto mb-4 animate-pulse" />
          <p className="text-[#6b6b6b] font-light tracking-widest text-sm">LOADING</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#1a1a1a]">
      {/* Glass Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 glass"
      >
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => setMenuOpen(true)}
              className="flex items-center gap-2 text-[#1a1a1a]/70 hover:text-[#1a1a1a] transition-colors p-2 -ml-2 touch-manipulation"
            >
              <Menu className="w-5 h-5 sm:w-5 sm:h-5" />
              <span className="text-sm tracking-wider hidden sm:inline font-light">MENU</span>
            </button>

            <a href="/" className="absolute left-1/2 -translate-x-1/2">
              <h1 className="text-xl sm:text-2xl font-serif tracking-wider text-[#1a1a1a]">Gaea</h1>
            </a>

            <div className="flex items-center gap-3 sm:gap-5">
              <button 
                onClick={() => setSearchOpen(true)}
                className="text-[#1a1a1a]/70 hover:text-[#1a1a1a] transition-colors p-2 touch-manipulation"
              >
                <Search className="w-5 h-5" />
              </button>
              <button 
                onClick={() => user ? (user.role === 'admin' ? window.location.href = '/admin' : handleLogout()) : setAuthOpen(true)}
                className="text-[#1a1a1a]/70 hover:text-[#1a1a1a] transition-colors p-2 touch-manipulation"
              >
                <User className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setCartOpen(true)}
                className="relative text-[#1a1a1a]/70 hover:text-[#1a1a1a] transition-colors p-2 -mr-2 touch-manipulation"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 w-5 h-5 bg-[#2d5a27] text-white text-xs rounded-full flex items-center justify-center font-medium">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Search Modal */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#faf9f6]/95 backdrop-blur-md"
          >
            <div className="container mx-auto px-6 py-20">
              <button 
                onClick={() => setSearchOpen(false)}
                className="absolute top-6 right-6 text-[#1a1a1a]/60 hover:text-[#1a1a1a]"
              >
                <X className="w-8 h-8" />
              </button>
              
              <div className="max-w-2xl mx-auto">
                <div className="relative mb-8">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-[#6b6b6b]" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    className="w-full bg-white border border-[#1a1a1a]/10 rounded-none h-16 pl-14 pr-4 text-xl text-[#1a1a1a] placeholder:text-[#6b6b6b] focus:outline-none focus:border-[#2d5a27]"
                  />
                </div>

                {searchQuery && (
                  <div className="space-y-4">
                    <p className="text-[#6b6b6b] text-sm">{filteredProducts.length} results for "{searchQuery}"</p>
                    <div className="grid grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
                      {filteredProducts.slice(0, 8).map(product => (
                        <button
                          key={product.id}
                          onClick={() => {
                            setProductModal(product);
                            setSearchOpen(false);
                          }}
                          className="flex items-center gap-4 p-4 bg-white border border-[#1a1a1a]/5 hover:border-[#2d5a27] transition-colors text-left"
                        >
                          <img src={product.images?.[0]} alt={product.name} className="w-16 h-16 object-cover" />
                          <div>
                            <p className="font-medium text-[#1a1a1a]">{product.name}</p>
                            <p className="text-[#2d5a27]">${product.price?.toFixed(2)}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {!searchQuery && (
                  <div>
                    <p className="text-[#6b6b6b] mb-4 text-sm font-medium">POPULAR SEARCHES</p>
                    <div className="flex flex-wrap gap-2">
                      {['Bamboo', 'Toothbrush', 'Kitchen', 'Apparel', 'Travel'].map(term => (
                        <button
                          key={term}
                          onClick={() => setSearchQuery(term)}
                          className="px-4 py-2 bg-white border border-[#1a1a1a]/10 text-[#4a4a4a] hover:border-[#2d5a27] hover:text-[#2d5a27] transition-colors"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Elegant Slide-out Menu */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 bg-[#1a1a1a]/30 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              className="fixed left-0 top-0 bottom-0 w-full max-w-md bg-[#faf9f6] z-50 flex flex-col shadow-2xl"
            >
              <div className="p-6 flex justify-between items-center border-b border-[#1a1a1a]/10">
                <span className="text-sm tracking-[0.2em] text-[#6b6b6b] font-light">MENU</span>
                <button onClick={() => setMenuOpen(false)} className="text-[#1a1a1a]/60 hover:text-[#1a1a1a]">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <nav className="flex-1 p-8">
                <ul className="space-y-6">
                  {['All Products', 'New Arrivals', 'Shop by Category', 'B2B & Export', 'The Gaea Collective', 'About Us'].map((item, i) => (
                    <motion.li
                      key={item}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <button 
                        onClick={() => {
                          setMenuOpen(false);
                          if (item === 'B2B & Export') setB2bModal(true);
                          if (item === 'All Products') setSelectedCategory(null);
                        }}
                        className="text-3xl font-serif text-[#1a1a1a] hover:text-[#2d5a27] transition-colors flex items-center gap-4 group"
                      >
                        {item}
                        <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    </motion.li>
                  ))}
                </ul>
              </nav>
              <div className="p-8 border-t border-[#1a1a1a]/10">
                <div className="flex gap-4">
                  {[Instagram, Twitter, Facebook].map((Icon, i) => (
                    <a key={i} href="#" className="text-[#6b6b6b] hover:text-[#2d5a27] transition-colors">
                      <Icon className="w-5 h-5" />
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Hero Section - Split Layout for Conversion */}
      <section ref={heroRef} className="min-h-screen bg-[#faf9f6] pt-20">
        <div className="container mx-auto px-4 sm:px-6 h-full">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[calc(100vh-80px)]">
            {/* Left - Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="py-8 lg:py-0 order-2 lg:order-1"
            >
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-[#2d5a27]/10 rounded-full mb-4 sm:mb-6">
                <Leaf className="w-4 h-4 text-[#2d5a27]" />
                <span className="text-[#2d5a27] text-xs sm:text-sm font-medium tracking-wide">SUSTAINABLE LIVING</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-serif text-[#1a1a1a] leading-[1.1] mb-4 sm:mb-6">
                Premium Eco-Friendly
                <br />
                <span className="text-[#2d5a27]">Products</span> for
                <br />
                Conscious Living
              </h1>
              
              <p className="text-base sm:text-lg md:text-xl text-[#4a4a4a] max-w-lg mb-6 sm:mb-8 leading-relaxed">
                Discover our curated collection of bamboo, teak, and wood essentials. 
                Beautifully crafted, naturally sustainable.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 sm:mb-10">
                <Button 
                  size="lg"
                  onClick={() => document.getElementById('products').scrollIntoView({ behavior: 'smooth' })}
                  className="bg-[#1a1a1a] text-white hover:bg-[#2d5a27] px-6 sm:px-8 py-5 sm:py-6 text-sm tracking-wider rounded-none transition-all duration-300 h-12 sm:h-14 w-full sm:w-auto justify-center"
                >
                  SHOP COLLECTION
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button 
                  variant="outline"
                  size="lg"
                  onClick={() => setB2bModal(true)}
                  className="border-[#1a1a1a] text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white px-6 sm:px-8 py-5 sm:py-6 text-sm tracking-wider rounded-none transition-all duration-300 h-12 sm:h-14 w-full sm:w-auto justify-center"
                >
                  B2B INQUIRY
                </Button>
              </div>

              {/* Trust Signals */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-8 pt-6 sm:pt-8 border-t border-[#1a1a1a]/10">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 sm:w-5 h-4 sm:h-5 text-[#2d5a27]" />
                  <span className="text-[#4a4a4a] text-xs sm:text-sm">Free Shipping $50+</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 sm:w-5 h-4 sm:h-5 text-[#2d5a27]" />
                  <span className="text-[#4a4a4a] text-xs sm:text-sm">30-Day Returns</span>
                </div>
                <div className="flex items-center gap-2">
                  <Leaf className="w-4 sm:w-5 h-4 sm:h-5 text-[#2d5a27]" />
                  <span className="text-[#4a4a4a] text-xs sm:text-sm">100% Eco-Friendly</span>
                </div>
              </div>
            </motion.div>

            {/* Right - Image Grid */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative order-1 lg:order-2"
            >
              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                {/* Main large image */}
                <div className="col-span-2 aspect-[16/10] overflow-hidden bg-[#f0efe9]">
                  <img 
                    src="https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=800&q=80" 
                    alt="Bamboo toothbrushes in a ceramic holder"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                </div>
                {/* Two smaller images */}
                <div className="aspect-square overflow-hidden bg-[#f0efe9]">
                  <img 
                    src="https://images.unsplash.com/photo-1594226801341-41427b4e5c22?w=600&q=80" 
                    alt="Wooden cutting board with fresh vegetables"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="aspect-square overflow-hidden bg-[#f0efe9]">
                  <img 
                    src="https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&q=80" 
                    alt="Sustainable water bottle"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                </div>
              </div>

              {/* Floating Stats Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="absolute -bottom-4 sm:-bottom-6 left-2 sm:-left-6 bg-white p-4 sm:p-6 shadow-xl border border-[#1a1a1a]/5"
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="text-center">
                    <p className="text-2xl sm:text-3xl font-serif text-[#2d5a27]">15K+</p>
                    <p className="text-[10px] sm:text-xs text-[#6b6b6b] tracking-wider">HAPPY CUSTOMERS</p>
                  </div>
                  <div className="w-px h-10 sm:h-12 bg-[#1a1a1a]/10" />
                  <div className="text-center">
                    <p className="text-2xl sm:text-3xl font-serif text-[#2d5a27]">4.9</p>
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-2.5 sm:w-3 h-2.5 sm:h-3 fill-[#2d5a27] text-[#2d5a27]" />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Categories Bar */}
      <section className="bg-[#1a1a1a] py-4 sm:py-6 overflow-x-auto">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-start sm:justify-center gap-4 sm:gap-8 md:gap-16 min-w-max sm:min-w-0">
            {['Personal Care', 'Home & Kitchen', 'Apparel', 'Decor', 'Travel EDC'].map((cat, i) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-'));
                  document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-white/70 hover:text-white text-xs sm:text-sm tracking-wider transition-colors whitespace-nowrap py-2 touch-manipulation"
              >
                {cat.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Statement - Elegant Light */}
      <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 bg-[#faf9f6]">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-8 sm:gap-12 md:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <p className="text-[#2d5a27] tracking-[0.2em] text-xs sm:text-sm mb-3 sm:mb-4 font-medium">THE PHILOSOPHY</p>
              <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif leading-tight mb-4 sm:mb-6 text-[#1a1a1a]">
                We exist in the space<br/>
                between <span className="text-[#2d5a27]">nature</span><br/>
                and <span className="italic text-[#2d5a27]">artistry.</span>
              </h3>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-4 sm:space-y-6"
            >
              <p className="text-[#4a4a4a] text-base sm:text-lg font-light leading-relaxed">
                The Gaea Store was founded on a simple principle: everyday products should 
                honor both the people who use them and the planet we share. We source the 
                finest bamboo, teak, walnut, and neem to create pieces that are as beautiful 
                as they are sustainable.
              </p>
              <div className="flex gap-8 sm:gap-12 pt-4">
                <div className="border-t border-[#1a1a1a]/10 pt-4">
                  <p className="text-2xl sm:text-3xl font-serif text-[#2d5a27]">15K+</p>
                  <p className="text-[#6b6b6b] text-xs sm:text-sm tracking-wider font-light">HAPPY CUSTOMERS</p>
                </div>
                <div className="border-t border-[#1a1a1a]/10 pt-4">
                  <p className="text-2xl sm:text-3xl font-serif text-[#2d5a27]">50+</p>
                  <p className="text-[#6b6b6b] text-xs sm:text-sm tracking-wider font-light">ARTISAN PARTNERS</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Elegant Divider */}
      <div className="elegant-divider mx-auto max-w-6xl" />

      {/* Categories - Light elegant cards */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-[#faf9f6]">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12 md:mb-16"
          >
            <p className="text-[#2d5a27] tracking-[0.2em] text-xs sm:text-sm mb-3 sm:mb-4 font-medium">COLLECTIONS</p>
            <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif text-[#1a1a1a]">Shop by Category</h3>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
            {categories.map((category, i) => (
              <motion.button
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                onClick={() => {
                  setSelectedCategory(category.slug);
                  document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
                }}
                className="group relative aspect-[3/4] overflow-hidden bg-[#f0efe9] rounded-sm touch-manipulation"
              >
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{ backgroundImage: `url(${category.image})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a]/70 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 md:p-6">
                  <h4 className="text-sm sm:text-base md:text-xl font-serif mb-0 sm:mb-1 text-white">{category.name}</h4>
                  <p className="text-white/70 text-xs sm:text-sm line-clamp-2 font-light hidden sm:block">{category.description}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products - Light elegant */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-[#f5f4f0]">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-12"
          >
            <div>
              <p className="text-[#2d5a27] tracking-[0.2em] text-xs sm:text-sm mb-2 sm:mb-4 font-medium">CURATED</p>
              <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif text-[#1a1a1a]">Featured Products</h3>
            </div>
            <button className="hidden md:flex items-center gap-2 text-[#6b6b6b] hover:text-[#2d5a27] transition-colors group">
              <span className="tracking-wider text-sm font-light">VIEW ALL</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
            {featuredProducts.slice(0, 4).map((product, i) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                index={i}
                onView={() => setProductModal(product)}
                onAddToCart={() => addToCart(product)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-[#faf9f6]">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-end justify-between mb-8 sm:mb-12"
          >
            <div>
              <p className="text-[#2d5a27] tracking-[0.2em] text-xs sm:text-sm mb-2 sm:mb-4 font-medium">JUST IN</p>
              <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif text-[#1a1a1a]">New Arrivals</h3>
            </div>
          </motion.div>

          <div className="flex gap-3 sm:gap-4 md:gap-6 lg:gap-8 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            {newArrivals.map((product, i) => (
              <div key={product.id} className="flex-shrink-0 w-[160px] sm:w-[200px] md:w-64 lg:w-72">
                <ProductCard 
                  product={product} 
                  index={i}
                  onView={() => setProductModal(product)}
                  onAddToCart={() => addToCart(product)}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* All Products */}
      <section id="products" className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-[#f5f4f0]">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col gap-4 sm:gap-6 mb-6 sm:mb-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <p className="text-[#2d5a27] tracking-[0.2em] text-xs sm:text-sm mb-2 sm:mb-4 font-medium">ALL PRODUCTS</p>
                <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif text-[#1a1a1a]">
                  {selectedCategory 
                    ? categories.find(c => c.slug === selectedCategory)?.name || 'Products'
                    : 'Our Collection'
                  }
                </h3>
              </div>
              <div className="flex items-center gap-2 sm:gap-4">
                <Button
                  variant="outline"
                  onClick={() => setFilterOpen(!filterOpen)}
                  className="border-[#1a1a1a]/20 text-[#1a1a1a] hover:bg-[#1a1a1a]/5 h-10 sm:h-auto touch-manipulation"
                >
                  <SlidersHorizontal className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Filters</span>
                  {(selectedMaterials.length > 0 || priceRange[0] > 0 || priceRange[1] < 200) && (
                    <span className="ml-1 sm:ml-2 w-5 h-5 bg-[#2d5a27] text-white text-xs rounded-full flex items-center justify-center">
                      {selectedMaterials.length + (priceRange[0] > 0 || priceRange[1] < 200 ? 1 : 0)}
                    </span>
                  )}
                </Button>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none px-3 sm:px-4 py-2 pr-8 sm:pr-10 border border-[#1a1a1a]/20 bg-white text-[#4a4a4a] rounded-none cursor-pointer hover:border-[#1a1a1a]/40 transition-colors text-sm h-10 touch-manipulation"
                  >
                    <option value="featured">Featured</option>
                    <option value="newest">Newest</option>
                    <option value="price-low">Price: Low</option>
                    <option value="price-high">Price: High</option>
                    <option value="rating">Top Rated</option>
                  </select>
                  <ChevronDown className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b6b6b] pointer-events-none" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Category Pills - Horizontal scroll on mobile */}
          <div className="flex gap-2 overflow-x-auto pb-4 mb-4 sm:mb-6 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`flex-shrink-0 px-3 sm:px-4 py-2 text-xs sm:text-sm tracking-wider border transition-all rounded-none whitespace-nowrap touch-manipulation ${
                !selectedCategory 
                  ? 'border-[#2d5a27] text-[#2d5a27] bg-[#2d5a27]/5' 
                  : 'border-[#1a1a1a]/20 text-[#6b6b6b] hover:border-[#1a1a1a]/40'
              }`}
            >
              ALL
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`flex-shrink-0 px-3 sm:px-4 py-2 text-xs sm:text-sm tracking-wider border transition-all rounded-none whitespace-nowrap touch-manipulation ${
                  selectedCategory === cat.slug 
                    ? 'border-[#2d5a27] text-[#2d5a27] bg-[#2d5a27]/5' 
                    : 'border-[#1a1a1a]/20 text-[#6b6b6b] hover:border-[#1a1a1a]/40'
                }`}
              >
                {cat.name.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Filter Panel */}
          <AnimatePresence>
            {filterOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mb-6 sm:mb-8"
              >
                <div className="bg-white p-4 sm:p-6 border border-[#1a1a1a]/10 rounded-lg">
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h4 className="font-medium text-[#1a1a1a]">Filters</h4>
                    <button onClick={clearFilters} className="text-sm text-[#2d5a27] hover:underline touch-manipulation">
                      Clear All
                    </button>
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
                    {/* Price Range */}
                    <div>
                      <label className="block text-sm font-medium text-[#6b6b6b] mb-4">
                        Price Range: ${priceRange[0]} - ${priceRange[1]}
                      </label>
                      <Slider
                        value={priceRange}
                        onValueChange={setPriceRange}
                        max={200}
                        step={5}
                        className="w-full"
                      />
                    </div>

                    {/* Materials */}
                    <div>
                      <label className="block text-sm font-medium text-[#6b6b6b] mb-4">Materials</label>
                      <div className="flex flex-wrap gap-2">
                        {materials.map(material => (
                          <button
                            key={material}
                            onClick={() => toggleMaterial(material)}
                            className={`px-3 py-1.5 text-xs sm:text-sm border transition-all touch-manipulation ${
                              selectedMaterials.includes(material)
                                ? 'border-[#2d5a27] bg-[#2d5a27] text-white'
                                : 'border-[#1a1a1a]/20 text-[#4a4a4a] hover:border-[#2d5a27]'
                            }`}
                          >
                            {material}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results count */}
          <p className="text-[#6b6b6b] text-xs sm:text-sm mb-4 sm:mb-6">{filteredProducts.length} products</p>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
            {filteredProducts.map((product, i) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                index={i}
                onView={() => setProductModal(product)}
                onAddToCart={() => addToCart(product)}
              />
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12 sm:py-16">
              <p className="text-[#6b6b6b] text-base sm:text-lg">No products found matching your criteria.</p>
              <Button onClick={clearFilters} className="mt-4 bg-[#2d5a27] text-white hover:bg-[#2d5a27]/90 touch-manipulation">
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* B2B Section - Elegant dark contrast */}
      <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 relative overflow-hidden bg-[#1a1a1a]">
        <div className="container mx-auto relative">
          <div className="grid md:grid-cols-2 gap-8 sm:gap-12 md:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <p className="text-[#7cb342] tracking-[0.2em] text-xs sm:text-sm mb-3 sm:mb-4 font-medium">B2B & EXPORT</p>
              <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif mb-4 sm:mb-6 text-white">
                Partner with Gaea
              </h3>
              <p className="text-white/60 text-base sm:text-lg mb-6 sm:mb-8 leading-relaxed font-light">
                From corporate gifting solutions to hotel toiletries, we offer tailored 
                sustainable products for businesses worldwide. Currently exporting to 
                USA, UAE, Netherlands, UK, and Germany.
              </p>
              <div className="flex flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-8">
                {['USA', 'UAE', 'Netherlands', 'UK', 'Germany'].map(country => (
                  <span key={country} className="px-3 sm:px-4 py-1.5 sm:py-2 border border-white/20 text-xs sm:text-sm text-white/70 font-light">
                    {country}
                  </span>
                ))}
              </div>
              <Button 
                onClick={() => setB2bModal(true)}
                className="bg-white text-[#1a1a1a] hover:bg-[#7cb342] hover:text-white px-6 sm:px-8 py-5 sm:py-6 rounded-none tracking-wider transition-all touch-manipulation w-full sm:w-auto justify-center"
              >
                GET IN TOUCH
              </Button>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-3 sm:gap-4"
            >
              {[
                { icon: Building2, title: 'Corporate Gifting', desc: 'Sustainable gifts for employees and clients' },
                { icon: Package, title: 'Hotel Amenities', desc: 'Eco-friendly toiletries for hospitality' },
              ].map((item, i) => (
                <div key={i} className="p-4 sm:p-6 md:p-8 bg-white/5 border border-white/10">
                  <item.icon className="w-8 sm:w-10 h-8 sm:h-10 text-[#7cb342] mb-3 sm:mb-4" />
                  <h4 className="text-base sm:text-lg md:text-xl font-serif mb-1 sm:mb-2 text-white">{item.title}</h4>
                  <p className="text-white/50 text-xs sm:text-sm font-light">{item.desc}</p>
                </div>
              ))}
              <div className="p-4 sm:p-6 md:p-8 bg-white/5 border border-white/10 col-span-2">
                <Globe className="w-8 sm:w-10 h-8 sm:h-10 text-[#7cb342] mb-3 sm:mb-4" />
                <h4 className="text-base sm:text-lg md:text-xl font-serif mb-1 sm:mb-2 text-white">Global Export</h4>
                <p className="text-white/50 text-xs sm:text-sm font-light">Reliable shipping and customs support worldwide</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials - Elegant light */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-[#faf9f6]">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12 md:mb-16"
          >
            <p className="text-[#2d5a27] tracking-[0.2em] text-xs sm:text-sm mb-3 sm:mb-4 font-medium">TESTIMONIALS</p>
            <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif text-[#1a1a1a]">What People Say</h3>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {testimonials.map((testimonial, i) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-4 sm:p-6 md:p-8 bg-white border border-[#1a1a1a]/5 shadow-sm"
              >
                <div className="flex gap-0.5 sm:gap-1 mb-3 sm:mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-3 sm:w-4 h-3 sm:h-4 fill-[#2d5a27] text-[#2d5a27]" />
                  ))}
                </div>
                <p className="text-[#4a4a4a] mb-4 sm:mb-6 font-light italic leading-relaxed text-sm sm:text-base">"{testimonial.content}"</p>
                <div className="flex items-center gap-3 sm:gap-4">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name}
                    className="w-10 sm:w-12 h-10 sm:h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium text-[#1a1a1a] text-sm sm:text-base">{testimonial.name}</p>
                    <p className="text-[#6b6b6b] text-xs sm:text-sm font-light">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog/Journal Section */}
      {blogPosts.length > 0 && (
        <section id="journal" className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-[#f5f4f0]">
          <div className="container mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-8 sm:mb-12 md:mb-16"
            >
              <p className="text-[#2d5a27] tracking-[0.2em] text-xs sm:text-sm mb-3 sm:mb-4 font-medium">THE JOURNAL</p>
              <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif text-[#1a1a1a]">Stories & Insights</h3>
              <p className="text-[#6b6b6b] mt-4 max-w-2xl mx-auto font-light">
                Explore sustainable living tips, artisan stories, and the journey behind our products.
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {blogPosts.slice(0, 3).map((post, i) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group bg-white border border-[#1a1a1a]/5 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-[16/10] overflow-hidden bg-[#f0efe9]">
                    <img 
                      src={post.image} 
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[#2d5a27] text-xs font-medium tracking-wider uppercase">{post.category}</span>
                      <span className="text-[#6b6b6b] text-xs">•</span>
                      <span className="text-[#6b6b6b] text-xs">{new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <h4 className="font-serif text-xl text-[#1a1a1a] mb-2 group-hover:text-[#2d5a27] transition-colors">{post.title}</h4>
                    <p className="text-[#6b6b6b] text-sm font-light line-clamp-2">{post.excerpt}</p>
                    <button className="mt-4 text-[#2d5a27] text-sm font-medium flex items-center gap-2 group/btn">
                      Read More
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </motion.article>
              ))}
            </div>

            {blogPosts.length > 3 && (
              <div className="text-center mt-10">
                <Button 
                  variant="outline"
                  className="border-[#1a1a1a]/20 text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white px-8 py-6 rounded-none tracking-wider"
                >
                  VIEW ALL ARTICLES
                </Button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Gaea Collective Section */}
      <section id="collective" className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 bg-[#1a1a1a] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-[#2d5a27] rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#2d5a27] rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        </div>
        
        <div className="container mx-auto relative">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full mb-6">
                <Heart className="w-4 h-4 text-[#7cb342]" />
                <span className="text-white/70 text-sm tracking-wider">COMMUNITY</span>
              </div>
              
              <h3 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif text-white mb-6">
                The Gaea <span className="text-[#7cb342]">Collective</span>
              </h3>
              
              <p className="text-white/60 text-lg mb-8 leading-relaxed font-light">
                Join a community of like-minded individuals passionate about sustainable living. 
                Share stories, get exclusive access to new products, and connect with artisans around the world.
              </p>

              <div className="grid sm:grid-cols-3 gap-6 mb-10">
                <div className="p-6 bg-white/5 border border-white/10 rounded-lg">
                  <div className="w-12 h-12 bg-[#7cb342]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-6 h-6 text-[#7cb342]" />
                  </div>
                  <h4 className="text-white font-medium mb-2">Community Access</h4>
                  <p className="text-white/50 text-sm font-light">Connect with sustainability advocates worldwide</p>
                </div>
                <div className="p-6 bg-white/5 border border-white/10 rounded-lg">
                  <div className="w-12 h-12 bg-[#7cb342]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="w-6 h-6 text-[#7cb342]" />
                  </div>
                  <h4 className="text-white font-medium mb-2">Exclusive Benefits</h4>
                  <p className="text-white/50 text-sm font-light">Early access, special discounts, and members-only events</p>
                </div>
                <div className="p-6 bg-white/5 border border-white/10 rounded-lg">
                  <div className="w-12 h-12 bg-[#7cb342]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Leaf className="w-6 h-6 text-[#7cb342]" />
                  </div>
                  <h4 className="text-white font-medium mb-2">Impact Stories</h4>
                  <p className="text-white/50 text-sm font-light">See the real-world impact of your choices</p>
                </div>
              </div>

              {collectiveStatus.isMember ? (
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-[#7cb342] text-white rounded-full">
                  <Check className="w-5 h-5" />
                  <span className="font-medium">You're a Collective Member!</span>
                </div>
              ) : collectiveStatus.applicationStatus === 'pending' ? (
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white rounded-full">
                  <span className="font-medium">Application Under Review</span>
                </div>
              ) : (
                <Button 
                  onClick={() => {
                    if (!user) {
                      setAuthOpen(true);
                    } else {
                      setCollectiveModal(true);
                    }
                  }}
                  className="bg-white text-[#1a1a1a] hover:bg-[#7cb342] hover:text-white px-8 py-6 rounded-none tracking-wider transition-all"
                >
                  JOIN THE COLLECTIVE
                </Button>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Newsletter - Elegant */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-[#f5f4f0]">
        <div className="container mx-auto max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Leaf className="w-10 sm:w-12 h-10 sm:h-12 text-[#2d5a27] mx-auto mb-4 sm:mb-6" />
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-serif mb-3 sm:mb-4 text-[#1a1a1a]">Join the Gaea Family</h3>
            <p className="text-[#6b6b6b] mb-6 sm:mb-8 font-light text-sm sm:text-base">
              Subscribe for exclusive offers, sustainability tips, and early access to new collections.
            </p>
            <form onSubmit={handleNewsletter} className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Input
                type="email"
                placeholder="Enter your email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="flex-1 bg-white border-[#1a1a1a]/10 rounded-none h-12 focus:border-[#2d5a27] transition-colors"
                required
              />
              <Button 
                type="submit"
                className="bg-[#1a1a1a] text-white hover:bg-[#2d5a27] rounded-none h-12 px-6 sm:px-8 tracking-wider touch-manipulation"
              >
                SUBSCRIBE
              </Button>
            </form>
            {newsletterStatus && (
              <p className="text-[#2d5a27] mt-4 text-sm">{newsletterStatus}</p>
            )}
          </motion.div>
        </div>
      </section>

      {/* Footer - Elegant light */}
      <footer className="py-12 sm:py-16 px-4 sm:px-6 border-t border-[#1a1a1a]/10 bg-[#faf9f6]">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12 mb-8 sm:mb-12">
            <div className="col-span-2 md:col-span-1">
              <h2 className="text-xl sm:text-2xl font-serif mb-3 sm:mb-4 text-[#1a1a1a]">Gaea</h2>
              <p className="text-[#6b6b6b] text-xs sm:text-sm mb-4 sm:mb-6 font-light leading-relaxed">
                Premium sustainable products for conscious living.
              </p>
              <div className="flex gap-4">
                {[Instagram, Twitter, Facebook].map((Icon, i) => (
                  <a key={i} href="#" className="text-[#6b6b6b] hover:text-[#2d5a27] transition-colors p-2 -ml-2 touch-manipulation">
                    <Icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-xs sm:text-sm tracking-wider text-[#1a1a1a] mb-3 sm:mb-4 font-medium">SHOP</h4>
              <ul className="space-y-2 sm:space-y-3">
                {categories.map(cat => (
                  <li key={cat.id}>
                    <button 
                      onClick={() => {
                        setSelectedCategory(cat.slug);
                        document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="text-[#6b6b6b] hover:text-[#2d5a27] transition-colors text-xs sm:text-sm font-light touch-manipulation"
                    >
                      {cat.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-xs sm:text-sm tracking-wider text-[#1a1a1a] mb-3 sm:mb-4 font-medium">COMPANY</h4>
              <ul className="space-y-2 sm:space-y-3">
                {['About Us', 'Sustainability', 'Careers', 'Press'].map(item => (
                  <li key={item}>
                    <a href="#" className="text-[#6b6b6b] hover:text-[#2d5a27] transition-colors text-xs sm:text-sm font-light touch-manipulation">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-xs sm:text-sm tracking-wider text-[#1a1a1a] mb-3 sm:mb-4 font-medium">CONTACT</h4>
              <ul className="space-y-2 sm:space-y-3">
                <li className="flex items-center gap-2 text-[#6b6b6b] text-xs sm:text-sm font-light">
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  <span className="break-all">hello@gaeastore.com</span>
                </li>
                <li className="flex items-center gap-2 text-[#6b6b6b] text-xs sm:text-sm font-light">
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  +1 (555) 123-4567
                </li>
                <li className="flex items-start gap-2 text-[#6b6b6b] text-xs sm:text-sm font-light">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  123 Eco Street<br/>Portland, OR 97201
                </li>
              </ul>
            </div>
          </div>

          <Separator className="bg-[#1a1a1a]/10 mb-6 sm:mb-8" />

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-[#6b6b6b] text-xs sm:text-sm font-light">
            <p>© 2025 The Gaea Store. All rights reserved.</p>
            <div className="flex gap-4 sm:gap-6">
              <a href="#" className="hover:text-[#2d5a27] transition-colors touch-manipulation">Privacy</a>
              <a href="#" className="hover:text-[#2d5a27] transition-colors touch-manipulation">Terms</a>
              <a href="#" className="hover:text-[#2d5a27] transition-colors touch-manipulation">Shipping</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Cart Sheet - Elegant */}
      <Sheet open={cartOpen} onOpenChange={setCartOpen}>
        <SheetContent className="bg-[#faf9f6] border-[#1a1a1a]/10 w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle className="text-[#1a1a1a] font-serif text-2xl">Your Cart</SheetTitle>
          </SheetHeader>
          <div className="mt-8 flex flex-col h-[calc(100vh-180px)]">
            {cart.items?.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <ShoppingBag className="w-16 h-16 text-[#1a1a1a]/20 mb-4" />
                <p className="text-[#6b6b6b]">Your cart is empty</p>
                <Button 
                  variant="outline" 
                  onClick={() => setCartOpen(false)}
                  className="mt-4 border-[#1a1a1a]/20 text-[#1a1a1a] hover:bg-[#1a1a1a]/5"
                >
                  Continue Shopping
                </Button>
              </div>
            ) : (
              <>
                <ScrollArea className="flex-1 pr-4">
                  <div className="space-y-6">
                    {cart.items?.map(item => (
                      <div key={item.productId} className="flex gap-4">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-20 h-20 object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="text-[#1a1a1a] font-medium">{item.name}</h4>
                          <p className="text-[#2d5a27]">${item.price?.toFixed(2)}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <button 
                              onClick={() => updateCartItem(item.productId, item.quantity - 1)}
                              className="text-[#6b6b6b] hover:text-[#1a1a1a]"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="text-[#1a1a1a]">{item.quantity}</span>
                            <button 
                              onClick={() => updateCartItem(item.productId, item.quantity + 1)}
                              className="text-[#6b6b6b] hover:text-[#1a1a1a]"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => updateCartItem(item.productId, 0)}
                              className="ml-auto text-[#6b6b6b] hover:text-red-500"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="pt-6 border-t border-[#1a1a1a]/10">
                  {/* Cart benefits */}
                  <div className="flex justify-between text-sm text-[#6b6b6b] mb-4">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4" />
                      <span>Free shipping over $50</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      <span>Secure checkout</span>
                    </div>
                  </div>
                  <Separator className="bg-[#1a1a1a]/10 my-4" />
                  <div className="flex justify-between mb-4">
                    <span className="text-[#6b6b6b]">Subtotal</span>
                    <span className="text-[#1a1a1a] text-xl font-serif">${cartTotal.toFixed(2)}</span>
                  </div>
                  <Button 
                    onClick={() => {
                      setCartOpen(false);
                      setCheckoutOpen(true);
                    }}
                    className="w-full bg-[#1a1a1a] text-white hover:bg-[#2d5a27] rounded-none h-12"
                  >
                    PROCEED TO CHECKOUT
                  </Button>
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Checkout Modal */}
      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="bg-[#faf9f6] border-[#1a1a1a]/10 max-w-4xl max-h-[90vh] overflow-y-auto">
          {orderComplete ? (
            <div className="text-center py-16">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-20 h-20 bg-[#2d5a27] rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <Check className="w-10 h-10 text-white" />
              </motion.div>
              <h2 className="text-3xl font-serif text-[#1a1a1a] mb-4">Order Confirmed!</h2>
              {orderDetails && (
                <div className="bg-white p-6 rounded-lg border border-[#1a1a1a]/10 max-w-sm mx-auto mb-6">
                  <p className="text-[#6b6b6b] text-sm mb-2">Order Number</p>
                  <p className="text-[#2d5a27] font-mono text-lg font-medium">{orderDetails.orderNumber}</p>
                  <Separator className="my-4 bg-[#1a1a1a]/10" />
                  <p className="text-[#6b6b6b] text-sm mb-1">Total Paid</p>
                  <p className="text-[#1a1a1a] text-2xl font-serif">${orderDetails.total?.toFixed(2)}</p>
                </div>
              )}
              <p className="text-[#6b6b6b]">Thank you for your purchase! You will receive a confirmation email shortly.</p>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="text-[#1a1a1a] font-serif text-2xl">Checkout</DialogTitle>
              </DialogHeader>

              {/* Progress Steps */}
              <div className="flex items-center justify-center gap-4 my-6">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      checkoutStep >= step 
                        ? 'bg-[#2d5a27] text-white' 
                        : 'bg-[#1a1a1a]/10 text-[#6b6b6b]'
                    }`}>
                      {checkoutStep > step ? <Check className="w-4 h-4" /> : step}
                    </div>
                    <span className={`text-sm hidden sm:inline ${checkoutStep >= step ? 'text-[#1a1a1a]' : 'text-[#6b6b6b]'}`}>
                      {step === 1 ? 'Shipping' : step === 2 ? 'Payment' : 'Review'}
                    </span>
                    {step < 3 && <ChevronRight className="w-4 h-4 text-[#6b6b6b]" />}
                  </div>
                ))}
              </div>

              <form onSubmit={handleCheckout}>
                {/* Step 1: Shipping */}
                {checkoutStep === 1 && (
                  <div className="space-y-4">
                    <h3 className="font-medium text-[#1a1a1a] mb-4">Shipping Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-[#6b6b6b] mb-2">First Name</label>
                        <Input
                          value={checkoutForm.firstName}
                          onChange={(e) => setCheckoutForm({...checkoutForm, firstName: e.target.value})}
                          className="bg-white border-[#1a1a1a]/10"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-[#6b6b6b] mb-2">Last Name</label>
                        <Input
                          value={checkoutForm.lastName}
                          onChange={(e) => setCheckoutForm({...checkoutForm, lastName: e.target.value})}
                          className="bg-white border-[#1a1a1a]/10"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-[#6b6b6b] mb-2">Email</label>
                      <Input
                        type="email"
                        value={checkoutForm.email}
                        onChange={(e) => setCheckoutForm({...checkoutForm, email: e.target.value})}
                        className="bg-white border-[#1a1a1a]/10"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-[#6b6b6b] mb-2">Address</label>
                      <Input
                        value={checkoutForm.address}
                        onChange={(e) => setCheckoutForm({...checkoutForm, address: e.target.value})}
                        className="bg-white border-[#1a1a1a]/10"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm text-[#6b6b6b] mb-2">City</label>
                        <Input
                          value={checkoutForm.city}
                          onChange={(e) => setCheckoutForm({...checkoutForm, city: e.target.value})}
                          className="bg-white border-[#1a1a1a]/10"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-[#6b6b6b] mb-2">State</label>
                        <Input
                          value={checkoutForm.state}
                          onChange={(e) => setCheckoutForm({...checkoutForm, state: e.target.value})}
                          className="bg-white border-[#1a1a1a]/10"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-[#6b6b6b] mb-2">ZIP</label>
                        <Input
                          value={checkoutForm.zip}
                          onChange={(e) => setCheckoutForm({...checkoutForm, zip: e.target.value})}
                          className="bg-white border-[#1a1a1a]/10"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Payment */}
                {checkoutStep === 2 && (
                  <div className="space-y-4">
                    <h3 className="font-medium text-[#1a1a1a] mb-4">Payment Method</h3>
                    <div className="p-6 bg-white border border-[#1a1a1a]/10 rounded-lg">
                      <div className="flex items-center gap-4 mb-4">
                        <CreditCard className="w-8 h-8 text-[#6b6b6b]" />
                        <span className="font-medium text-[#1a1a1a]">Credit Card</span>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm text-[#6b6b6b] mb-2">Card Number</label>
                          <Input placeholder="1234 5678 9012 3456" className="bg-[#faf9f6] border-[#1a1a1a]/10" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm text-[#6b6b6b] mb-2">Expiry</label>
                            <Input placeholder="MM/YY" className="bg-[#faf9f6] border-[#1a1a1a]/10" />
                          </div>
                          <div>
                            <label className="block text-sm text-[#6b6b6b] mb-2">CVC</label>
                            <Input placeholder="123" className="bg-[#faf9f6] border-[#1a1a1a]/10" />
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-[#6b6b6b] flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Your payment information is encrypted and secure
                    </p>
                  </div>
                )}

                {/* Step 3: Review */}
                {checkoutStep === 3 && (
                  <div className="space-y-6">
                    <h3 className="font-medium text-[#1a1a1a] mb-4">Order Review</h3>
                    
                    <div className="bg-white p-4 border border-[#1a1a1a]/10 rounded-lg">
                      <h4 className="text-sm font-medium text-[#6b6b6b] mb-3">SHIPPING TO</h4>
                      <p className="text-[#1a1a1a]">{checkoutForm.firstName} {checkoutForm.lastName}</p>
                      <p className="text-[#4a4a4a]">{checkoutForm.address}</p>
                      <p className="text-[#4a4a4a]">{checkoutForm.city}, {checkoutForm.state} {checkoutForm.zip}</p>
                    </div>

                    <div className="bg-white p-4 border border-[#1a1a1a]/10 rounded-lg">
                      <h4 className="text-sm font-medium text-[#6b6b6b] mb-3">ORDER ITEMS</h4>
                      <div className="space-y-3">
                        {cart.items?.map(item => (
                          <div key={item.productId} className="flex justify-between">
                            <span className="text-[#1a1a1a]">{item.name} x {item.quantity}</span>
                            <span className="text-[#1a1a1a]">${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                      <Separator className="my-4 bg-[#1a1a1a]/10" />
                      <div className="flex justify-between">
                        <span className="text-[#6b6b6b]">Subtotal</span>
                        <span className="text-[#1a1a1a]">${cartTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#6b6b6b]">Shipping</span>
                        <span className="text-[#2d5a27]">{cartTotal >= 50 ? 'FREE' : '$5.99'}</span>
                      </div>
                      <Separator className="my-4 bg-[#1a1a1a]/10" />
                      <div className="flex justify-between text-lg font-medium">
                        <span className="text-[#1a1a1a]">Total</span>
                        <span className="text-[#1a1a1a]">${(cartTotal + (cartTotal >= 50 ? 0 : 5.99)).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex gap-4 mt-8">
                  {checkoutStep > 1 && (
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={() => setCheckoutStep(checkoutStep - 1)}
                      className="flex-1 border-[#1a1a1a]/20 text-[#1a1a1a] hover:bg-[#1a1a1a]/5"
                    >
                      Back
                    </Button>
                  )}
                  <Button 
                    type="submit"
                    className="flex-1 bg-[#1a1a1a] text-white hover:bg-[#2d5a27]"
                  >
                    {checkoutStep === 3 ? 'PLACE ORDER' : 'CONTINUE'}
                  </Button>
                </div>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Auth Modal - Elegant */}
      <Dialog open={authOpen} onOpenChange={setAuthOpen}>
        <DialogContent className="bg-[#faf9f6] border-[#1a1a1a]/10 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#1a1a1a] font-serif text-2xl text-center">
              {user ? 'Your Account' : 'Welcome'}
            </DialogTitle>
          </DialogHeader>
          
          {user ? (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-[#2d5a27]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-10 h-10 text-[#2d5a27]" />
              </div>
              <h3 className="text-[#1a1a1a] text-xl mb-2">{user.name}</h3>
              <p className="text-[#6b6b6b] mb-6">{user.email}</p>
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="border-[#1a1a1a]/20 text-[#1a1a1a] hover:bg-[#1a1a1a]/5"
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <Tabs value={authTab} onValueChange={setAuthTab} className="mt-4">
              <TabsList className="grid grid-cols-2 bg-[#1a1a1a]/5">
                <TabsTrigger value="login" className="data-[state=active]:bg-[#1a1a1a] data-[state=active]:text-white">
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="register" className="data-[state=active]:bg-[#1a1a1a] data-[state=active]:text-white">
                  Register
                </TabsTrigger>
              </TabsList>
              
              <form onSubmit={handleAuth} className="mt-6 space-y-4">
                {authTab === 'register' && (
                  <Input
                    placeholder="Full Name"
                    value={authForm.name}
                    onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                    className="bg-white border-[#1a1a1a]/10 rounded-none h-12"
                    required
                  />
                )}
                <Input
                  type="email"
                  placeholder="Email"
                  value={authForm.email}
                  onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                  className="bg-white border-[#1a1a1a]/10 rounded-none h-12"
                  required
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={authForm.password}
                  onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                  className="bg-white border-[#1a1a1a]/10 rounded-none h-12"
                  required
                />
                {authError && (
                  <p className="text-red-500 text-sm">{authError}</p>
                )}
                <Button 
                  type="submit"
                  className="w-full bg-[#1a1a1a] text-white hover:bg-[#2d5a27] rounded-none h-12"
                >
                  {authTab === 'login' ? 'SIGN IN' : 'CREATE ACCOUNT'}
                </Button>
              </form>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Product Modal - Elegant */}
      <Dialog open={!!productModal} onOpenChange={() => setProductModal(null)}>
        <DialogContent className="bg-[#faf9f6] border-[#1a1a1a]/10 max-w-4xl p-0 overflow-hidden">
          {productModal && (
            <div className="grid md:grid-cols-2">
              <div className="aspect-square bg-[#f5f4f0]">
                <img 
                  src={productModal.images?.[0]} 
                  alt={productModal.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-8 flex flex-col">
                <Badge className="w-fit bg-[#2d5a27]/10 text-[#2d5a27] border-0 mb-4">
                  {productModal.material}
                </Badge>
                <h2 className="text-3xl font-serif text-[#1a1a1a] mb-2">{productModal.name}</h2>
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 ${i < Math.floor(productModal.rating || 0) ? 'fill-[#2d5a27] text-[#2d5a27]' : 'text-[#1a1a1a]/20'}`}
                      />
                    ))}
                  </div>
                  <span className="text-[#6b6b6b] text-sm">({productModal.reviews} reviews)</span>
                </div>
                <div className="flex items-baseline gap-3 mb-6">
                  <span className="text-3xl text-[#1a1a1a] font-serif">${productModal.price?.toFixed(2)}</span>
                  {productModal.originalPrice && (
                    <span className="text-[#6b6b6b] line-through">${productModal.originalPrice?.toFixed(2)}</span>
                  )}
                </div>
                <p className="text-[#4a4a4a] mb-8 flex-1 font-light leading-relaxed">{productModal.description}</p>
                <div className="flex gap-4">
                  <Button 
                    onClick={() => {
                      addToCart(productModal);
                      setProductModal(null);
                    }}
                    className="flex-1 bg-[#1a1a1a] text-white hover:bg-[#2d5a27] rounded-none h-12"
                  >
                    ADD TO CART
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-[#1a1a1a]/20 text-[#1a1a1a] hover:bg-[#1a1a1a]/5 rounded-none h-12 w-12 p-0"
                  >
                    <Heart className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* B2B Modal - Elegant */}
      <Dialog open={b2bModal} onOpenChange={setB2bModal}>
        <DialogContent className="bg-[#faf9f6] border-[#1a1a1a]/10 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[#1a1a1a] font-serif text-2xl">B2B Inquiry</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleB2bSubmit} className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Company Name *"
                value={b2bForm.companyName}
                onChange={(e) => setB2bForm({ ...b2bForm, companyName: e.target.value })}
                className="bg-white border-[#1a1a1a]/10 rounded-none h-12"
                required
              />
              <Input
                placeholder="Contact Name"
                value={b2bForm.contactName}
                onChange={(e) => setB2bForm({ ...b2bForm, contactName: e.target.value })}
                className="bg-white border-[#1a1a1a]/10 rounded-none h-12"
              />
            </div>
            <Input
              type="email"
              placeholder="Email *"
              value={b2bForm.email}
              onChange={(e) => setB2bForm({ ...b2bForm, email: e.target.value })}
              className="bg-white border-[#1a1a1a]/10 rounded-none h-12"
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Phone"
                value={b2bForm.phone}
                onChange={(e) => setB2bForm({ ...b2bForm, phone: e.target.value })}
                className="bg-white border-[#1a1a1a]/10 rounded-none h-12"
              />
              <select
                value={b2bForm.type}
                onChange={(e) => setB2bForm({ ...b2bForm, type: e.target.value })}
                className="bg-white border border-[#1a1a1a]/10 h-12 px-3 text-[#4a4a4a]"
              >
                <option value="corporate">Corporate Gifting</option>
                <option value="hotel">Hotel Amenities</option>
                <option value="export">Export/Wholesale</option>
              </select>
            </div>
            <Input
              placeholder="Country"
              value={b2bForm.country}
              onChange={(e) => setB2bForm({ ...b2bForm, country: e.target.value })}
              className="bg-white border-[#1a1a1a]/10 rounded-none h-12"
            />
            <textarea
              placeholder="Tell us about your requirements..."
              value={b2bForm.message}
              onChange={(e) => setB2bForm({ ...b2bForm, message: e.target.value })}
              className="w-full bg-white border border-[#1a1a1a]/10 p-3 text-[#4a4a4a] h-24 resize-none"
            />
            <Button 
              type="submit"
              className="w-full bg-[#1a1a1a] text-white hover:bg-[#2d5a27] rounded-none h-12"
            >
              SUBMIT INQUIRY
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Collective Application Modal */}
      <Dialog open={collectiveModal} onOpenChange={setCollectiveModal}>
        <DialogContent className="bg-[#faf9f6] border-[#1a1a1a]/10 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[#1a1a1a] font-serif text-2xl">Join The Gaea Collective</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCollectiveApply} className="mt-4 space-y-4">
            <div>
              <label className="block text-sm text-[#6b6b6b] mb-2">Tell us about yourself</label>
              <textarea
                placeholder="Share a bit about your journey with sustainable living..."
                value={collectiveForm.bio}
                onChange={(e) => setCollectiveForm({ ...collectiveForm, bio: e.target.value })}
                className="w-full bg-white border border-[#1a1a1a]/10 p-3 text-[#4a4a4a] h-24 resize-none"
              />
            </div>
            
            <div>
              <label className="block text-sm text-[#6b6b6b] mb-2">Why do you want to join? *</label>
              <textarea
                placeholder="What excites you about the Gaea Collective?"
                value={collectiveForm.reason}
                onChange={(e) => setCollectiveForm({ ...collectiveForm, reason: e.target.value })}
                className="w-full bg-white border border-[#1a1a1a]/10 p-3 text-[#4a4a4a] h-24 resize-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-[#6b6b6b] mb-2">Interests (select all that apply)</label>
              <div className="flex flex-wrap gap-2">
                {['Eco Living', 'Zero Waste', 'Artisan Crafts', 'Sustainable Fashion', 'Plant-Based', 'Minimalism'].map(interest => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => {
                      const newInterests = collectiveForm.interests.includes(interest)
                        ? collectiveForm.interests.filter(i => i !== interest)
                        : [...collectiveForm.interests, interest];
                      setCollectiveForm({ ...collectiveForm, interests: newInterests });
                    }}
                    className={`px-3 py-1.5 text-sm border transition-all ${
                      collectiveForm.interests.includes(interest)
                        ? 'border-[#2d5a27] bg-[#2d5a27] text-white'
                        : 'border-[#1a1a1a]/20 text-[#4a4a4a] hover:border-[#2d5a27]'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[#6b6b6b] mb-2">Instagram (optional)</label>
                <Input
                  placeholder="@username"
                  value={collectiveForm.instagram}
                  onChange={(e) => setCollectiveForm({ ...collectiveForm, instagram: e.target.value })}
                  className="bg-white border-[#1a1a1a]/10 rounded-none h-12"
                />
              </div>
              <div>
                <label className="block text-sm text-[#6b6b6b] mb-2">Twitter (optional)</label>
                <Input
                  placeholder="@username"
                  value={collectiveForm.twitter}
                  onChange={(e) => setCollectiveForm({ ...collectiveForm, twitter: e.target.value })}
                  className="bg-white border-[#1a1a1a]/10 rounded-none h-12"
                />
              </div>
            </div>

            <Button 
              type="submit"
              className="w-full bg-[#1a1a1a] text-white hover:bg-[#2d5a27] rounded-none h-12"
            >
              SUBMIT APPLICATION
            </Button>
            <p className="text-center text-xs text-[#6b6b6b]">
              We review applications within 48 hours
            </p>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Product Card Component - Elegant Light Theme
function ProductCard({ product, index, onView, onAddToCart }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="product-card group cursor-pointer"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-[#f0efe9] mb-4">
        <img 
          src={product.images?.[0]} 
          alt={product.name}
          className="product-image w-full h-full object-cover"
        />
        {product.newArrival && (
          <Badge className="absolute top-4 left-4 bg-[#1a1a1a] text-white border-0">
            NEW
          </Badge>
        )}
        <div className="absolute inset-0 bg-[#1a1a1a]/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          <Button 
            variant="secondary" 
            size="sm"
            onClick={(e) => { e.stopPropagation(); onView(); }}
            className="bg-white text-[#1a1a1a] hover:bg-[#f5f4f0] rounded-none font-medium"
          >
            Quick View
          </Button>
          <Button 
            size="sm"
            onClick={(e) => { e.stopPropagation(); onAddToCart(); }}
            className="bg-[#1a1a1a] text-white hover:bg-[#2d5a27] rounded-none font-medium"
          >
            Add to Cart
          </Button>
        </div>
      </div>
      <div onClick={onView}>
        <p className="text-[#2d5a27] text-xs tracking-wider mb-1 font-medium">{product.material}</p>
        <h4 className="text-[#1a1a1a] font-medium mb-2 group-hover:text-[#2d5a27] transition-colors">
          {product.name}
        </h4>
        <div className="flex items-baseline gap-2">
          <span className="text-[#1a1a1a]">${product.price?.toFixed(2)}</span>
          {product.originalPrice && (
            <span className="text-[#6b6b6b] line-through text-sm">${product.originalPrice?.toFixed(2)}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
