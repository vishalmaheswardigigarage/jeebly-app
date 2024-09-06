import { join } from "path";
import crypto from 'crypto';
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";
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

// Middleware to capture raw body for HMAC verification
app.use(express.json({
    verify: (req, res, buf) => {
        req.rawBody = buf.toString(); // Capture the raw body as a string
    }
}));

let payload = null;
// Function to verify the Shopify webhook HMAC
function verifyShopifyWebhook(req) {
    const hmac = req.headers['x-shopify-hmac-sha256'];
    const body = req.rawBody;

    const generatedHash = crypto
        .createHmac('sha256', process.env.SHOPIFY_API_SECRET)
        .update(body, 'utf8')
        .digest('base64');

    return generatedHash === hmac;
}

// Webhook endpoint

app.post('/api/webhooks/ordercreate', async (req, res) => {
  
    if (!verifyShopifyWebhook(req)) {
        return res.status(401).send('Unauthorized'); // Return 401 if the HMAC validation fails
       
    }

    try {
        payload = req.body;
        // Process the payload...
         console.log(process.env.SHOPIFY_API_SECRET);
        res.status(200).send('Webhook received',payload);
       console.log("Webhook received:", req.headers, req.body); // Log headers and payload
     
    } catch (error) {
        console.error('Error processing webhook:', error);
    }
});

// Endpoint to get the latest webhook data
app.get('/api/webhooks/latest', (_req, res) => {
    if (payload) {
        return res.status(200).json(payload);
    } else {
        return res.status(204).send('No webhook data available');
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
  const orderData = await shopify.api.rest.Order.all({
    session: res.locals.shopify.session,
    status: "any"
  });
  res.status(200).send(orderData);
  console.log("order-date")
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



// import { join } from "path";
// import crypto from 'crypto';
// import { readFileSync } from "fs";
// import express from "express";
// import serveStatic from "serve-static";
// import path from "path";
// import shopify from "./shopify.js";
// import PrivacyWebhookHandlers from "./privacy.js";

// import dotenv from 'dotenv';
// dotenv.config();

// const PORT = parseInt(
//   process.env.BACKEND_PORT || process.env.PORT || "3001",
//   10
// );

// const STATIC_PATH =
//   process.env.NODE_ENV === "production"
//     ? `${process.cwd()}/dist/`
//     : `${process.cwd()}/dist/`;

// const app = express();

// // Middleware to capture raw body for HMAC verification
// app.use(express.json({
//   verify: (req, res, buf) => {
//     req.rawBody = buf.toString();
//   }
// }));

// // Set up Shopify authentication and webhook handling
// app.get(shopify.config.auth.path, shopify.auth.begin());
// app.get(
//   shopify.config.auth.callbackPath,
//   shopify.auth.callback(),
//   shopify.redirectToShopifyOrAppRoot()
// );
// app.post(
//   shopify.config.webhooks.path,
//   shopify.processWebhooks({ webhookHandlers: PrivacyWebhookHandlers })
// );

// // If you are adding routes outside of the /api path, remember to
// // also add a proxy rule for them in web/frontend/vite.config.js

// app.use("/api/*", shopify.validateAuthenticatedSession());

// app.get("/api/orders/all", async (_req, res) => {
//   try {
//     const orderData = await shopify.api.rest.Order.all({
//       session: res.locals.shopify.session,
//       status: "any"
//     });
//     res.status(200).send(orderData);
//     console.log("order-data", orderData);
//   } catch (error) {
//     console.error("Error fetching orders:", error);
//     res.status(500).send("Internal Server Error");
//   }
// });

// app.post('/webhooks/orders/create', (req, res) => {
//   const hmac = req.headers['x-shopify-hmac-sha256'];
//   const generatedHmac = crypto
//     .createHmac('sha256', process.env.SHOPIFY_API_SECRET)
//     .update(req.rawBody)
//     .digest('base64');

//   if (hmac !== generatedHmac) {
//     return res.status(401).send('Unauthorized');
//   }

//   const order = req.body;
//   console.log('Order created:', order);
//   res.status(200).send('Webhook received');
// });

// app.use(shopify.cspHeaders());
// app.use(serveStatic(STATIC_PATH, { index: false }));

// app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
//   return res
//     .status(200)
//     .set("Content-Type", "text/html")
//     .send(readFileSync(join(STATIC_PATH, "index.html")));
// });

// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });
