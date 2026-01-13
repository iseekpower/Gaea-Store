import { v4 as uuidv4 } from 'uuid';

export const categories = [
  {
    id: uuidv4(),
    name: 'Personal Care',
    slug: 'personal-care',
    description: 'Natural bamboo and neem products for your daily wellness routine',
    image: 'https://images.unsplash.com/photo-1570865960770-80f383d97080?w=800&q=80'
  },
  {
    id: uuidv4(),
    name: 'Home & Kitchen',
    slug: 'home-kitchen',
    description: 'Sustainable bamboo and teak essentials for your conscious home',
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80'
  },
  {
    id: uuidv4(),
    name: 'Apparel',
    slug: 'apparel',
    description: 'Breathable bamboo fiber clothing for everyday comfort',
    image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800&q=80'
  },
  {
    id: uuidv4(),
    name: 'Decor',
    slug: 'decor',
    description: 'Handcrafted walnut and teak pieces to elevate your space',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80'
  },
  {
    id: uuidv4(),
    name: 'Travel EDC',
    slug: 'travel-edc',
    description: 'Sustainable everyday carry essentials for the conscious traveler',
    image: 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=800&q=80'
  }
];

export const products = [
  // Personal Care
  {
    id: uuidv4(),
    name: 'Bamboo Toothbrush Set',
    slug: 'bamboo-toothbrush-set',
    description: 'Pack of 4 biodegradable bamboo toothbrushes with charcoal-infused bristles. Gentle on gums, tough on plaque.',
    price: 12.99,
    originalPrice: 18.99,
    category: 'personal-care',
    material: 'Bamboo',
    images: ['https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=800&q=80'],
    featured: true,
    newArrival: true,
    stock: 150,
    rating: 4.8,
    reviews: 234
  },
  {
    id: uuidv4(),
    name: 'Bamboo Cotton Earbuds',
    slug: 'bamboo-cotton-earbuds',
    description: '200 biodegradable cotton swabs with bamboo stems. Plastic-free ear care for the planet.',
    price: 6.99,
    originalPrice: 9.99,
    category: 'personal-care',
    material: 'Bamboo',
    images: ['https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&q=80'],
    featured: false,
    newArrival: false,
    stock: 300,
    rating: 4.6,
    reviews: 156
  },
  {
    id: uuidv4(),
    name: 'Neem Wood Comb',
    slug: 'neem-wood-comb',
    description: 'Hand-carved neem wood comb with wide teeth. Natural anti-bacterial properties for healthy hair.',
    price: 14.99,
    originalPrice: 19.99,
    category: 'personal-care',
    material: 'Neem',
    images: ['https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80'],
    featured: true,
    newArrival: false,
    stock: 80,
    rating: 4.9,
    reviews: 312
  },
  {
    id: uuidv4(),
    name: 'Bamboo Tongue Scraper',
    slug: 'bamboo-tongue-scraper',
    description: 'Ayurvedic copper-tipped bamboo tongue scraper for optimal oral hygiene.',
    price: 8.99,
    originalPrice: 12.99,
    category: 'personal-care',
    material: 'Bamboo',
    images: ['https://images.unsplash.com/photo-1571942676516-bcab84649e44?w=800&q=80'],
    featured: false,
    newArrival: true,
    stock: 200,
    rating: 4.7,
    reviews: 89
  },
  // Home & Kitchen
  {
    id: uuidv4(),
    name: 'Teak Wood Chopping Board',
    slug: 'teak-chopping-board',
    description: 'Premium teak wood cutting board with juice groove. Naturally antimicrobial and knife-friendly.',
    price: 49.99,
    originalPrice: 69.99,
    category: 'home-kitchen',
    material: 'Teak',
    images: ['https://images.unsplash.com/photo-1594226801341-41427b4e5c22?w=800&q=80'],
    featured: true,
    newArrival: false,
    stock: 45,
    rating: 4.9,
    reviews: 178
  },
  {
    id: uuidv4(),
    name: 'Bamboo Cutting Board Set',
    slug: 'bamboo-cutting-board-set',
    description: 'Set of 3 bamboo cutting boards in varying sizes. Eco-friendly kitchen essentials.',
    price: 34.99,
    originalPrice: 44.99,
    category: 'home-kitchen',
    material: 'Bamboo',
    images: ['https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800&q=80'],
    featured: false,
    newArrival: true,
    stock: 60,
    rating: 4.7,
    reviews: 145
  },
  {
    id: uuidv4(),
    name: 'Bamboo Towel Set',
    slug: 'bamboo-towel-set',
    description: 'Ultra-soft bamboo fiber bath towels. Naturally hypoallergenic and absorbent.',
    price: 39.99,
    originalPrice: 54.99,
    category: 'home-kitchen',
    material: 'Bamboo',
    images: ['https://images.unsplash.com/photo-1583845112203-29329902332e?w=800&q=80'],
    featured: true,
    newArrival: false,
    stock: 75,
    rating: 4.8,
    reviews: 203
  },
  {
    id: uuidv4(),
    name: 'Bamboo Napkin Set',
    slug: 'bamboo-napkin-set',
    description: 'Set of 8 reusable bamboo fiber napkins. Machine washable and biodegradable.',
    price: 24.99,
    originalPrice: 32.99,
    category: 'home-kitchen',
    material: 'Bamboo',
    images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80'],
    featured: false,
    newArrival: false,
    stock: 120,
    rating: 4.5,
    reviews: 67
  },
  // Apparel
  {
    id: uuidv4(),
    name: 'Bamboo Fiber T-Shirt',
    slug: 'bamboo-tshirt',
    description: 'Breathable bamboo viscose t-shirt. Naturally temperature-regulating and odor-resistant.',
    price: 34.99,
    originalPrice: 44.99,
    category: 'apparel',
    material: 'Bamboo',
    images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80'],
    featured: true,
    newArrival: true,
    stock: 200,
    rating: 4.7,
    reviews: 289
  },
  {
    id: uuidv4(),
    name: 'Bamboo Sweatshirt',
    slug: 'bamboo-sweatshirt',
    description: 'Cozy bamboo fleece sweatshirt. Perfect for layering with a minimal footprint.',
    price: 59.99,
    originalPrice: 79.99,
    category: 'apparel',
    material: 'Bamboo',
    images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80'],
    featured: true,
    newArrival: false,
    stock: 85,
    rating: 4.8,
    reviews: 167
  },
  // Decor
  {
    id: uuidv4(),
    name: 'Walnut Wood Sculpture',
    slug: 'walnut-sculpture',
    description: 'Hand-carved walnut wood abstract sculpture. Each piece is unique and signed by the artisan.',
    price: 129.99,
    originalPrice: 169.99,
    category: 'decor',
    material: 'Walnut',
    images: ['https://images.unsplash.com/photo-1558997519-83ea9252edf8?w=800&q=80'],
    featured: true,
    newArrival: false,
    stock: 15,
    rating: 5.0,
    reviews: 42
  },
  {
    id: uuidv4(),
    name: 'Teak Wood Vase',
    slug: 'teak-vase',
    description: 'Minimalist teak wood vase. Perfect for dried flowers or as a standalone statement piece.',
    price: 44.99,
    originalPrice: 59.99,
    category: 'decor',
    material: 'Teak',
    images: ['https://images.unsplash.com/photo-1612620181650-85b9b48dbd75?w=800&q=80'],
    featured: false,
    newArrival: true,
    stock: 30,
    rating: 4.6,
    reviews: 78
  },
  // Travel EDC
  {
    id: uuidv4(),
    name: 'Bamboo Camping Chair',
    slug: 'bamboo-camping-chair',
    description: 'Lightweight portable bamboo camping chair. Sustainable adventures start here.',
    price: 79.99,
    originalPrice: 99.99,
    category: 'travel-edc',
    material: 'Bamboo',
    images: ['https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80'],
    featured: true,
    newArrival: true,
    stock: 40,
    rating: 4.7,
    reviews: 56
  },
  {
    id: uuidv4(),
    name: 'Stainless Steel Water Bottle',
    slug: 'steel-water-bottle',
    description: 'Double-walled insulated steel bottle with bamboo lid. Keeps drinks cold 24h or hot 12h.',
    price: 29.99,
    originalPrice: 39.99,
    category: 'travel-edc',
    material: 'Steel & Bamboo',
    images: ['https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80'],
    featured: true,
    newArrival: false,
    stock: 180,
    rating: 4.9,
    reviews: 423
  }
];

export const testimonials = [
  {
    id: uuidv4(),
    name: 'Sarah Mitchell',
    role: 'Sustainability Blogger',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
    content: 'The Gaea Store has completely transformed my daily routine. The bamboo products are not just eco-friendly, they\'re genuinely luxurious.',
    rating: 5
  },
  {
    id: uuidv4(),
    name: 'James Chen',
    role: 'Interior Designer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
    content: 'I recommend Gaea\'s wood decor to all my clients. The craftsmanship is exceptional and the sustainability story resonates deeply.',
    rating: 5
  },
  {
    id: uuidv4(),
    name: 'Emily Rodriguez',
    role: 'Eco-Travel Influencer',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80',
    content: 'Their travel EDC collection is perfect for my adventures. Quality, sustainability, and style - Gaea delivers on all fronts.',
    rating: 5
  },
  {
    id: uuidv4(),
    name: 'David Park',
    role: 'Hotel Manager',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80',
    content: 'We\'ve partnered with The Gaea Store for our hotel toiletries. Our guests love the premium sustainable amenities.',
    rating: 5
  }
];
