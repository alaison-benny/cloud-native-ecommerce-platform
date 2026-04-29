require('dotenv').config();
const express = require('express');
const cors = require('cors');
const client = require('prom-client');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3005;

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
app.get('/health', (req, res) => res.json({ status: 'UP', service: 'payment-service' }));

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

app.post('/api/payments/process', (req, res) => {
  const { orderId, amount, paymentMethod } = req.body;
  
  if (!orderId || !amount) {
    return res.status(400).json({ error: 'orderId and amount are required' });
  }

  // Simulate payment processing delay
  setTimeout(() => {
    // 90% success rate simulation
    const isSuccess = Math.random() > 0.1;
    
    if (isSuccess) {
      res.json({
        status: 'SUCCESS',
        transactionId: `txn_${Date.now()}`,
        orderId,
        amount
      });
    } else {
      res.status(400).json({
        status: 'FAILED',
        error: 'Payment gateway declined the transaction',
        orderId
      });
    }
  }, 1000);
});

app.listen(PORT, () => {
  console.log(`Payment Service running on port ${PORT}`);
});
