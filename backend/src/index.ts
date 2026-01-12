import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const prisma = new PrismaClient();

// Simple Request Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  if (req.method === 'POST') console.log('Body:', JSON.stringify(req.body));
  next();
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Products
app.get('/api/products', async (req, res) => {
  try {
    const { category } = req.query;
    const products = await prisma.product.findMany({
      where: category ? { category: String(category) } : {},
      orderBy: { name: 'asc' }
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id }
    });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Auth
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token: 'mock-jwt-token'
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Orders
app.post('/api/orders', async (req, res) => {
  const { userId, items: itemsData, discountCode } = req.body;
  console.log('Starting order creation for user:', userId);

  try {
    // Fetch products to get real prices and calculate total
    const productIds = itemsData.map((item: any) => item.productId);
    console.log('Fetching products:', productIds);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } }
    });
    console.log('Found products:', products.length);

    let subtotal = 0;
    const orderItems = itemsData.map((item: any) => {
      const product = products.find(p => p.id === item.productId);
      if (!product) throw new Error(`Product ${item.productId} not found`);

      const itemPrice = product.price;
      subtotal += itemPrice * item.quantity;

      return {
        productId: item.productId,
        quantity: item.quantity,
        price: itemPrice
      };
    });
    console.log('Calculated subtotal:', subtotal);

    let total = subtotal;
    if (discountCode === 'FISKE20') {
      total = subtotal * 0.8;
      console.log('Applied discount FISKE20. New total:', total);
    }

    console.log('Creating order in database...');
    const order = await prisma.order.create({
      data: {
        userId,
        total: Math.round(total),
        items: {
          create: orderItems
        }
      },
      include: { items: true }
    });
    console.log('Order created successfully:', order.id);

    res.status(201).json(order);
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to create order' });
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: { product: true }
        },
        user: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 API listening on http://localhost:${PORT}`);
});
