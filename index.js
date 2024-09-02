import { join } from "path";
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

// Register the webhook during app initialization

app.get("/api/webhook-status", async (_req, res) => {
async function registerWebhook() {
  try {
    const session = res.locals.shopify.session;

    const webhook = new shopify.rest.Webhook({ session });
    webhook.address = "https://shopify-production-app.vercel.app/api/webhooks/data";
    webhook.topic = "orders/create";
    webhook.format = "json";
    await webhook.save({
      update: true,
    });

    console.log("Webhook triggered successfully");
  } catch (error) {
    console.error("Failed to register webhook:", error);
  }
}
registerWebhook();
});

// Call the webhook registration function


app.use(shopify.cspHeaders());
app.use(serveStatic(STATIC_PATH, { index: false }));

app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(readFileSync(join(STATIC_PATH, "index.html")));
});

app.listen(PORT);





