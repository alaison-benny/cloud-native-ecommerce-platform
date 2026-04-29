require('dotenv').config();
const express = require('express');
const cors = require('cors');
const client = require('prom-client');
const amqp = require('amqplib');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3006;

// RabbitMQ consumer setup
async function connectRabbitMQ() {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
    const channel = await connection.createChannel();
    await channel.assertQueue('order_created');
    
    console.log('Connected to RabbitMQ, waiting for messages...');
    
    channel.consume('order_created', (msg) => {
      if (msg !== null) {
        const order = JSON.parse(msg.content.toString());
        console.log(`[Notification Service] Received order_created event:`, order);
        // Mock email sending
        console.log(`[Notification Service] Sending order confirmation email to user ${order.userId} for order ${order.id}...`);
        
        channel.ack(msg);
      }
    });
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
app.get('/health', (req, res) => res.json({ status: 'UP', service: 'notification-service' }));

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

app.listen(PORT, () => {
  console.log(`Notification Service running on port ${PORT}`);
});
