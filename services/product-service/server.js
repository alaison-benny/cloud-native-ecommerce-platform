require('dotenv').config();
const express = require('express');
const cors = require('cors');
const client = require('prom-client');
// const { Pool } = require('pg'); // Uncomment for real DB

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3002;

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
app.get('/health', (req, res) => res.json({ status: 'UP', service: 'product-service' }));

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

// Mock Database
const products = [
  { id: 1, name: 'Cloud Native T-Shirt', price: 25.00, stock: 100 },
  { id: 2, name: 'Kubernetes Mug', price: 15.00, stock: 50 },
  { id: 3, name: 'DevOps Sticker Pack', price: 5.00, stock: 200 }
];

app.get('/api/products', (req, res) => {
  res.json(products);
});

app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

app.listen(PORT, () => {
  console.log(`Product Service running on port ${PORT}`);
});
