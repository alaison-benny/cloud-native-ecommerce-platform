require('dotenv').config();
const express = require('express');
const cors = require('cors');
const client = require('prom-client');
const amqp = require('amqplib');
// const { Pool } = require('pg'); // Uncomment for real DB

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3004;

// RabbitMQ publisher setup
let channel = null;
async function connectRabbitMQ() {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
    channel = await connection.createChannel();
    await channel.assertQueue('order_created');
    console.log('Connected to RabbitMQ');
  } catch (error) {
    console.error('RabbitMQ connection failed, will retry...', error.message);
    setTimeout(connectRabbitMQ, 5000);
  }
}
connectRabbitMQ();

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
app.get('/health', (req, res) => res.json({ status: 'UP', service: 'order-service' }));

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

// Mock Database
const orders = [];

app.post('/api/orders', (req, res) => {
  const { userId, items, total } = req.body;
  if (!userId || !items || items.length === 0) {
    return res.status(400).json({ error: 'Invalid order data' });
  }

  const order = {
    id: orders.length + 1,
    userId,
    items,
    total,
    status: 'CREATED',
    createdAt: new Date()
  };
  
  orders.push(order);

  // Publish event to RabbitMQ
  if (channel) {
    channel.sendToQueue('order_created', Buffer.from(JSON.stringify(order)));
    console.log(`Published order_created event for order ${order.id}`);
  }

  res.status(201).json(order);
});

app.get('/api/orders/:userId', (req, res) => {
  const userOrders = orders.filter(o => o.userId === parseInt(req.params.userId));
  res.json(userOrders);
});

app.listen(PORT, () => {
  console.log(`Order Service running on port ${PORT}`);
});
