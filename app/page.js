'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Menu, X, ShoppingBag, User, Search, ChevronRight, Star, Leaf, 
  ArrowRight, Instagram, Twitter, Facebook, Mail, MapPin, Phone,
  Minus, Plus, Trash2, Heart, Globe, Building2, Package
} from 'lucide-react';

// Hero images - Lifestyle shots with light backgrounds
const heroImage = 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1920&q=80'; // Person in nature meditation/wellness
const heroImage2 = 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1920&q=80'; // Natural lifestyle
const heroImageAlt = 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1920&q=80'; // Yoga/wellness lifestyle

export default function GaeaStore() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [productModal, setProductModal] = useState(null);
  const [b2bModal, setB2bModal] = useState(false);
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
  
  // Auth form state
  const [authForm, setAuthForm] = useState({ email: '', password: '', name: '' });
  const [authError, setAuthError] = useState('');

  // B2B form state
  const [b2bForm, setB2bForm] = useState({
    companyName: '', contactName: '', email: '', phone: '', type: 'corporate', message: '', country: ''
  });

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 1.1]);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes, testimonialsRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/categories'),
          fetch('/api/testimonials')
        ]);
        
        setProducts(await productsRes.json());
        setCategories(await categoriesRes.json());
        setTestimonials(await testimonialsRes.json());
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Check for saved user
    const token = localStorage.getItem('gaea_token');
    if (token) {
      fetchUser(token);
    }
  }, []);

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

  const featuredProducts = products.filter(p => p.featured);
  const newArrivals = products.filter(p => p.newArrival);
  const filteredProducts = selectedCategory 
    ? products.filter(p => p.category === selectedCategory)
    : products;

  const cartTotal = cart.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
  const cartCount = cart.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Leaf className="w-16 h-16 text-[#c9a961] mx-auto mb-4 animate-pulse" />
          <p className="text-white/60 font-light tracking-widest">LOADING</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5"
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Menu Button */}
            <button 
              onClick={() => setMenuOpen(true)}
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
            >
              <Menu className="w-5 h-5" />
              <span className="text-sm tracking-wider hidden sm:inline">MENU</span>
            </button>

            {/* Logo */}
            <a href="/" className="absolute left-1/2 -translate-x-1/2">
              <h1 className="text-2xl font-serif tracking-wider">Gaea</h1>
            </a>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
              <button className="text-white/80 hover:text-white transition-colors hidden sm:block">
                <Search className="w-5 h-5" />
              </button>
              <button 
                onClick={() => user ? handleLogout() : setAuthOpen(true)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <User className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setCartOpen(true)}
                className="relative text-white/80 hover:text-white transition-colors"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-[#c9a961] text-[#050505] text-xs rounded-full flex items-center justify-center font-medium">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Slide-out Menu */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 bg-black/80 z-50"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed left-0 top-0 bottom-0 w-full max-w-md bg-[#0a0a0a] z-50 flex flex-col"
            >
              <div className="p-6 flex justify-between items-center border-b border-white/10">
                <span className="text-sm tracking-wider text-white/60">MENU</span>
                <button onClick={() => setMenuOpen(false)}>
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
                        className="text-3xl font-serif hover:text-[#c9a961] transition-colors flex items-center gap-4 group"
                      >
                        {item}
                        <ArrowRight className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    </motion.li>
                  ))}
                </ul>
              </nav>
              <div className="p-8 border-t border-white/10">
                <div className="flex gap-4">
                  <a href="#" className="text-white/60 hover:text-white transition-colors">
                    <Instagram className="w-5 h-5" />
                  </a>
                  <a href="#" className="text-white/60 hover:text-white transition-colors">
                    <Twitter className="w-5 h-5" />
                  </a>
                  <a href="#" className="text-white/60 hover:text-white transition-colors">
                    <Facebook className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section ref={heroRef} className="relative h-screen overflow-hidden">
        <motion.div 
          style={{ scale: heroScale, opacity: heroOpacity }}
          className="absolute inset-0"
        >
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${heroImage})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/40 via-transparent to-[#050505]" />
        </motion.div>
        
        <div className="relative h-full flex flex-col items-center justify-center text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="max-w-4xl"
          >
            <p className="text-[#c9a961] tracking-[0.3em] text-sm mb-6">SUSTAINABLE LIVING</p>
            <h2 className="text-5xl md:text-7xl lg:text-8xl font-serif mb-6 leading-tight">
              Nature's Craft,
              <br />
              <span className="italic text-[#c9a961]">Your Story</span>
            </h2>
            <p className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto mb-10 font-light">
              Premium bamboo and wood products for the conscious lifestyle. 
              Where sustainability meets luxury.
            </p>
            <Button 
              size="lg"
              onClick={() => document.getElementById('products').scrollIntoView({ behavior: 'smooth' })}
              className="bg-white text-[#050505] hover:bg-[#c9a961] hover:text-[#050505] px-12 py-6 text-sm tracking-wider rounded-none transition-all duration-300"
            >
              SHOP NOW
            </Button>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1 h-3 bg-white/60 rounded-full mt-2"
            />
          </div>
        </motion.div>
      </section>

      {/* Brand Statement */}
      <section className="py-32 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <p className="text-[#c9a961] tracking-[0.2em] text-sm mb-4">THE PHILOSOPHY</p>
              <h3 className="text-4xl md:text-5xl font-serif leading-tight mb-6">
                We exist in the space<br/>
                between <span className="text-[#c9a961]">nature</span><br/>
                and <span className="italic text-[#c9a961]">artistry.</span>
              </h3>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <p className="text-white/60 text-lg font-light leading-relaxed">
                The Gaea Store was founded on a simple principle: everyday products should 
                honor both the people who use them and the planet we share. We source the 
                finest bamboo, teak, walnut, and neem to create pieces that are as beautiful 
                as they are sustainable.
              </p>
              <div className="flex gap-12 pt-4">
                <div className="border-t border-white/20 pt-4">
                  <p className="text-3xl font-serif text-[#c9a961]">15K+</p>
                  <p className="text-white/40 text-sm tracking-wider">HAPPY CUSTOMERS</p>
                </div>
                <div className="border-t border-white/20 pt-4">
                  <p className="text-3xl font-serif text-[#c9a961]">50+</p>
                  <p className="text-white/40 text-sm tracking-wider">ARTISAN PARTNERS</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-[#c9a961] tracking-[0.2em] text-sm mb-4">COLLECTIONS</p>
            <h3 className="text-4xl md:text-5xl font-serif">Shop by Category</h3>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
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
                className="group relative aspect-[3/4] overflow-hidden"
              >
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                  style={{ backgroundImage: `url(${category.image})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h4 className="text-xl font-serif mb-2">{category.name}</h4>
                  <p className="text-white/50 text-sm line-clamp-2">{category.description}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 px-6 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-end justify-between mb-12"
          >
            <div>
              <p className="text-[#c9a961] tracking-[0.2em] text-sm mb-4">CURATED</p>
              <h3 className="text-4xl md:text-5xl font-serif">Featured Products</h3>
            </div>
            <button className="hidden md:flex items-center gap-2 text-white/60 hover:text-white transition-colors group">
              <span className="tracking-wider text-sm">VIEW ALL</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-end justify-between mb-12"
          >
            <div>
              <p className="text-[#c9a961] tracking-[0.2em] text-sm mb-4">JUST IN</p>
              <h3 className="text-4xl md:text-5xl font-serif">New Arrivals</h3>
            </div>
          </motion.div>

          <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide">
            {newArrivals.map((product, i) => (
              <div key={product.id} className="flex-shrink-0 w-72">
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
      <section id="products" className="py-20 px-6 bg-[#0a0a0a]">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-12"
          >
            <div>
              <p className="text-[#c9a961] tracking-[0.2em] text-sm mb-4">ALL PRODUCTS</p>
              <h3 className="text-4xl md:text-5xl font-serif">
                {selectedCategory 
                  ? categories.find(c => c.slug === selectedCategory)?.name || 'Products'
                  : 'Our Collection'
                }
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 text-sm tracking-wider border transition-all ${
                  !selectedCategory 
                    ? 'border-[#c9a961] text-[#c9a961]' 
                    : 'border-white/20 text-white/60 hover:border-white/40'
                }`}
              >
                ALL
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`px-4 py-2 text-sm tracking-wider border transition-all ${
                    selectedCategory === cat.slug 
                      ? 'border-[#c9a961] text-[#c9a961]' 
                      : 'border-white/20 text-white/60 hover:border-white/40'
                  }`}
                >
                  {cat.name.toUpperCase()}
                </button>
              ))}
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
        </div>
      </section>

      {/* B2B Section */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${heroImage2})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/90 to-[#050505]" />
        
        <div className="container mx-auto relative">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <p className="text-[#c9a961] tracking-[0.2em] text-sm mb-4">B2B & EXPORT</p>
              <h3 className="text-4xl md:text-5xl font-serif mb-6">
                Partner with Gaea
              </h3>
              <p className="text-white/60 text-lg mb-8 leading-relaxed">
                From corporate gifting solutions to hotel toiletries, we offer tailored 
                sustainable products for businesses worldwide. Currently exporting to 
                USA, UAE, Netherlands, UK, and Germany.
              </p>
              <div className="flex flex-wrap gap-4 mb-8">
                {['USA', 'UAE', 'Netherlands', 'UK', 'Germany'].map(country => (
                  <span key={country} className="px-4 py-2 border border-white/20 text-sm text-white/60">
                    {country}
                  </span>
                ))}
              </div>
              <Button 
                onClick={() => setB2bModal(true)}
                className="bg-[#c9a961] text-[#050505] hover:bg-[#c9a961]/90 px-8 py-6 rounded-none tracking-wider"
              >
                GET IN TOUCH
              </Button>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-6"
            >
              <div className="p-8 bg-white/5 border border-white/10">
                <Building2 className="w-10 h-10 text-[#c9a961] mb-4" />
                <h4 className="text-xl font-serif mb-2">Corporate Gifting</h4>
                <p className="text-white/50 text-sm">Sustainable gifts for employees and clients</p>
              </div>
              <div className="p-8 bg-white/5 border border-white/10">
                <Package className="w-10 h-10 text-[#c9a961] mb-4" />
                <h4 className="text-xl font-serif mb-2">Hotel Amenities</h4>
                <p className="text-white/50 text-sm">Eco-friendly toiletries for hospitality</p>
              </div>
              <div className="p-8 bg-white/5 border border-white/10 col-span-2">
                <Globe className="w-10 h-10 text-[#c9a961] mb-4" />
                <h4 className="text-xl font-serif mb-2">Global Export</h4>
                <p className="text-white/50 text-sm">Reliable shipping and customs support worldwide</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-[#c9a961] tracking-[0.2em] text-sm mb-4">TESTIMONIALS</p>
            <h3 className="text-4xl md:text-5xl font-serif">What People Say</h3>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((testimonial, i) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 bg-white/5 border border-white/10"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#c9a961] text-[#c9a961]" />
                  ))}
                </div>
                <p className="text-white/70 mb-6 font-light italic">"{testimonial.content}"</p>
                <div className="flex items-center gap-4">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium">{testimonial.name}</p>
                    <p className="text-white/50 text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 px-6 bg-[#0a0a0a]">
        <div className="container mx-auto max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Leaf className="w-12 h-12 text-[#c9a961] mx-auto mb-6" />
            <h3 className="text-3xl md:text-4xl font-serif mb-4">Join the Gaea Family</h3>
            <p className="text-white/60 mb-8">
              Subscribe for exclusive offers, sustainability tips, and early access to new collections.
            </p>
            <form onSubmit={handleNewsletter} className="flex flex-col sm:flex-row gap-4">
              <Input
                type="email"
                placeholder="Enter your email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="flex-1 bg-transparent border-white/20 rounded-none h-12 focus:border-[#c9a961] transition-colors"
                required
              />
              <Button 
                type="submit"
                className="bg-[#c9a961] text-[#050505] hover:bg-[#c9a961]/90 rounded-none h-12 px-8 tracking-wider"
              >
                SUBSCRIBE
              </Button>
            </form>
            {newsletterStatus && (
              <p className="text-[#c9a961] mt-4">{newsletterStatus}</p>
            )}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 border-t border-white/10">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-2 md:col-span-1">
              <h2 className="text-2xl font-serif mb-4">Gaea</h2>
              <p className="text-white/50 text-sm mb-6">
                Premium sustainable products for conscious living.
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-white/50 hover:text-[#c9a961] transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="text-white/50 hover:text-[#c9a961] transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="text-white/50 hover:text-[#c9a961] transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm tracking-wider text-white/80 mb-4">SHOP</h4>
              <ul className="space-y-3">
                {categories.map(cat => (
                  <li key={cat.id}>
                    <button 
                      onClick={() => {
                        setSelectedCategory(cat.slug);
                        document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="text-white/50 hover:text-white transition-colors text-sm"
                    >
                      {cat.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm tracking-wider text-white/80 mb-4">COMPANY</h4>
              <ul className="space-y-3">
                {['About Us', 'Sustainability', 'Careers', 'Press'].map(item => (
                  <li key={item}>
                    <a href="#" className="text-white/50 hover:text-white transition-colors text-sm">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm tracking-wider text-white/80 mb-4">CONTACT</h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-white/50 text-sm">
                  <Mail className="w-4 h-4" />
                  hello@gaeastore.com
                </li>
                <li className="flex items-center gap-2 text-white/50 text-sm">
                  <Phone className="w-4 h-4" />
                  +1 (555) 123-4567
                </li>
                <li className="flex items-start gap-2 text-white/50 text-sm">
                  <MapPin className="w-4 h-4 mt-0.5" />
                  123 Eco Street<br/>Portland, OR 97201
                </li>
              </ul>
            </div>
          </div>

          <Separator className="bg-white/10 mb-8" />

          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-white/40 text-sm">
            <p>© 2025 The Gaea Store. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Shipping Info</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Cart Sheet */}
      <Sheet open={cartOpen} onOpenChange={setCartOpen}>
        <SheetContent className="bg-[#0a0a0a] border-white/10 w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle className="text-white font-serif text-2xl">Your Cart</SheetTitle>
          </SheetHeader>
          <div className="mt-8 flex flex-col h-[calc(100vh-180px)]">
            {cart.items?.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <ShoppingBag className="w-16 h-16 text-white/20 mb-4" />
                <p className="text-white/60">Your cart is empty</p>
                <Button 
                  variant="outline" 
                  onClick={() => setCartOpen(false)}
                  className="mt-4 border-white/20 text-white hover:bg-white/10"
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
                          <h4 className="text-white font-medium">{item.name}</h4>
                          <p className="text-[#c9a961]">${item.price?.toFixed(2)}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <button 
                              onClick={() => updateCartItem(item.productId, item.quantity - 1)}
                              className="text-white/60 hover:text-white"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="text-white">{item.quantity}</span>
                            <button 
                              onClick={() => updateCartItem(item.productId, item.quantity + 1)}
                              className="text-white/60 hover:text-white"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => updateCartItem(item.productId, 0)}
                              className="ml-auto text-white/40 hover:text-red-400"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="pt-6 border-t border-white/10">
                  <div className="flex justify-between mb-4">
                    <span className="text-white/60">Subtotal</span>
                    <span className="text-white text-xl font-serif">${cartTotal.toFixed(2)}</span>
                  </div>
                  <Button className="w-full bg-[#c9a961] text-[#050505] hover:bg-[#c9a961]/90 rounded-none h-12">
                    CHECKOUT
                  </Button>
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Auth Modal */}
      <Dialog open={authOpen} onOpenChange={setAuthOpen}>
        <DialogContent className="bg-[#0a0a0a] border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white font-serif text-2xl text-center">
              {user ? 'Your Account' : 'Welcome'}
            </DialogTitle>
          </DialogHeader>
          
          {user ? (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-[#c9a961]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-10 h-10 text-[#c9a961]" />
              </div>
              <h3 className="text-white text-xl mb-2">{user.name}</h3>
              <p className="text-white/60 mb-6">{user.email}</p>
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="border-white/20 text-white hover:bg-white/10"
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <Tabs value={authTab} onValueChange={setAuthTab} className="mt-4">
              <TabsList className="grid grid-cols-2 bg-white/5">
                <TabsTrigger value="login" className="data-[state=active]:bg-[#c9a961] data-[state=active]:text-[#050505]">
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="register" className="data-[state=active]:bg-[#c9a961] data-[state=active]:text-[#050505]">
                  Register
                </TabsTrigger>
              </TabsList>
              
              <form onSubmit={handleAuth} className="mt-6 space-y-4">
                {authTab === 'register' && (
                  <Input
                    placeholder="Full Name"
                    value={authForm.name}
                    onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                    className="bg-transparent border-white/20 rounded-none h-12"
                    required
                  />
                )}
                <Input
                  type="email"
                  placeholder="Email"
                  value={authForm.email}
                  onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                  className="bg-transparent border-white/20 rounded-none h-12"
                  required
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={authForm.password}
                  onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                  className="bg-transparent border-white/20 rounded-none h-12"
                  required
                />
                {authError && (
                  <p className="text-red-400 text-sm">{authError}</p>
                )}
                <Button 
                  type="submit"
                  className="w-full bg-[#c9a961] text-[#050505] hover:bg-[#c9a961]/90 rounded-none h-12"
                >
                  {authTab === 'login' ? 'SIGN IN' : 'CREATE ACCOUNT'}
                </Button>
              </form>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Product Modal */}
      <Dialog open={!!productModal} onOpenChange={() => setProductModal(null)}>
        <DialogContent className="bg-[#0a0a0a] border-white/10 max-w-4xl p-0 overflow-hidden">
          {productModal && (
            <div className="grid md:grid-cols-2">
              <div className="aspect-square">
                <img 
                  src={productModal.images?.[0]} 
                  alt={productModal.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-8 flex flex-col">
                <Badge className="w-fit bg-[#c9a961]/20 text-[#c9a961] mb-4">
                  {productModal.material}
                </Badge>
                <h2 className="text-3xl font-serif text-white mb-2">{productModal.name}</h2>
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 ${i < Math.floor(productModal.rating || 0) ? 'fill-[#c9a961] text-[#c9a961]' : 'text-white/20'}`}
                      />
                    ))}
                  </div>
                  <span className="text-white/60 text-sm">({productModal.reviews} reviews)</span>
                </div>
                <div className="flex items-baseline gap-3 mb-6">
                  <span className="text-3xl text-[#c9a961] font-serif">${productModal.price?.toFixed(2)}</span>
                  {productModal.originalPrice && (
                    <span className="text-white/40 line-through">${productModal.originalPrice?.toFixed(2)}</span>
                  )}
                </div>
                <p className="text-white/60 mb-8 flex-1">{productModal.description}</p>
                <div className="flex gap-4">
                  <Button 
                    onClick={() => {
                      addToCart(productModal);
                      setProductModal(null);
                    }}
                    className="flex-1 bg-[#c9a961] text-[#050505] hover:bg-[#c9a961]/90 rounded-none h-12"
                  >
                    ADD TO CART
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-white/20 text-white hover:bg-white/10 rounded-none h-12 w-12 p-0"
                  >
                    <Heart className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* B2B Modal */}
      <Dialog open={b2bModal} onOpenChange={setB2bModal}>
        <DialogContent className="bg-[#0a0a0a] border-white/10 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white font-serif text-2xl">B2B Inquiry</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleB2bSubmit} className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Company Name *"
                value={b2bForm.companyName}
                onChange={(e) => setB2bForm({ ...b2bForm, companyName: e.target.value })}
                className="bg-transparent border-white/20 rounded-none h-12"
                required
              />
              <Input
                placeholder="Contact Name"
                value={b2bForm.contactName}
                onChange={(e) => setB2bForm({ ...b2bForm, contactName: e.target.value })}
                className="bg-transparent border-white/20 rounded-none h-12"
              />
            </div>
            <Input
              type="email"
              placeholder="Email *"
              value={b2bForm.email}
              onChange={(e) => setB2bForm({ ...b2bForm, email: e.target.value })}
              className="bg-transparent border-white/20 rounded-none h-12"
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Phone"
                value={b2bForm.phone}
                onChange={(e) => setB2bForm({ ...b2bForm, phone: e.target.value })}
                className="bg-transparent border-white/20 rounded-none h-12"
              />
              <select
                value={b2bForm.type}
                onChange={(e) => setB2bForm({ ...b2bForm, type: e.target.value })}
                className="bg-transparent border border-white/20 h-12 px-3 text-white/80"
              >
                <option value="corporate" className="bg-[#0a0a0a]">Corporate Gifting</option>
                <option value="hotel" className="bg-[#0a0a0a]">Hotel Amenities</option>
                <option value="export" className="bg-[#0a0a0a]">Export/Wholesale</option>
              </select>
            </div>
            <Input
              placeholder="Country"
              value={b2bForm.country}
              onChange={(e) => setB2bForm({ ...b2bForm, country: e.target.value })}
              className="bg-transparent border-white/20 rounded-none h-12"
            />
            <textarea
              placeholder="Tell us about your requirements..."
              value={b2bForm.message}
              onChange={(e) => setB2bForm({ ...b2bForm, message: e.target.value })}
              className="w-full bg-transparent border border-white/20 p-3 text-white/80 h-24 resize-none"
            />
            <Button 
              type="submit"
              className="w-full bg-[#c9a961] text-[#050505] hover:bg-[#c9a961]/90 rounded-none h-12"
            >
              SUBMIT INQUIRY
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Product Card Component
function ProductCard({ product, index, onView, onAddToCart }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="product-card group cursor-pointer"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-[#111] mb-4">
        <img 
          src={product.images?.[0]} 
          alt={product.name}
          className="product-image w-full h-full object-cover"
        />
        {product.newArrival && (
          <Badge className="absolute top-4 left-4 bg-[#c9a961] text-[#050505]">
            NEW
          </Badge>
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={(e) => { e.stopPropagation(); onView(); }}
            className="border-white text-white hover:bg-white hover:text-[#050505] rounded-none"
          >
            Quick View
          </Button>
          <Button 
            size="sm"
            onClick={(e) => { e.stopPropagation(); onAddToCart(); }}
            className="bg-[#c9a961] text-[#050505] hover:bg-[#c9a961]/90 rounded-none"
          >
            Add to Cart
          </Button>
        </div>
      </div>
      <div onClick={onView}>
        <p className="text-[#c9a961] text-xs tracking-wider mb-1">{product.material}</p>
        <h4 className="text-white font-medium mb-2 group-hover:text-[#c9a961] transition-colors">
          {product.name}
        </h4>
        <div className="flex items-baseline gap-2">
          <span className="text-white">${product.price?.toFixed(2)}</span>
          {product.originalPrice && (
            <span className="text-white/40 line-through text-sm">${product.originalPrice?.toFixed(2)}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
