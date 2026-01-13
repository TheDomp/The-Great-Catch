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

app.patch('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  const { name, price, stock, category } = req.body;
  try {
    const updated = await prisma.product.update({
      where: { id },
      data: { name, price, stock, category }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product' });
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

// Register
app.post('/api/auth/register', async (req, res) => {
  const { email, password, name } = req.body;
  try {
    // 1. Check if email already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    // 2. Check user limit (max 10 users with role 'USER', excluding admins)
    const userCount = await prisma.user.count({ where: { role: 'USER' } });
    if (userCount >= 10) {
      return res.status(403).json({ error: 'Maximum user limit reached (10 users). Please contact admin.' });
    }

    // 3. Create user
    const newUser = await prisma.user.create({
      data: {
        email,
        password: password || 'temppass', // Basic safety, though UI enforces validation
        name: name || 'Valued Angler',
        role: 'USER'
      }
    });

    // 4. Simulate sending email
    console.log(`📧 [MOCK EMAIL SENT] To: ${email} - Welcome to The Great Catch, ${name}!`);

    res.status(201).json({
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role
      },
      token: 'mock-jwt-token'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Delete account
app.delete('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const userToDelete = await prisma.user.findUnique({ where: { id } });
    if (!userToDelete) return res.status(404).json({ error: 'User not found' });

    // Safety: Don't delete the last admin
    if (userToDelete.role === 'ADMIN') {
      const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
      if (adminCount <= 1) {
        return res.status(403).json({ error: 'Cannot delete the last administrator account.' });
      }
    }

    await prisma.user.delete({
      where: { id }
    });
    console.log(`🗑️ User deleted: ${id}`);
    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

// List all users (for admin)
app.get('/api/users', async (_req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    const customerCount = users.filter(u => u.role === 'USER').length;
    res.json({ users, customerCount, maxCustomers: 10 });
  } catch (error) {
    console.error('List users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.patch('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  const { name, role } = req.body;
  try {
    const updated = await prisma.user.update({
      where: { id },
      data: { name, role: role as any }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Orders
app.post('/api/orders', async (req, res) => {
  const { userId, items: itemsData, discountCode } = req.body;
  console.log('Starting order creation for user:', userId);

  try {
    // Verify user exists
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: 'Vessel commander not found (User not recognized)' });
    }

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

// Seed default users (admin and test customer)
async function seedUsers() {
  const defaultUsers = [
    { email: 'admin@test.se', password: 'Password123!', name: 'Fleet Admiral', role: 'ADMIN' as const },
    { email: 'customer@test.se', password: 'Password123!', name: 'Test Captain', role: 'USER' as const }
  ];

  for (const userData of defaultUsers) {
    const exists = await prisma.user.findUnique({ where: { email: userData.email } });
    if (!exists) {
      await prisma.user.create({ data: userData });
      console.log(`🌱 Seeded user: ${userData.email} (${userData.role})`);
    }
  }
}

const PORT = process.env.PORT || 4000;

// Start server with seeding
seedUsers()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 API listening on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to seed users:', err);
    process.exit(1);
  });
