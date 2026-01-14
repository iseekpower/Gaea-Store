'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Search, Calendar, User, Eye, ArrowRight, Leaf } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['all', 'lifestyle', 'sustainability', 'artisan', 'wellness', 'travel'];

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch('/api/blog');
        const data = await res.json();
        setPosts(Array.isArray(data) ? data : []);
        setFilteredPosts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  useEffect(() => {
    let filtered = posts;
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredPosts(filtered);
  }, [searchQuery, selectedCategory, posts]);

  const featuredPost = posts.find(p => p.featured) || posts[0];
  const regularPosts = filteredPosts.filter(p => p.id !== featuredPost?.id);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2d5a27]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f6]">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-[#1a1a1a]/10 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="w-5 h-5 text-[#1a1a1a]" />
              <span className="text-[#6b6b6b]">Back to Store</span>
            </Link>
            <Link href="/" className="flex items-center gap-2">
              <Leaf className="w-6 h-6 text-[#2d5a27]" />
              <span className="text-xl font-serif text-[#1a1a1a]">The Gaea Journal</span>
            </Link>
            <div className="w-24"></div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-gradient-to-b from-[#f5f4f0] to-[#faf9f6]">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-[#2d5a27] tracking-[0.2em] text-sm mb-4 font-medium">THE JOURNAL</p>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif text-[#1a1a1a] mb-6">Stories & Insights</h1>
            <p className="text-[#6b6b6b] max-w-2xl mx-auto text-lg font-light">
              Explore sustainable living tips, artisan stories, and the journey behind our products.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="py-6 px-4 sm:px-6 border-b border-[#1a1a1a]/10">
        <div className="container mx-auto">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6b6b6b]" />
              <Input
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white border-[#1a1a1a]/10 rounded-none h-12"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 text-sm whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-[#1a1a1a] text-white'
                      : 'bg-white text-[#4a4a4a] border border-[#1a1a1a]/10 hover:border-[#1a1a1a]/30'
                  }`}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Post */}
      {featuredPost && selectedCategory === 'all' && !searchQuery && (
        <section className="py-12 px-4 sm:px-6">
          <div className="container mx-auto">
            <Link href={`/blog/${featuredPost.slug || featuredPost.id}`}>
              <motion.article
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="group grid md:grid-cols-2 gap-8 items-center bg-white border border-[#1a1a1a]/5 overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="aspect-[16/10] md:aspect-[4/3] overflow-hidden bg-[#f0efe9]">
                  <img
                    src={featuredPost.image}
                    alt={featuredPost.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="p-8 md:p-12">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#2d5a27]/10 text-[#2d5a27] text-xs font-medium tracking-wider uppercase mb-4">
                    FEATURED
                  </div>
                  <div className="flex items-center gap-3 text-sm text-[#6b6b6b] mb-4">
                    <span className="text-[#2d5a27] font-medium">{featuredPost.category}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(featuredPost.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-[#1a1a1a] mb-4 group-hover:text-[#2d5a27] transition-colors">
                    {featuredPost.title}
                  </h2>
                  <p className="text-[#6b6b6b] font-light mb-6 line-clamp-3">{featuredPost.excerpt}</p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-[#2d5a27]/10 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-[#2d5a27]" />
                      </div>
                      <span className="text-[#4a4a4a] text-sm">{featuredPost.authorName || 'Gaea Team'}</span>
                    </div>
                    {featuredPost.views > 0 && (
                      <span className="flex items-center gap-1 text-[#6b6b6b] text-sm">
                        <Eye className="w-4 h-4" />
                        {featuredPost.views} views
                      </span>
                    )}
                  </div>
                </div>
              </motion.article>
            </Link>
          </div>
        </section>
      )}

      {/* Posts Grid */}
      <section className="py-12 px-4 sm:px-6">
        <div className="container mx-auto">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-[#6b6b6b] text-lg">No articles found.</p>
              {posts.length === 0 && (
                <p className="text-[#6b6b6b] mt-2">Check back soon for new content!</p>
              )}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {(selectedCategory === 'all' && !searchQuery ? regularPosts : filteredPosts).map((post, i) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link href={`/blog/${post.slug || post.id}`} className="group block">
                    <div className="bg-white border border-[#1a1a1a]/5 overflow-hidden hover:shadow-lg transition-shadow h-full">
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
                          <span className="text-[#6b6b6b] text-xs">
                            {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <h3 className="font-serif text-xl text-[#1a1a1a] mb-2 group-hover:text-[#2d5a27] transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-[#6b6b6b] text-sm font-light line-clamp-2 mb-4">{post.excerpt}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-[#4a4a4a] text-sm">{post.authorName || 'Gaea Team'}</span>
                          <span className="text-[#2d5a27] text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                            Read <ArrowRight className="w-4 h-4" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 border-t border-[#1a1a1a]/10 bg-white">
        <div className="container mx-auto text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-[#2d5a27] hover:text-[#1a1a1a] transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to The Gaea Store</span>
          </Link>
        </div>
      </footer>
    </div>
  );
}
