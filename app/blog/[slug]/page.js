'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Calendar, User, Eye, Clock, Share2, Leaf, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BlogPostPage() {
  const params = useParams();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/blog/${params.slug}`);
        if (res.ok) {
          const data = await res.json();
          setPost(data);
          
          // Fetch related posts
          const relatedRes = await fetch(`/api/blog?category=${data.category}&limit=4`);
          if (relatedRes.ok) {
            const relatedData = await relatedRes.json();
            setRelatedPosts(relatedData.filter(p => p.id !== data.id).slice(0, 3));
          }
        }
      } catch (error) {
        console.error('Error fetching post:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (params.slug) {
      fetchPost();
    }
  }, [params.slug]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2d5a27]"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[#faf9f6] flex flex-col items-center justify-center">
        <h1 className="text-2xl font-serif text-[#1a1a1a] mb-4">Article Not Found</h1>
        <Link href="/blog" className="text-[#2d5a27] hover:underline">← Back to Journal</Link>
      </div>
    );
  }

  // Estimate reading time (average 200 words per minute)
  const wordCount = post.content?.split(/\s+/).length || 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="min-h-screen bg-[#faf9f6]">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-[#1a1a1a]/10 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/blog" className="flex items-center gap-2 text-[#6b6b6b] hover:text-[#1a1a1a] transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span>All Articles</span>
            </Link>
            <Link href="/" className="flex items-center gap-2">
              <Leaf className="w-6 h-6 text-[#2d5a27]" />
              <span className="text-xl font-serif text-[#1a1a1a] hidden sm:inline">The Gaea Journal</span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              className="text-[#6b6b6b] hover:text-[#1a1a1a]"
            >
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-[1fr_320px] gap-12 py-12">
          {/* Main Content */}
          <main>
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Category & Meta */}
              <div className="mb-6">
                <Link
                  href={`/blog?category=${post.category}`}
                  className="inline-flex items-center gap-2 text-[#2d5a27] text-sm font-medium tracking-wider uppercase hover:underline"
                >
                  {post.category}
                </Link>
                <span className="text-[#6b6b6b] mx-3">•</span>
                <span className="text-[#6b6b6b] text-sm">
                  {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#1a1a1a] mb-6 leading-tight">
                {post.title}
              </h1>

              {/* Excerpt */}
              <p className="text-xl text-[#6b6b6b] font-light mb-8 leading-relaxed">
                {post.excerpt}
              </p>

              {/* Author Info */}
              <div className="flex items-center gap-4 pb-8 mb-8 border-b border-[#1a1a1a]/10">
                <div className="flex items-center gap-3">
                  <span className="text-[#6b6b6b] text-sm">Written By:</span>
                  <div className="w-10 h-10 bg-[#2d5a27]/10 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-[#2d5a27]" />
                  </div>
                  <span className="text-[#1a1a1a] font-medium">{post.authorName || 'Gaea Team'}</span>
                </div>
              </div>

              {/* Featured Image */}
              <div className="aspect-[16/9] overflow-hidden bg-[#f0efe9] mb-10 rounded-lg">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Content */}
              <div className="prose prose-lg max-w-none">
                <div 
                  className="text-[#4a4a4a] leading-relaxed space-y-6"
                  style={{ fontSize: '1.125rem', lineHeight: '1.8' }}
                >
                  {post.content?.split('\n\n').map((paragraph, i) => {
                    // Check if it's a heading (starts with #)
                    if (paragraph.startsWith('## ')) {
                      return (
                        <h2 key={i} className="text-2xl font-serif text-[#1a1a1a] mt-10 mb-4">
                          {paragraph.replace('## ', '')}
                        </h2>
                      );
                    }
                    if (paragraph.startsWith('### ')) {
                      return (
                        <h3 key={i} className="text-xl font-serif text-[#1a1a1a] mt-8 mb-3">
                          {paragraph.replace('### ', '')}
                        </h3>
                      );
                    }
                    return (
                      <p key={i} className="text-[#4a4a4a]">
                        {paragraph}
                      </p>
                    );
                  })}
                </div>
              </div>

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="mt-10 pt-8 border-t border-[#1a1a1a]/10">
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-[#f0efe9] text-[#4a4a4a] text-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Share */}
              <div className="mt-10 pt-8 border-t border-[#1a1a1a]/10">
                <Button
                  onClick={handleShare}
                  variant="outline"
                  className="border-[#1a1a1a]/20 text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white rounded-none"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share this article
                </Button>
              </div>
            </motion.article>
          </main>

          {/* Sidebar */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            {/* Navigation */}
            <div className="bg-white border border-[#1a1a1a]/5 p-6 mb-6">
              <h3 className="text-sm font-medium text-[#1a1a1a] mb-4 tracking-wider uppercase">In This Article</h3>
              <nav className="space-y-2">
                <a href="#" className="block text-[#6b6b6b] hover:text-[#2d5a27] transition-colors text-sm py-1">Introduction</a>
                <a href="#" className="block text-[#6b6b6b] hover:text-[#2d5a27] transition-colors text-sm py-1">Key Points</a>
                <a href="#" className="block text-[#6b6b6b] hover:text-[#2d5a27] transition-colors text-sm py-1">Conclusion</a>
              </nav>
            </div>

            {/* Reading Time */}
            <div className="bg-[#2d5a27]/5 border border-[#2d5a27]/10 p-6 mb-6">
              <div className="flex items-center gap-3 text-[#2d5a27]">
                <Clock className="w-5 h-5" />
                <span className="text-sm font-medium">{readingTime} min read</span>
              </div>
              {post.views > 0 && (
                <div className="flex items-center gap-3 text-[#6b6b6b] mt-3">
                  <Eye className="w-5 h-5" />
                  <span className="text-sm">{post.views} views</span>
                </div>
              )}
            </div>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <div className="bg-white border border-[#1a1a1a]/5 p-6">
                <h3 className="text-sm font-medium text-[#1a1a1a] mb-4 tracking-wider uppercase">More in this category</h3>
                <div className="space-y-4">
                  {relatedPosts.map(related => (
                    <Link
                      key={related.id}
                      href={`/blog/${related.slug || related.id}`}
                      className="block group"
                    >
                      <h4 className="text-[#1a1a1a] font-medium group-hover:text-[#2d5a27] transition-colors line-clamp-2 text-sm">
                        {related.title}
                      </h4>
                      <span className="text-[#6b6b6b] text-xs">
                        {new Date(related.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>

      {/* Back to Blog */}
      <section className="py-12 px-4 sm:px-6 border-t border-[#1a1a1a]/10 bg-white">
        <div className="container mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-[#2d5a27] hover:text-[#1a1a1a] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to All Articles</span>
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-[#6b6b6b] hover:text-[#1a1a1a] transition-colors"
            >
              <span>Visit The Gaea Store</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
