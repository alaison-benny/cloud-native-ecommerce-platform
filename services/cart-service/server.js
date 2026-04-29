require('dotenv').config();
const express = require('express');
const cors = require('cors');
const client = require('prom-client');
// const redis = require('redis'); // Uncomment for real redis

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3003;

/* 
// Redis setup placeholder
const redisClient = redis.createClient({
  url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`
});
redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.connect().catch(console.error);
*/

// Prometheus Metrics Setup
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics();
const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status']
});

app.use((req, res, next) => {
  res.on('finish', () => {
    httpRequestsTotal.inc({ method: req.method, route: req.route ? req.route.path : req.path, status: res.statusCode });
  });
  next();
});

// Health check
app.get('/health', (req, res) => res.json({ status: 'UP', service: 'cart-service' }));

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

// In-memory mock for Redis
const carts = new Map();

app.get('/api/cart/:userId', async (req, res) => {
  const { userId } = req.params;
  const cart = carts.get(userId) || { items: [], total: 0 };
  res.json(cart);
});

app.post('/api/cart/:userId/add', async (req, res) => {
  const { userId } = req.params;
  const { productId, quantity, price } = req.body;
  
  const cart = carts.get(userId) || { items: [], total: 0 };
  
  const existingItem = cart.items.find(item => item.productId === productId);
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.items.push({ productId, quantity, price });
  }
  
  cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  carts.set(userId, cart);
  
  res.json(cart);
});

app.delete('/api/cart/:userId/remove/:productId', async (req, res) => {
  const { userId, productId } = req.params;
  const cart = carts.get(userId);
  
  if (cart) {
    cart.items = cart.items.filter(item => item.productId !== parseInt(productId));
    cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    carts.set(userId, cart);
  }
  
  res.json(cart || { items: [], total: 0 });
});

app.listen(PORT, () => {
  console.log(`Cart Service running on port ${PORT}`);
});
