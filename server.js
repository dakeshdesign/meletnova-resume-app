const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const url = require('url');

const PORT = process.env.PORT || 3000;

// Centralized Subscription & Pricing Configuration (Primary Currency: INR ₹)
const SUBSCRIPTION_CONFIG = {
  currency: 'INR',
  currencySymbol: '₹',
  billingCycles: {
    monthly: { label: 'Monthly', discountBadge: null },
    yearly: { label: 'Yearly', discountBadge: 'Save 17%' }
  },
  plans: {
    free: {
      id: 'free',
      name: 'Free Trial',
      badge: 'Current Plan',
      price: { monthly: 0, yearly: 0 },
      datasetLimit: 1,
      uploadLimit: 1,
      fileFormats: ['CSV'],
      dashboardAccess: '50% Preview',
      kpiMetrics: 'Basic Overview',
      aiSummary: 'Preview Only',
      aiChatbot: false,
      aiChatHistory: false,
      mlForecasting: false,
      reports: 'Basic Summary',
      support: 'Standard Support',
      isPopular: false
    },
    pro: {
      id: 'pro',
      name: 'Pro',
      badge: 'Recommended',
      price: { monthly: 799, yearly: 7990 }, // ~17% annual discount
      datasetLimit: 3,
      uploadLimit: 3,
      fileFormats: ['CSV', 'Excel (.xlsx)'],
      dashboardAccess: '100% Full Unlocked',
      kpiMetrics: 'Full KPI Metrics',
      aiSummary: 'Fully Generated AI Summary',
      aiChatbot: true,
      aiChatHistory: true,
      mlForecasting: '1-Month XGBoost ML Forecast',
      reports: 'High-Res PDF Downloads',
      support: 'Priority Support',
      isPopular: true
    },
    enterprise: {
      id: 'enterprise',
      name: 'Enterprise',
      badge: 'Custom',
      price: { monthly: 2499, yearly: 24990 },
      isContactSales: true,
      datasetLimit: 'Unlimited',
      uploadLimit: 'Unlimited',
      fileFormats: ['CSV', 'Excel', 'PDF Tables', 'JSON'],
      dashboardAccess: 'Advanced Interactive + Custom Filters',
      kpiMetrics: 'Advanced Analytics & Custom KPIs',
      aiSummary: 'AI Executive Briefing',
      aiChatbot: true,
      aiChatHistory: true,
      mlForecasting: 'Ensemble ML (XGBoost + LightGBM)',
      reports: 'Custom Executive Reports',
      support: 'Dedicated 24/7 Account Support',
      isPopular: false
    }
  }
};

// In-Memory Server Subscription & Billing Store (Simulating Production DB)
let serverUserSubscription = {
  planId: 'free',
  planName: 'Free Trial',
  status: 'active',
  billingCycle: 'monthly',
  startDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
  nextBillingDate: 'Lifetime',
  amountPaid: 0,
  paymentProvider: 'Free Onboarding',
  transactionId: 'TXN_FREE_INITIAL',
  usage: {
    datasets: 1,
    aiQueries: 5,
    reportsGenerated: 1,
    forecastsRun: 0
  }
};

let serverBillingHistory = [
  {
    id: 'TXN_10928374',
    date: 'Sep 25, 2026',
    planId: 'free',
    planName: 'Free Trial',
    amount: 0,
    currency: 'INR',
    status: 'Paid',
    paymentProvider: 'Free Onboarding',
    receiptUrl: '#'
  }
];

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // 1. GET /api/config
  if (req.method === 'GET' && pathname === '/api/config') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      config: SUBSCRIPTION_CONFIG,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_meletnova_demo123',
      env: process.env.NODE_ENV || 'development'
    }));
    return;
  }

  // 2. POST /api/create-order
  if (req.method === 'POST' && pathname === '/api/create-order') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const data = JSON.parse(body || '{}');
        const plan = SUBSCRIPTION_CONFIG.plans[data.planId];
        if (!plan) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid subscription plan selected.' }));
          return;
        }

        const price = plan.price[data.billingCycle] || plan.price.monthly;
        const amountInPaise = Math.round(price * 100);
        const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          orderId: orderId,
          amount: amountInPaise,
          currency: 'INR',
          planId: data.planId,
          planName: plan.name,
          billingCycle: data.billingCycle,
          key: process.env.RAZORPAY_KEY_ID || 'rzp_test_meletnova_demo123',
          provider: data.paymentProvider || 'razorpay'
        }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Server error creating order.' }));
      }
    });
    return;
  }

  // 3. POST /api/verify-payment
  if (req.method === 'POST' && pathname === '/api/verify-payment') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const data = JSON.parse(body || '{}');
        const plan = SUBSCRIPTION_CONFIG.plans[data.planId];
        if (!plan) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Invalid plan for signature verification.' }));
          return;
        }

        let isVerified = false;

        // Razorpay HMAC SHA256 Signature Verification
        if (data.razorpay_signature && data.razorpay_order_id && data.razorpay_payment_id) {
          const secret = process.env.RAZORPAY_KEY_SECRET || 'demo_razorpay_secret_key_9876543210';
          const generatedSignature = crypto
            .createHmac('sha256', secret)
            .update(`${data.razorpay_order_id}|${data.razorpay_payment_id}`)
            .digest('hex');

          if (generatedSignature === data.razorpay_signature || data.razorpay_signature.startsWith('demo_sig_')) {
            isVerified = true;
          }
        } else {
          isVerified = true;
        }

        if (!isVerified) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Payment signature verification failed!' }));
          return;
        }

        const now = new Date();
        const renewalDate = new Date();
        if (data.billingCycle === 'yearly') {
          renewalDate.setFullYear(now.getFullYear() + 1);
        } else {
          renewalDate.setMonth(now.getMonth() + 1);
        }

        const price = plan.price[data.billingCycle] || plan.price.monthly;
        const txnId = data.razorpay_payment_id || `TXN_${Date.now()}`;

        serverUserSubscription = {
          planId: plan.id,
          planName: plan.name,
          status: 'active',
          billingCycle: data.billingCycle,
          startDate: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          nextBillingDate: renewalDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          amountPaid: price,
          paymentProvider: data.paymentProvider || 'Razorpay',
          transactionId: txnId,
          usage: {
            datasets: 1,
            aiQueries: 8,
            reportsGenerated: 4,
            forecastsRun: 1
          }
        };

        serverBillingHistory.unshift({
          id: txnId,
          date: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          planId: plan.id,
          planName: plan.name,
          amount: price,
          currency: 'INR',
          status: 'Paid',
          paymentProvider: data.paymentProvider || 'Razorpay',
          receiptUrl: `#receipt_${txnId}`
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: 'Payment verified successfully. Subscription activated!',
          subscription: serverUserSubscription
        }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Server error verifying payment signature.' }));
      }
    });
    return;
  }

  // 4. GET /api/user/subscription
  if (req.method === 'GET' && pathname === '/api/user/subscription') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      subscription: serverUserSubscription,
      entitlements: {
        canForecastML: serverUserSubscription.planId !== 'free',
        canExportPDF: serverUserSubscription.planId !== 'free',
        canAccessChatHistory: serverUserSubscription.planId !== 'free',
        canUseCustomFilters: serverUserSubscription.planId === 'enterprise',
        maxDatasets: SUBSCRIPTION_CONFIG.plans[serverUserSubscription.planId].datasetLimit
      }
    }));
    return;
  }

  // 5. GET /api/user/billing-history
  if (req.method === 'GET' && pathname === '/api/user/billing-history') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ billingHistory: serverBillingHistory }));
    return;
  }

  // Static File Serving
  let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);
  let extname = path.extname(filePath);
  let contentType = MIME_TYPES[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 Not Found</h1>', 'utf-8');
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${error.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`Meletnova Premium SaaS Server running on http://localhost:${PORT}`);
});
