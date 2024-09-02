import { join } from "path";
import crypto from 'crypto';
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";
import path from "path";
import shopify from "./shopify.js";
import PrivacyWebhookHandlers from "./privacy.js";

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


// If you are adding routes outside of the /api path, remember to
// also add a proxy rule for them in web/frontend/vite.config.js

app.use("/api/*", shopify.validateAuthenticatedSession());

app.use(express.json());

app.get("/api/orders/all", async (_req, res) => {
  const orderData = await shopify.api.rest.Order.all({
    session: res.locals.shopify.session,
    status: "any"
  });
  res.status(200).send(orderData);
  console.log("order-date")
});




app.post('/webhooks/orders/create', (req, res) => {
  if (!verifyWebhook(req)) {
    return res.status(401).send('Unauthorized');
  }

  const order = req.body;
  console.log('Order created:', order);
  res.status(200).send('Webhook received');
});

function verifyWebhook(req) {
  const hmac = req.headers['x-shopify-hmac-sha256'];
  const generatedHmac = crypto
    .createHmac('sha256', process.env.SHOPIFY_API_SECRET)
    .update(req.rawBody, 'utf8', 'hex')
    .digest('base64');

  return hmac === generatedHmac;
}

app.use(shopify.cspHeaders());
app.use(serveStatic(STATIC_PATH, { index: false }));

app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(readFileSync(join(STATIC_PATH, "index.html")));
});

app.listen(PORT);





