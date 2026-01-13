'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  LayoutDashboard, Package, Users, FileText, Settings, LogOut,
  Plus, Edit, Trash2, Eye, Search, ChevronLeft, Leaf, Mail, Phone, Globe
} from 'lucide-react';

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [leads, setLeads] = useState([]);
  const [categories, setCategories] = useState([]);
  const [productModal, setProductModal] = useState({ open: false, mode: 'create', product: null });
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  // Product form state
  const [productForm, setProductForm] = useState({
    name: '', slug: '', description: '', price: '', originalPrice: '',
    category: 'personal-care', material: 'Bamboo', images: '',
    featured: false, newArrival: false, stock: ''
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('gaea_token');
    if (!token) {
      router.push('/');
      return;
    }

    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) {
        localStorage.removeItem('gaea_token');
        router.push('/');
        return;
      }

      const userData = await res.json();
      if (userData.role !== 'admin') {
        router.push('/');
        return;
      }

      setUser(userData);
      fetchData(token);
    } catch (error) {
      console.error('Auth error:', error);
      router.push('/');
    }
  };

  const fetchData = async (token) => {
    try {
      const [productsRes, leadsRes, categoriesRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/admin/leads', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/categories')
      ]);

      setProducts(await productsRes.json());
      if (leadsRes.ok) setLeads(await leadsRes.json());
      setCategories(await categoriesRes.json());
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('gaea_token');
    router.push('/');
  };

  const openProductModal = (mode, product = null) => {
    if (mode === 'edit' && product) {
      setProductForm({
        name: product.name || '',
        slug: product.slug || '',
        description: product.description || '',
        price: product.price?.toString() || '',
        originalPrice: product.originalPrice?.toString() || '',
        category: product.category || 'personal-care',
        material: product.material || 'Bamboo',
        images: product.images?.join(', ') || '',
        featured: product.featured || false,
        newArrival: product.newArrival || false,
        stock: product.stock?.toString() || ''
      });
    } else {
      setProductForm({
        name: '', slug: '', description: '', price: '', originalPrice: '',
        category: 'personal-care', material: 'Bamboo', images: '',
        featured: false, newArrival: false, stock: ''
      });
    }
    setProductModal({ open: true, mode, product });
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('gaea_token');
    
    const productData = {
      ...productForm,
      price: parseFloat(productForm.price),
      originalPrice: productForm.originalPrice ? parseFloat(productForm.originalPrice) : null,
      stock: parseInt(productForm.stock) || 0,
      images: productForm.images.split(',').map(img => img.trim()).filter(Boolean),
      slug: productForm.slug || productForm.name.toLowerCase().replace(/\s+/g, '-')
    };

    try {
      const url = productModal.mode === 'edit' 
        ? `/api/admin/products/${productModal.product.id}`
        : '/api/admin/products';
      
      const res = await fetch(url, {
        method: productModal.mode === 'edit' ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(productData)
      });

      if (res.ok) {
        setProductModal({ open: false, mode: 'create', product: null });
        fetchData(token);
      }
    } catch (error) {
      console.error('Product save error:', error);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    const token = localStorage.getItem('gaea_token');
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        fetchData(token);
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const updateLeadStatus = async (leadId, status) => {
    const token = localStorage.getItem('gaea_token');
    try {
      await fetch(`/api/admin/leads/${leadId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      fetchData(token);
    } catch (error) {
      console.error('Lead update error:', error);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center">
        <Leaf className="w-12 h-12 text-[#2d5a27] animate-pulse" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#faf9f6] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-[#1a1a1a]/10 flex flex-col">
        <div className="p-6 border-b border-[#1a1a1a]/10">
          <a href="/" className="flex items-center gap-2">
            <ChevronLeft className="w-4 h-4 text-[#6b6b6b]" />
            <h1 className="text-xl font-serif text-[#1a1a1a]">Gaea Admin</h1>
          </a>
        </div>
        
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {[
              { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
              { id: 'products', icon: Package, label: 'Products' },
              { id: 'leads', icon: FileText, label: 'B2B Leads' },
              { id: 'settings', icon: Settings, label: 'Settings' },
            ].map(item => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === item.id 
                      ? 'bg-[#2d5a27] text-white' 
                      : 'text-[#6b6b6b] hover:bg-[#1a1a1a]/5'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-[#1a1a1a]/10">
          <div className="flex items-center gap-3 mb-4 px-4">
            <div className="w-10 h-10 bg-[#2d5a27]/10 rounded-full flex items-center justify-center">
              <span className="text-[#2d5a27] font-medium">{user.name?.[0]}</span>
            </div>
            <div>
              <p className="text-[#1a1a1a] font-medium text-sm">{user.name}</p>
              <p className="text-[#6b6b6b] text-xs">Admin</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="w-full border-[#1a1a1a]/20 text-[#1a1a1a] hover:bg-red-50 hover:text-red-600 hover:border-red-200"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Dashboard Overview */}
        {activeTab === 'dashboard' && (
          <div className="p-8">
            <h2 className="text-3xl font-serif text-[#1a1a1a] mb-8">Dashboard</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[
                { label: 'Total Products', value: products.length, color: 'bg-[#2d5a27]' },
                { label: 'Featured', value: products.filter(p => p.featured).length, color: 'bg-blue-500' },
                { label: 'New Arrivals', value: products.filter(p => p.newArrival).length, color: 'bg-purple-500' },
                { label: 'B2B Leads', value: leads.length, color: 'bg-orange-500' },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white p-6 rounded-lg border border-[#1a1a1a]/10 shadow-sm"
                >
                  <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center mb-4`}>
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-3xl font-serif text-[#1a1a1a]">{stat.value}</p>
                  <p className="text-[#6b6b6b] text-sm">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            <div className="bg-white p-6 rounded-lg border border-[#1a1a1a]/10">
              <h3 className="text-xl font-serif text-[#1a1a1a] mb-4">Recent B2B Leads</h3>
              <div className="space-y-4">
                {leads.slice(0, 5).map(lead => (
                  <div key={lead.id} className="flex items-center justify-between p-4 bg-[#faf9f6] rounded-lg">
                    <div>
                      <p className="font-medium text-[#1a1a1a]">{lead.companyName}</p>
                      <p className="text-sm text-[#6b6b6b]">{lead.email}</p>
                    </div>
                    <Badge className={`${
                      lead.status === 'new' ? 'bg-blue-100 text-blue-700' :
                      lead.status === 'contacted' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {lead.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Products Management */}
        {activeTab === 'products' && (
          <div className="p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-serif text-[#1a1a1a]">Products</h2>
              <Button 
                onClick={() => openProductModal('create')}
                className="bg-[#2d5a27] text-white hover:bg-[#2d5a27]/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </div>

            <div className="bg-white rounded-lg border border-[#1a1a1a]/10 overflow-hidden">
              <div className="p-4 border-b border-[#1a1a1a]/10">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6b6b6b]" />
                  <Input
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-[#faf9f6] border-[#1a1a1a]/10"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#faf9f6]">
                    <tr>
                      <th className="text-left p-4 text-[#6b6b6b] font-medium text-sm">Product</th>
                      <th className="text-left p-4 text-[#6b6b6b] font-medium text-sm">Category</th>
                      <th className="text-left p-4 text-[#6b6b6b] font-medium text-sm">Price</th>
                      <th className="text-left p-4 text-[#6b6b6b] font-medium text-sm">Stock</th>
                      <th className="text-left p-4 text-[#6b6b6b] font-medium text-sm">Status</th>
                      <th className="text-right p-4 text-[#6b6b6b] font-medium text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map(product => (
                      <tr key={product.id} className="border-t border-[#1a1a1a]/5 hover:bg-[#faf9f6]/50">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img 
                              src={product.images?.[0]} 
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                            <div>
                              <p className="font-medium text-[#1a1a1a]">{product.name}</p>
                              <p className="text-sm text-[#6b6b6b]">{product.material}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-[#4a4a4a]">{product.category}</td>
                        <td className="p-4">
                          <span className="text-[#1a1a1a] font-medium">${product.price?.toFixed(2)}</span>
                          {product.originalPrice && (
                            <span className="text-[#6b6b6b] line-through text-sm ml-2">
                              ${product.originalPrice?.toFixed(2)}
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-[#4a4a4a]">{product.stock || 0}</td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            {product.featured && (
                              <Badge className="bg-[#2d5a27]/10 text-[#2d5a27] border-0">Featured</Badge>
                            )}
                            {product.newArrival && (
                              <Badge className="bg-blue-100 text-blue-700 border-0">New</Badge>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => openProductModal('edit', product)}
                              className="text-[#6b6b6b] hover:text-[#2d5a27]"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteProduct(product.id)}
                              className="text-[#6b6b6b] hover:text-red-500"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* B2B Leads */}
        {activeTab === 'leads' && (
          <div className="p-8">
            <h2 className="text-3xl font-serif text-[#1a1a1a] mb-8">B2B Leads</h2>

            <div className="bg-white rounded-lg border border-[#1a1a1a]/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#faf9f6]">
                    <tr>
                      <th className="text-left p-4 text-[#6b6b6b] font-medium text-sm">Company</th>
                      <th className="text-left p-4 text-[#6b6b6b] font-medium text-sm">Contact</th>
                      <th className="text-left p-4 text-[#6b6b6b] font-medium text-sm">Type</th>
                      <th className="text-left p-4 text-[#6b6b6b] font-medium text-sm">Country</th>
                      <th className="text-left p-4 text-[#6b6b6b] font-medium text-sm">Status</th>
                      <th className="text-left p-4 text-[#6b6b6b] font-medium text-sm">Date</th>
                      <th className="text-right p-4 text-[#6b6b6b] font-medium text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map(lead => (
                      <tr key={lead.id} className="border-t border-[#1a1a1a]/5 hover:bg-[#faf9f6]/50">
                        <td className="p-4">
                          <p className="font-medium text-[#1a1a1a]">{lead.companyName}</p>
                        </td>
                        <td className="p-4">
                          <p className="text-[#1a1a1a]">{lead.contactName || '-'}</p>
                          <p className="text-sm text-[#6b6b6b]">{lead.email}</p>
                          {lead.phone && <p className="text-sm text-[#6b6b6b]">{lead.phone}</p>}
                        </td>
                        <td className="p-4">
                          <Badge className="bg-[#1a1a1a]/5 text-[#4a4a4a] border-0 capitalize">
                            {lead.type}
                          </Badge>
                        </td>
                        <td className="p-4 text-[#4a4a4a]">{lead.country || '-'}</td>
                        <td className="p-4">
                          <select
                            value={lead.status}
                            onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                            className={`px-3 py-1 rounded text-sm font-medium border-0 ${
                              lead.status === 'new' ? 'bg-blue-100 text-blue-700' :
                              lead.status === 'contacted' ? 'bg-yellow-100 text-yellow-700' :
                              lead.status === 'converted' ? 'bg-green-100 text-green-700' :
                              'bg-gray-100 text-gray-700'
                            }`}
                          >
                            <option value="new">New</option>
                            <option value="contacted">Contacted</option>
                            <option value="converted">Converted</option>
                            <option value="closed">Closed</option>
                          </select>
                        </td>
                        <td className="p-4 text-[#6b6b6b] text-sm">
                          {new Date(lead.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-4">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-[#6b6b6b] hover:text-[#2d5a27]"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Settings */}
        {activeTab === 'settings' && (
          <div className="p-8">
            <h2 className="text-3xl font-serif text-[#1a1a1a] mb-8">Settings</h2>
            
            <div className="bg-white rounded-lg border border-[#1a1a1a]/10 p-6 max-w-2xl">
              <h3 className="text-lg font-medium text-[#1a1a1a] mb-6">Store Information</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#6b6b6b] mb-2">Store Name</label>
                  <Input defaultValue="The Gaea Store" className="bg-[#faf9f6] border-[#1a1a1a]/10" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#6b6b6b] mb-2">Contact Email</label>
                  <Input defaultValue="hello@gaeastore.com" className="bg-[#faf9f6] border-[#1a1a1a]/10" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#6b6b6b] mb-2">Phone</label>
                  <Input defaultValue="+1 (555) 123-4567" className="bg-[#faf9f6] border-[#1a1a1a]/10" />
                </div>
                <Button className="bg-[#2d5a27] text-white hover:bg-[#2d5a27]/90 mt-4">
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Product Modal */}
      <Dialog open={productModal.open} onOpenChange={(open) => setProductModal({ ...productModal, open })}>
        <DialogContent className="bg-[#faf9f6] border-[#1a1a1a]/10 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#1a1a1a] font-serif text-2xl">
              {productModal.mode === 'edit' ? 'Edit Product' : 'Add New Product'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleProductSubmit} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#6b6b6b] mb-2">Product Name *</label>
                <Input
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="bg-white border-[#1a1a1a]/10"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#6b6b6b] mb-2">Slug</label>
                <Input
                  value={productForm.slug}
                  onChange={(e) => setProductForm({ ...productForm, slug: e.target.value })}
                  placeholder="auto-generated"
                  className="bg-white border-[#1a1a1a]/10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#6b6b6b] mb-2">Description *</label>
              <textarea
                value={productForm.description}
                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                className="w-full bg-white border border-[#1a1a1a]/10 rounded-md p-3 h-24"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#6b6b6b] mb-2">Price *</label>
                <Input
                  type="number"
                  step="0.01"
                  value={productForm.price}
                  onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                  className="bg-white border-[#1a1a1a]/10"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#6b6b6b] mb-2">Original Price</label>
                <Input
                  type="number"
                  step="0.01"
                  value={productForm.originalPrice}
                  onChange={(e) => setProductForm({ ...productForm, originalPrice: e.target.value })}
                  className="bg-white border-[#1a1a1a]/10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#6b6b6b] mb-2">Stock</label>
                <Input
                  type="number"
                  value={productForm.stock}
                  onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                  className="bg-white border-[#1a1a1a]/10"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#6b6b6b] mb-2">Category</label>
                <select
                  value={productForm.category}
                  onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                  className="w-full bg-white border border-[#1a1a1a]/10 rounded-md p-2 h-10"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.slug}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#6b6b6b] mb-2">Material</label>
                <select
                  value={productForm.material}
                  onChange={(e) => setProductForm({ ...productForm, material: e.target.value })}
                  className="w-full bg-white border border-[#1a1a1a]/10 rounded-md p-2 h-10"
                >
                  {['Bamboo', 'Teak', 'Walnut', 'Neem', 'Steel & Bamboo'].map(mat => (
                    <option key={mat} value={mat}>{mat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#6b6b6b] mb-2">Image URLs (comma separated)</label>
              <Input
                value={productForm.images}
                onChange={(e) => setProductForm({ ...productForm, images: e.target.value })}
                placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                className="bg-white border-[#1a1a1a]/10"
              />
            </div>

            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={productForm.featured}
                  onChange={(e) => setProductForm({ ...productForm, featured: e.target.checked })}
                  className="w-4 h-4 accent-[#2d5a27]"
                />
                <span className="text-[#4a4a4a]">Featured Product</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={productForm.newArrival}
                  onChange={(e) => setProductForm({ ...productForm, newArrival: e.target.checked })}
                  className="w-4 h-4 accent-[#2d5a27]"
                />
                <span className="text-[#4a4a4a]">New Arrival</span>
              </label>
            </div>

            <div className="flex gap-4 pt-4">
              <Button 
                type="button"
                variant="outline"
                onClick={() => setProductModal({ open: false, mode: 'create', product: null })}
                className="flex-1 border-[#1a1a1a]/20 text-[#1a1a1a]"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="flex-1 bg-[#2d5a27] text-white hover:bg-[#2d5a27]/90"
              >
                {productModal.mode === 'edit' ? 'Update Product' : 'Create Product'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
