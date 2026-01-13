import { NextResponse } from 'next/server';
import { connectToDatabase, getCollection } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { products as seedProducts, categories as seedCategories, testimonials as seedTestimonials } from '@/lib/seed';

const JWT_SECRET = process.env.JWT_SECRET || 'gaea-store-secret-key-2024';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Helper to parse path
function parsePath(request) {
  const url = new URL(request.url);
  const pathParts = url.pathname.replace('/api/', '').split('/').filter(Boolean);
  return { pathParts, searchParams: url.searchParams };
}

// JWT verification
function verifyToken(request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.split(' ')[1];
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Initialize database with seed data
async function initializeDatabase() {
  const productsCollection = await getCollection('products');
  const categoriesCollection = await getCollection('categories');
  const testimonialsCollection = await getCollection('testimonials');

  const productCount = await productsCollection.countDocuments();
  if (productCount === 0) {
    await productsCollection.insertMany(seedProducts.map(p => ({ ...p, createdAt: new Date() })));
  }

  const categoryCount = await categoriesCollection.countDocuments();
  if (categoryCount === 0) {
    await categoriesCollection.insertMany(seedCategories.map(c => ({ ...c, createdAt: new Date() })));
  }

  const testimonialCount = await testimonialsCollection.countDocuments();
  if (testimonialCount === 0) {
    await testimonialsCollection.insertMany(seedTestimonials.map(t => ({ ...t, createdAt: new Date() })));
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(request) {
  try {
    await initializeDatabase();
    const { pathParts, searchParams } = parsePath(request);

    // Health check
    if (pathParts[0] === 'health') {
      return NextResponse.json({ status: 'healthy', timestamp: new Date().toISOString() }, { headers: corsHeaders });
    }

    // Get all products
    if (pathParts[0] === 'products' && !pathParts[1]) {
      const collection = await getCollection('products');
      const category = searchParams.get('category');
      const featured = searchParams.get('featured');
      const newArrival = searchParams.get('newArrival');
      const search = searchParams.get('search');

      let query = {};
      if (category) query.category = category;
      if (featured === 'true') query.featured = true;
      if (newArrival === 'true') query.newArrival = true;
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }

      const products = await collection.find(query).toArray();
      return NextResponse.json(products, { headers: corsHeaders });
    }

    // Get single product
    if (pathParts[0] === 'products' && pathParts[1]) {
      const collection = await getCollection('products');
      const product = await collection.findOne({ $or: [{ id: pathParts[1] }, { slug: pathParts[1] }] });
      if (!product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404, headers: corsHeaders });
      }
      return NextResponse.json(product, { headers: corsHeaders });
    }

    // Get all categories
    if (pathParts[0] === 'categories') {
      const collection = await getCollection('categories');
      const categories = await collection.find({}).toArray();
      return NextResponse.json(categories, { headers: corsHeaders });
    }

    // Get testimonials
    if (pathParts[0] === 'testimonials') {
      const collection = await getCollection('testimonials');
      const testimonials = await collection.find({}).toArray();
      return NextResponse.json(testimonials, { headers: corsHeaders });
    }

    // Get user profile
    if (pathParts[0] === 'auth' && pathParts[1] === 'me') {
      const user = verifyToken(request);
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
      }
      const collection = await getCollection('users');
      const userData = await collection.findOne({ id: user.id });
      if (!userData) {
        return NextResponse.json({ error: 'User not found' }, { status: 404, headers: corsHeaders });
      }
      const { password, ...safeUser } = userData;
      return NextResponse.json(safeUser, { headers: corsHeaders });
    }

    // Get cart
    if (pathParts[0] === 'cart') {
      const user = verifyToken(request);
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
      }
      const collection = await getCollection('carts');
      let cart = await collection.findOne({ userId: user.id });
      if (!cart) {
        cart = { userId: user.id, items: [], createdAt: new Date() };
        await collection.insertOne(cart);
      }
      return NextResponse.json(cart, { headers: corsHeaders });
    }

    // Admin: Get all users
    if (pathParts[0] === 'admin' && pathParts[1] === 'users') {
      const user = verifyToken(request);
      if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
      }
      const collection = await getCollection('users');
      const users = await collection.find({}).project({ password: 0 }).toArray();
      return NextResponse.json(users, { headers: corsHeaders });
    }

    // Admin: Get B2B leads
    if (pathParts[0] === 'admin' && pathParts[1] === 'leads') {
      const user = verifyToken(request);
      if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
      }
      const collection = await getCollection('leads');
      const leads = await collection.find({}).sort({ createdAt: -1 }).toArray();
      return NextResponse.json(leads, { headers: corsHeaders });
    }

    return NextResponse.json({ error: 'Not found' }, { status: 404, headers: corsHeaders });
  } catch (error) {
    console.error('GET Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}

export async function POST(request) {
  try {
    await initializeDatabase();
    const { pathParts } = parsePath(request);
    const body = await request.json();

    // User registration
    if (pathParts[0] === 'auth' && pathParts[1] === 'register') {
      const { email, password, name } = body;
      if (!email || !password || !name) {
        return NextResponse.json({ error: 'All fields required' }, { status: 400, headers: corsHeaders });
      }

      const collection = await getCollection('users');
      const existingUser = await collection.findOne({ email });
      if (existingUser) {
        return NextResponse.json({ error: 'Email already registered' }, { status: 400, headers: corsHeaders });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = {
        id: uuidv4(),
        email,
        password: hashedPassword,
        name,
        role: 'customer',
        createdAt: new Date()
      };

      await collection.insertOne(newUser);
      const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });
      const { password: _, ...safeUser } = newUser;
      return NextResponse.json({ user: safeUser, token }, { headers: corsHeaders });
    }

    // User login
    if (pathParts[0] === 'auth' && pathParts[1] === 'login') {
      const { email, password } = body;
      if (!email || !password) {
        return NextResponse.json({ error: 'Email and password required' }, { status: 400, headers: corsHeaders });
      }

      const collection = await getCollection('users');
      const user = await collection.findOne({ email });
      if (!user) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401, headers: corsHeaders });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401, headers: corsHeaders });
      }

      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
      const { password: _, ...safeUser } = user;
      return NextResponse.json({ user: safeUser, token }, { headers: corsHeaders });
    }

    // Add to cart
    if (pathParts[0] === 'cart' && pathParts[1] === 'add') {
      const user = verifyToken(request);
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
      }

      const { productId, quantity = 1 } = body;
      const productsCollection = await getCollection('products');
      const product = await productsCollection.findOne({ id: productId });
      if (!product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404, headers: corsHeaders });
      }

      const cartsCollection = await getCollection('carts');
      let cart = await cartsCollection.findOne({ userId: user.id });
      
      if (!cart) {
        cart = { userId: user.id, items: [], createdAt: new Date() };
        await cartsCollection.insertOne(cart);
      }

      const existingItemIndex = cart.items.findIndex(item => item.productId === productId);
      if (existingItemIndex >= 0) {
        cart.items[existingItemIndex].quantity += quantity;
      } else {
        cart.items.push({
          productId,
          name: product.name,
          price: product.price,
          image: product.images[0],
          quantity
        });
      }

      await cartsCollection.updateOne({ userId: user.id }, { $set: { items: cart.items, updatedAt: new Date() } });
      return NextResponse.json(cart, { headers: corsHeaders });
    }

    // Update cart item
    if (pathParts[0] === 'cart' && pathParts[1] === 'update') {
      const user = verifyToken(request);
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
      }

      const { productId, quantity } = body;
      const cartsCollection = await getCollection('carts');
      const cart = await cartsCollection.findOne({ userId: user.id });

      if (!cart) {
        return NextResponse.json({ error: 'Cart not found' }, { status: 404, headers: corsHeaders });
      }

      if (quantity <= 0) {
        cart.items = cart.items.filter(item => item.productId !== productId);
      } else {
        const itemIndex = cart.items.findIndex(item => item.productId === productId);
        if (itemIndex >= 0) {
          cart.items[itemIndex].quantity = quantity;
        }
      }

      await cartsCollection.updateOne({ userId: user.id }, { $set: { items: cart.items, updatedAt: new Date() } });
      return NextResponse.json(cart, { headers: corsHeaders });
    }

    // B2B Lead submission
    if (pathParts[0] === 'leads') {
      const { companyName, contactName, email, phone, type, message, country } = body;
      if (!companyName || !email || !type) {
        return NextResponse.json({ error: 'Required fields missing' }, { status: 400, headers: corsHeaders });
      }

      const collection = await getCollection('leads');
      const lead = {
        id: uuidv4(),
        companyName,
        contactName,
        email,
        phone,
        type,
        message,
        country,
        status: 'new',
        createdAt: new Date()
      };

      await collection.insertOne(lead);
      return NextResponse.json({ success: true, message: 'Thank you! We will contact you soon.' }, { headers: corsHeaders });
    }

    // Newsletter subscription
    if (pathParts[0] === 'newsletter') {
      const { email } = body;
      if (!email) {
        return NextResponse.json({ error: 'Email required' }, { status: 400, headers: corsHeaders });
      }

      const collection = await getCollection('newsletter');
      const existing = await collection.findOne({ email });
      if (existing) {
        return NextResponse.json({ message: 'Already subscribed!' }, { headers: corsHeaders });
      }

      await collection.insertOne({ id: uuidv4(), email, subscribedAt: new Date() });
      return NextResponse.json({ success: true, message: 'Welcome to the Gaea family!' }, { headers: corsHeaders });
    }

    // Admin: Create product
    if (pathParts[0] === 'admin' && pathParts[1] === 'products') {
      const user = verifyToken(request);
      if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
      }

      const collection = await getCollection('products');
      const newProduct = {
        id: uuidv4(),
        ...body,
        createdAt: new Date()
      };

      await collection.insertOne(newProduct);
      return NextResponse.json(newProduct, { headers: corsHeaders });
    }

    // Admin: Create admin user
    if (pathParts[0] === 'admin' && pathParts[1] === 'setup') {
      const collection = await getCollection('users');
      const adminExists = await collection.findOne({ role: 'admin' });
      
      if (adminExists) {
        return NextResponse.json({ error: 'Admin already exists' }, { status: 400, headers: corsHeaders });
      }

      const { email, password, name } = body;
      const hashedPassword = await bcrypt.hash(password, 10);
      const admin = {
        id: uuidv4(),
        email,
        password: hashedPassword,
        name,
        role: 'admin',
        createdAt: new Date()
      };

      await collection.insertOne(admin);
      const token = jwt.sign({ id: admin.id, email: admin.email, role: admin.role }, JWT_SECRET, { expiresIn: '7d' });
      return NextResponse.json({ message: 'Admin created', token }, { headers: corsHeaders });
    }

    return NextResponse.json({ error: 'Not found' }, { status: 404, headers: corsHeaders });
  } catch (error) {
    console.error('POST Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}

export async function PUT(request) {
  try {
    const { pathParts } = parsePath(request);
    const body = await request.json();

    // Admin: Update product
    if (pathParts[0] === 'admin' && pathParts[1] === 'products' && pathParts[2]) {
      const user = verifyToken(request);
      if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
      }

      const collection = await getCollection('products');
      const { _id, ...updateData } = body;
      const result = await collection.updateOne(
        { id: pathParts[2] },
        { $set: { ...updateData, updatedAt: new Date() } }
      );

      if (result.matchedCount === 0) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404, headers: corsHeaders });
      }

      const updated = await collection.findOne({ id: pathParts[2] });
      return NextResponse.json(updated, { headers: corsHeaders });
    }

    // Admin: Update lead status
    if (pathParts[0] === 'admin' && pathParts[1] === 'leads' && pathParts[2]) {
      const user = verifyToken(request);
      if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
      }

      const collection = await getCollection('leads');
      await collection.updateOne(
        { id: pathParts[2] },
        { $set: { status: body.status, updatedAt: new Date() } }
      );

      return NextResponse.json({ success: true }, { headers: corsHeaders });
    }

    return NextResponse.json({ error: 'Not found' }, { status: 404, headers: corsHeaders });
  } catch (error) {
    console.error('PUT Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}

export async function DELETE(request) {
  try {
    const { pathParts } = parsePath(request);

    // Admin: Delete product
    if (pathParts[0] === 'admin' && pathParts[1] === 'products' && pathParts[2]) {
      const user = verifyToken(request);
      if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
      }

      const collection = await getCollection('products');
      const result = await collection.deleteOne({ id: pathParts[2] });

      if (result.deletedCount === 0) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404, headers: corsHeaders });
      }

      return NextResponse.json({ success: true }, { headers: corsHeaders });
    }

    // Clear cart
    if (pathParts[0] === 'cart' && pathParts[1] === 'clear') {
      const user = verifyToken(request);
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
      }

      const collection = await getCollection('carts');
      await collection.updateOne(
        { userId: user.id },
        { $set: { items: [], updatedAt: new Date() } }
      );

      return NextResponse.json({ success: true }, { headers: corsHeaders });
    }

    return NextResponse.json({ error: 'Not found' }, { status: 404, headers: corsHeaders });
  } catch (error) {
    console.error('DELETE Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}
