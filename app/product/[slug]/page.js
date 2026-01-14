'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, Leaf, Star, Minus, Plus, ShoppingBag, Heart,
  Truck, Shield, RotateCcw, ChevronRight, User, Check
} from 'lucide-react';

export default function ProductPage() {
  const params = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${params.slug}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data);
          
          // Set default variant if exists
          if (data.variants && data.variants.length > 0) {
            const defaultVar = data.variants.find(v => v.isDefault) || data.variants[0];
            setSelectedVariant(defaultVar);
          }
          
          // Fetch related products from same category
          const relatedRes = await fetch(`/api/products?category=${data.category}&limit=4`);
          if (relatedRes.ok) {
            const relatedData = await relatedRes.json();
            setRelatedProducts(relatedData.filter(p => p.id !== data.id).slice(0, 4));
          }
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (params.slug) {
      fetchProduct();
    }
  }, [params.slug]);

  // Get the current price (variant price or base price)
  const getCurrentPrice = () => {
    if (selectedVariant && selectedVariant.price) {
      return parseFloat(selectedVariant.price);
    }
    return product?.price || 0;
  };

  // Get the current stock (variant stock or base stock)
  const getCurrentStock = () => {
    if (selectedVariant && selectedVariant.stock !== undefined) {
      return parseInt(selectedVariant.stock);
    }
    return product?.stock || 0;
  };

  const handleAddToCart = async () => {
    const token = localStorage.getItem('gaea_token');
    if (!token) {
      alert('Please login to add items to cart');
      return;
    }

    setAddingToCart(true);
    try {
      const cartItem = {
        productId: product.id,
        quantity,
        name: product.name,
        price: getCurrentPrice(),
        image: getProductImages()[0]
      };

      // Add variant info if selected
      if (selectedVariant) {
        cartItem.variantId = selectedVariant.id;
        cartItem.variantType = selectedVariant.type;
        cartItem.variantValue = selectedVariant.value;
        cartItem.variantSku = selectedVariant.sku;
        cartItem.name = `${product.name} - ${selectedVariant.value}`;
      }

      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(cartItem)
      });

      if (res.ok) {
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 2000);
      }
    } catch (error) {
      console.error('Add to cart error:', error);
    } finally {
      setAddingToCart(false);
    }
  };

  // Helper function to get product images - handles both URL strings and /api/images paths
  const getProductImages = () => {
    if (!product) return [];
    
    let images = [];
    
    // Handle images field (could be string or array)
    if (product.images) {
      if (Array.isArray(product.images)) {
        images = product.images;
      } else if (typeof product.images === 'string') {
        images = product.images.split(',').map(url => url.trim()).filter(Boolean);
      }
    }
    
    // Also check for single image field
    if (product.image && !images.includes(product.image)) {
      images.unshift(product.image);
    }
    
    return images.length > 0 ? images : ['https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&q=80'];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center">
        <Leaf className="w-12 h-12 text-[#2d5a27] animate-pulse" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#faf9f6] flex flex-col items-center justify-center">
        <h1 className="text-2xl font-serif text-[#1a1a1a] mb-4">Product Not Found</h1>
        <Link href="/" className="text-[#2d5a27] hover:underline">← Back to Store</Link>
      </div>
    );
  }

  const images = getProductImages();
  const discount = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;

  // Mock reviews for display
  const reviews = [
    { id: 1, name: 'Sarah M.', rating: 5, date: '2 weeks ago', comment: 'Absolutely love this product! The quality is exceptional and it\'s so eco-friendly. Will definitely buy again.', verified: true },
    { id: 2, name: 'James L.', rating: 4, date: '1 month ago', comment: 'Great sustainable alternative. The bamboo feels premium and the craftsmanship is excellent.', verified: true },
    { id: 3, name: 'Emily R.', rating: 5, date: '1 month ago', comment: 'Perfect for anyone looking to reduce their plastic waste. Beautiful design too!', verified: true },
  ];

  const avgRating = product.rating || 4.8;
  const reviewCount = product.reviews || reviews.length;

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
              <span className="text-xl font-serif text-[#1a1a1a]">Gaea</span>
            </Link>
            <Link href="/#products" className="text-[#6b6b6b] hover:text-[#1a1a1a] transition-colors">
              <ShoppingBag className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="container mx-auto px-4 sm:px-6 py-4">
        <nav className="flex items-center gap-2 text-sm text-[#6b6b6b]">
          <Link href="/" className="hover:text-[#2d5a27]">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/#products" className="hover:text-[#2d5a27]">Products</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-[#1a1a1a]">{product.name}</span>
        </nav>
      </div>

      {/* Product Section */}
      <section className="container mx-auto px-4 sm:px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Images */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="aspect-square bg-white border border-[#1a1a1a]/5 overflow-hidden mb-4">
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-20 h-20 flex-shrink-0 border-2 transition-all overflow-hidden ${
                      selectedImage === i ? 'border-[#2d5a27]' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Badge className="bg-[#2d5a27]/10 text-[#2d5a27] border-0 capitalize">
                {product.category?.replace('-', ' ')}
              </Badge>
              {product.newArrival && (
                <Badge className="bg-[#1a1a1a] text-white border-0">New</Badge>
              )}
              {discount > 0 && (
                <Badge className="bg-red-500 text-white border-0">-{discount}%</Badge>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-serif text-[#1a1a1a] mb-4">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${star <= Math.round(avgRating) ? 'fill-[#f59e0b] text-[#f59e0b]' : 'text-[#d1d5db]'}`}
                  />
                ))}
              </div>
              <span className="text-[#1a1a1a] font-medium">{avgRating}</span>
              <span className="text-[#6b6b6b]">({reviewCount} reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-serif text-[#1a1a1a]">${product.price?.toFixed(2)}</span>
              {product.originalPrice && (
                <span className="text-xl text-[#6b6b6b] line-through">${product.originalPrice.toFixed(2)}</span>
              )}
            </div>

            {/* Description */}
            <p className="text-[#4a4a4a] leading-relaxed mb-6">
              {product.description}
            </p>

            {/* Specifications */}
            <div className="bg-[#f5f4f0] p-4 mb-6">
              <h3 className="font-medium text-[#1a1a1a] mb-3">Specifications</h3>
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <span className="text-[#6b6b6b]">Material</span>
                <span className="text-[#1a1a1a]">{product.material || 'Bamboo'}</span>
                <span className="text-[#6b6b6b]">Category</span>
                <span className="text-[#1a1a1a] capitalize">{product.category?.replace('-', ' ')}</span>
                <span className="text-[#6b6b6b]">Stock</span>
                <span className="text-[#1a1a1a]">{product.stock > 0 ? `${product.stock} available` : 'Out of stock'}</span>
                <span className="text-[#6b6b6b]">SKU</span>
                <span className="text-[#1a1a1a] font-mono text-xs">{product.id?.slice(0, 8).toUpperCase()}</span>
              </div>
            </div>

            {/* Quantity & Add to Cart */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border border-[#1a1a1a]/10">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 text-[#6b6b6b] hover:text-[#1a1a1a] transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center text-[#1a1a1a] font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-3 text-[#6b6b6b] hover:text-[#1a1a1a] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <Button
                onClick={handleAddToCart}
                disabled={addingToCart || product.stock === 0}
                className={`flex-1 h-12 rounded-none text-white transition-all ${
                  addedToCart ? 'bg-green-600' : 'bg-[#1a1a1a] hover:bg-[#2d5a27]'
                }`}
              >
                {addedToCart ? (
                  <>
                    <Check className="w-5 h-5 mr-2" />
                    Added to Cart
                  </>
                ) : addingToCart ? (
                  'Adding...'
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5 mr-2" />
                    Add to Cart
                  </>
                )}
              </Button>

              <Button variant="outline" size="icon" className="h-12 w-12 rounded-none border-[#1a1a1a]/10">
                <Heart className="w-5 h-5" />
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[#1a1a1a]/10">
              <div className="text-center">
                <Truck className="w-6 h-6 mx-auto text-[#2d5a27] mb-2" />
                <p className="text-xs text-[#6b6b6b]">Free Shipping</p>
                <p className="text-xs text-[#1a1a1a]">Over $50</p>
              </div>
              <div className="text-center">
                <Shield className="w-6 h-6 mx-auto text-[#2d5a27] mb-2" />
                <p className="text-xs text-[#6b6b6b]">Secure Payment</p>
                <p className="text-xs text-[#1a1a1a]">100% Protected</p>
              </div>
              <div className="text-center">
                <RotateCcw className="w-6 h-6 mx-auto text-[#2d5a27] mb-2" />
                <p className="text-xs text-[#6b6b6b]">Easy Returns</p>
                <p className="text-xs text-[#1a1a1a]">30 Days</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-16 px-4 sm:px-6 bg-white">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl sm:text-3xl font-serif text-[#1a1a1a]">Customer Reviews</h2>
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${star <= Math.round(avgRating) ? 'fill-[#f59e0b] text-[#f59e0b]' : 'text-[#d1d5db]'}`}
                  />
                ))}
              </div>
              <span className="text-[#1a1a1a] font-medium">{avgRating} out of 5</span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map(review => (
              <div key={review.id} className="bg-[#faf9f6] p-6 border border-[#1a1a1a]/5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#2d5a27]/10 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-[#2d5a27]" />
                    </div>
                    <div>
                      <p className="font-medium text-[#1a1a1a]">{review.name}</p>
                      {review.verified && (
                        <p className="text-xs text-[#2d5a27]">✓ Verified Purchase</p>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-[#6b6b6b]">{review.date}</span>
                </div>
                <div className="flex mb-3">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${star <= review.rating ? 'fill-[#f59e0b] text-[#f59e0b]' : 'text-[#d1d5db]'}`}
                    />
                  ))}
                </div>
                <p className="text-[#4a4a4a] text-sm leading-relaxed">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="py-16 px-4 sm:px-6 bg-[#f5f4f0]">
          <div className="container mx-auto">
            <h2 className="text-2xl sm:text-3xl font-serif text-[#1a1a1a] mb-8">You May Also Like</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map(item => {
                const itemImages = item.images 
                  ? (Array.isArray(item.images) ? item.images : item.images.split(',').map(u => u.trim()))
                  : [item.image];
                
                return (
                  <Link key={item.id} href={`/product/${item.slug || item.id}`} className="group">
                    <div className="bg-white border border-[#1a1a1a]/5 overflow-hidden">
                      <div className="aspect-square bg-[#f0efe9] overflow-hidden">
                        <img
                          src={itemImages[0]}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium text-[#1a1a1a] group-hover:text-[#2d5a27] transition-colors line-clamp-1">
                          {item.name}
                        </h3>
                        <p className="text-[#2d5a27] font-medium">${item.price?.toFixed(2)}</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Footer CTA */}
      <section className="py-12 px-4 sm:px-6 bg-[#1a1a1a] text-white">
        <div className="container mx-auto text-center">
          <h3 className="text-xl font-serif mb-4">Have Questions?</h3>
          <p className="text-white/70 mb-6">Our team is here to help you find the perfect sustainable products.</p>
          <Link href="/">
            <Button variant="outline" className="border-white text-white hover:bg-white hover:text-[#1a1a1a]">
              Contact Us
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
