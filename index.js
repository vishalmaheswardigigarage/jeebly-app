// import { join } from "path";
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

// app.use(express.json());

// app.get("/api/orders/all", async (_req, res) => {
//   const orderData = await shopify.api.rest.Order.all({
//     session: res.locals.shopify.session,
//     status: "any"
//   });
//   res.status(200).send(orderData);
//   console.log("order-date")
// });



// app.use(shopify.cspHeaders());
// app.use(serveStatic(STATIC_PATH, { index: false }));

// app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
//   return res
//     .status(200)
//     .set("Content-Type", "text/html")
//     .send(readFileSync(join(STATIC_PATH, "index.html")));
// });

// app.listen(PORT);





// Web hook code

// @ts-check
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";
import path from "path";
import shopify from "./shopify.js";
import PrivacyWebhookHandlers from "./privacy.js";

// @ts-ignore
import dotenv from 'dotenv';
dotenv.config();

const PORT = parseInt(
  process.env.BACKEND_PORT || process.env.PORT || "3000",
  10
);

const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;

const app = express();

// Set up Shopify authentication and webhook handling
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  async (req, res) => {
    const session = res.locals.shopify.session;

    // Register the webhook for order creation
    await shopify.api.webhooks.register({
      path: "/api/webhooks/orders/create",
      topic: "ORDERS_CREATE",
      session,
    });

    shopify.redirectToShopifyOrAppRoot()(req, res);
  }
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
  console.log("order-data");
});

// Route to handle incoming "order/create" webhook requests
app.post(
  "/api/webhooks/orders/create",
  shopify.processWebhooks({
    webhookHandlers: {
      ORDERS_CREATE: {
        deliveryMethod: shopify.api.DeliveryMethod.Http,
        callbackUrl: '/api/webhooks/orders/create',
        callback: async (topic, shop, body, webhookId) => {
          const orderData = JSON.parse(body);
          console.log("New order created:", orderData);

          // Add your logic here to handle the order data
        },
      },
    },
  })
);

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
