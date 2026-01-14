'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  User, Mail, Calendar, ShoppingBag, Heart, ArrowLeft, Leaf, 
  Package, Clock, CheckCircle, XCircle, Users, Star, Edit
} from 'lucide-react';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [collectiveStatus, setCollectiveStatus] = useState({ isMember: false, applicationStatus: null });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('gaea_token');
    if (!token) {
      router.push('/');
      return;
    }

    const fetchUserData = async () => {
      try {
        const [userRes, ordersRes, collectiveRes] = await Promise.all([
          fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/orders', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/collective/status', { headers: { Authorization: `Bearer ${token}` } })
        ]);

        if (userRes.ok) {
          setUser(await userRes.json());
        } else {
          localStorage.removeItem('gaea_token');
          router.push('/');
          return;
        }

        if (ordersRes.ok) {
          setOrders(await ordersRes.json());
        }

        if (collectiveRes.ok) {
          setCollectiveStatus(await collectiveRes.json());
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center">
        <Leaf className="w-12 h-12 text-[#2d5a27] animate-pulse" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#faf9f6]">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-[#1a1a1a]/10 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-[#6b6b6b] hover:text-[#1a1a1a] transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Store</span>
            </Link>
            <Link href="/" className="flex items-center gap-2">
              <Leaf className="w-6 h-6 text-[#2d5a27]" />
              <span className="text-xl font-serif text-[#1a1a1a]">The Gaea Store</span>
            </Link>
            <div className="w-24"></div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 py-8">
        <div className="grid lg:grid-cols-[280px_1fr] gap-8">
          {/* Sidebar */}
          <aside className="bg-white rounded-lg border border-[#1a1a1a]/10 p-6 h-fit">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-[#2d5a27]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-10 h-10 text-[#2d5a27]" />
              </div>
              <h2 className="text-xl font-serif text-[#1a1a1a]">{user.name || 'User'}</h2>
              <p className="text-[#6b6b6b] text-sm">{user.email}</p>
              
              {collectiveStatus.isMember && (
                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-[#2d5a27] text-white text-sm rounded-full">
                  <Users className="w-4 h-4" />
                  <span>Collective Member</span>
                </div>
              )}
            </div>
            
            <Separator className="my-4 bg-[#1a1a1a]/10" />
            
            <nav className="space-y-2">
              {[
                { id: 'overview', icon: User, label: 'Overview' },
                { id: 'orders', icon: ShoppingBag, label: 'My Orders' },
                { id: 'collective', icon: Users, label: 'Gaea Collective' },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === item.id
                      ? 'bg-[#2d5a27]/10 text-[#2d5a27]'
                      : 'text-[#6b6b6b] hover:bg-[#faf9f6]'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <main>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h1 className="text-3xl font-serif text-[#1a1a1a] mb-8">Welcome back, {user.name?.split(' ')[0] || 'there'}!</h1>
                
                {/* Stats */}
                <div className="grid sm:grid-cols-3 gap-4 mb-8">
                  <div className="bg-white p-6 rounded-lg border border-[#1a1a1a]/10">
                    <ShoppingBag className="w-8 h-8 text-[#2d5a27] mb-3" />
                    <p className="text-2xl font-serif text-[#1a1a1a]">{orders.length}</p>
                    <p className="text-[#6b6b6b] text-sm">Total Orders</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg border border-[#1a1a1a]/10">
                    <Calendar className="w-8 h-8 text-[#2d5a27] mb-3" />
                    <p className="text-2xl font-serif text-[#1a1a1a]">
                      {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </p>
                    <p className="text-[#6b6b6b] text-sm">Member Since</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg border border-[#1a1a1a]/10">
                    <Users className="w-8 h-8 text-[#2d5a27] mb-3" />
                    <p className="text-2xl font-serif text-[#1a1a1a]">
                      {collectiveStatus.isMember ? 'Active' : collectiveStatus.applicationStatus || 'Not Applied'}
                    </p>
                    <p className="text-[#6b6b6b] text-sm">Collective Status</p>
                  </div>
                </div>

                {/* Collective Membership Card */}
                {collectiveStatus.isMember && (
                  <div className="bg-gradient-to-br from-[#2d5a27] to-[#1a3d18] text-white p-8 rounded-lg mb-8">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Star className="w-5 h-5 text-[#7cb342]" />
                          <span className="text-[#7cb342] font-medium">GAEA COLLECTIVE</span>
                        </div>
                        <h3 className="text-2xl font-serif mb-2">You're a Member!</h3>
                        <p className="text-white/70 text-sm">
                          Thank you for being part of our sustainable community. Enjoy exclusive benefits and early access to new products.
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-white/50 text-xs">Member ID</p>
                        <p className="font-mono text-sm">{user.id?.slice(0, 8).toUpperCase()}</p>
                      </div>
                    </div>
                    
                    <Separator className="my-6 bg-white/20" />
                    
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-serif">10%</p>
                        <p className="text-white/60 text-xs">Member Discount</p>
                      </div>
                      <div>
                        <p className="text-2xl font-serif">Early</p>
                        <p className="text-white/60 text-xs">Access to Drops</p>
                      </div>
                      <div>
                        <p className="text-2xl font-serif">Free</p>
                        <p className="text-white/60 text-xs">Shipping</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Recent Orders */}
                <div className="bg-white rounded-lg border border-[#1a1a1a]/10 p-6">
                  <h3 className="text-lg font-serif text-[#1a1a1a] mb-4">Recent Orders</h3>
                  {orders.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="w-12 h-12 text-[#6b6b6b] mx-auto mb-3" />
                      <p className="text-[#6b6b6b]">No orders yet</p>
                      <Link href="/" className="text-[#2d5a27] text-sm hover:underline mt-2 inline-block">
                        Start shopping →
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.slice(0, 3).map(order => (
                        <div key={order.id} className="flex items-center justify-between p-4 bg-[#faf9f6] rounded-lg">
                          <div>
                            <p className="font-mono text-sm text-[#2d5a27]">{order.orderNumber}</p>
                            <p className="text-[#6b6b6b] text-sm">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-[#1a1a1a]">${order.total?.toFixed(2)}</p>
                            <Badge className={`${
                              order.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                              order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-700'
                            } border-0`}>
                              {order.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h1 className="text-3xl font-serif text-[#1a1a1a] mb-8">My Orders</h1>
                
                {orders.length === 0 ? (
                  <div className="bg-white rounded-lg border border-[#1a1a1a]/10 p-12 text-center">
                    <Package className="w-16 h-16 text-[#6b6b6b] mx-auto mb-4" />
                    <h3 className="text-xl font-serif text-[#1a1a1a] mb-2">No orders yet</h3>
                    <p className="text-[#6b6b6b] mb-4">Start shopping to see your orders here</p>
                    <Link href="/">
                      <Button className="bg-[#2d5a27] text-white hover:bg-[#2d5a27]/90">
                        Browse Products
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map(order => (
                      <div key={order.id} className="bg-white rounded-lg border border-[#1a1a1a]/10 p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <p className="font-mono text-lg text-[#2d5a27]">{order.orderNumber}</p>
                            <p className="text-[#6b6b6b] text-sm">
                              Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                                month: 'long', day: 'numeric', year: 'numeric'
                              })}
                            </p>
                          </div>
                          <Badge className={`${
                            order.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                            order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                            order.status === 'delivered' ? 'bg-[#2d5a27] text-white' :
                            'bg-gray-100 text-gray-700'
                          } border-0 capitalize`}>
                            {order.status}
                          </Badge>
                        </div>
                        
                        <Separator className="my-4 bg-[#1a1a1a]/10" />
                        
                        <div className="space-y-3">
                          {order.items?.map((item, i) => (
                            <div key={i} className="flex items-center gap-4">
                              <div className="w-16 h-16 bg-[#f0efe9] rounded overflow-hidden">
                                {item.image && (
                                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                )}
                              </div>
                              <div className="flex-1">
                                <p className="text-[#1a1a1a] font-medium">{item.name}</p>
                                <p className="text-[#6b6b6b] text-sm">Qty: {item.quantity}</p>
                              </div>
                              <p className="text-[#1a1a1a]">${(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                          ))}
                        </div>
                        
                        <Separator className="my-4 bg-[#1a1a1a]/10" />
                        
                        <div className="flex justify-between items-center">
                          <div className="text-sm text-[#6b6b6b]">
                            {order.shippingAddress && (
                              <p>Ships to: {order.shippingAddress.city}, {order.shippingAddress.country}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-[#6b6b6b] text-sm">Total</p>
                            <p className="text-xl font-serif text-[#1a1a1a]">${order.total?.toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Collective Tab */}
            {activeTab === 'collective' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h1 className="text-3xl font-serif text-[#1a1a1a] mb-8">Gaea Collective</h1>
                
                {collectiveStatus.isMember ? (
                  <div className="space-y-6">
                    {/* Membership Card */}
                    <div className="bg-gradient-to-br from-[#2d5a27] to-[#1a3d18] text-white p-8 rounded-lg">
                      <div className="flex items-center gap-3 mb-4">
                        <CheckCircle className="w-8 h-8 text-[#7cb342]" />
                        <div>
                          <h3 className="text-2xl font-serif">Active Member</h3>
                          <p className="text-white/70 text-sm">Welcome to the Gaea Collective!</p>
                        </div>
                      </div>
                      
                      <Separator className="my-6 bg-white/20" />
                      
                      <div className="grid sm:grid-cols-2 gap-6">
                        <div>
                          <p className="text-white/50 text-sm mb-1">Member Since</p>
                          <p className="font-medium">
                            {user.collectiveJoinedAt 
                              ? new Date(user.collectiveJoinedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                              : 'Recently Joined'}
                          </p>
                        </div>
                        <div>
                          <p className="text-white/50 text-sm mb-1">Member ID</p>
                          <p className="font-mono">{user.id?.slice(0, 12).toUpperCase()}</p>
                        </div>
                      </div>
                    </div>

                    {/* Benefits */}
                    <div className="bg-white rounded-lg border border-[#1a1a1a]/10 p-6">
                      <h3 className="text-lg font-serif text-[#1a1a1a] mb-4">Your Benefits</h3>
                      <div className="grid sm:grid-cols-2 gap-4">
                        {[
                          { icon: Star, title: '10% Member Discount', desc: 'On all products' },
                          { icon: Package, title: 'Free Shipping', desc: 'On orders over $25' },
                          { icon: Clock, title: 'Early Access', desc: 'New product launches' },
                          { icon: Users, title: 'Community Events', desc: 'Exclusive workshops' },
                        ].map((benefit, i) => (
                          <div key={i} className="flex items-start gap-3 p-4 bg-[#faf9f6] rounded-lg">
                            <div className="w-10 h-10 bg-[#2d5a27]/10 rounded-full flex items-center justify-center flex-shrink-0">
                              <benefit.icon className="w-5 h-5 text-[#2d5a27]" />
                            </div>
                            <div>
                              <p className="font-medium text-[#1a1a1a]">{benefit.title}</p>
                              <p className="text-[#6b6b6b] text-sm">{benefit.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : collectiveStatus.applicationStatus === 'pending' ? (
                  <div className="bg-white rounded-lg border border-[#1a1a1a]/10 p-8 text-center">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Clock className="w-8 h-8 text-yellow-600" />
                    </div>
                    <h3 className="text-xl font-serif text-[#1a1a1a] mb-2">Application Under Review</h3>
                    <p className="text-[#6b6b6b] max-w-md mx-auto">
                      We're reviewing your application to join the Gaea Collective. You'll receive an email once your application is processed.
                    </p>
                  </div>
                ) : collectiveStatus.applicationStatus === 'rejected' ? (
                  <div className="bg-white rounded-lg border border-[#1a1a1a]/10 p-8 text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <XCircle className="w-8 h-8 text-red-600" />
                    </div>
                    <h3 className="text-xl font-serif text-[#1a1a1a] mb-2">Application Not Approved</h3>
                    <p className="text-[#6b6b6b] max-w-md mx-auto mb-4">
                      Unfortunately, your application wasn't approved at this time. You can apply again in the future.
                    </p>
                    <Link href="/#collective">
                      <Button className="bg-[#2d5a27] text-white hover:bg-[#2d5a27]/90">
                        Learn More About the Collective
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg border border-[#1a1a1a]/10 p-8 text-center">
                    <div className="w-16 h-16 bg-[#2d5a27]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-[#2d5a27]" />
                    </div>
                    <h3 className="text-xl font-serif text-[#1a1a1a] mb-2">Join the Gaea Collective</h3>
                    <p className="text-[#6b6b6b] max-w-md mx-auto mb-4">
                      Become part of our community of sustainability advocates. Enjoy exclusive benefits, early access, and connect with like-minded individuals.
                    </p>
                    <Link href="/#collective">
                      <Button className="bg-[#2d5a27] text-white hover:bg-[#2d5a27]/90">
                        Apply to Join
                      </Button>
                    </Link>
                  </div>
                )}
              </motion.div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
