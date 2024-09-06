import crypto from 'crypto';
import express from "express";
import serveStatic from "serve-static";
import shopify from "./shopify.js";
import PrivacyWebhookHandlers from "./privacy.js";
import { join } from "path";
import { readFileSync } from "fs";
import dotenv from 'dotenv';

dotenv.config();

const PORT = parseInt(
  process.env.BACKEND_PORT || process.env.PORT || "3001",
  10
);

const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/dist/`
    : `${process.cwd()}/dist/`;

const app = express();

// Middleware to capture raw body for HMAC verification
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf.toString(); // Capture the raw body as a string
  }
}));

// Function to verify the Shopify webhook HMAC
function verifyShopifyWebhook(req) {
  const hmac = req.headers['x-shopify-hmac-sha256'];
  if (!hmac) return false;  // Return false if HMAC is missing

  const body = req.rawBody;
  const generatedHash = crypto
    .createHmac('sha256', process.env.SHOPIFY_API_SECRET)
    .update(body, 'utf8')
    .digest('base64');

  return generatedHash === hmac;
}

// Webhook endpoint
let payload = null;

app.post('/api/webhooks/ordercreate', async (req, res) => {
  if (!verifyShopifyWebhook(req)) {
    return res.status(401).json({ success: false, message: 'Unauthorized' }); // Return 401 if the HMAC validation fails
  }

  try {
    payload = req.body;
    // Process the payload asynchronously
    setImmediate(() => processWebhookData(payload));
    console.log("Webhook received:", payload); // Log headers and payload

    res.status(200).json({ success: true, message: 'Webhook received' });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
});

// Function to process webhook data
function processWebhookData(payload) {
  console.log("Processing webhook data:", payload);
  // Add logic to process the webhook payload
}

// Endpoint to get the latest webhook data
app.get('/api/webhooks/latest', (_req, res) => {
  if (payload) {
    return res.status(200).json({ success: true, data: payload });
  } else {
    return res.status(204).json({ success: false, message: 'No webhook data available' });
  }
});

// Set up Shopify authentication and webhook handling
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot()
);
app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers: PrivacyWebhookHandlers })
);
app.use("/api/*", shopify.validateAuthenticatedSession());

app.get("/api/orders/all", async (_req, res) => {
  try {
    const orderData = await shopify.api.rest.Order.all({
      session: res.locals.shopify.session,
      status: "any"
    });
    res.status(200).json({ success: true, data: orderData });
    console.log("order-data");
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
});

app.use(shopify.cspHeaders());
app.use(serveStatic(STATIC_PATH, { index: false }));

app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(readFileSync(join(STATIC_PATH, "index.html")));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
