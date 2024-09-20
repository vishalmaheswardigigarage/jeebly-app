// import crypto from 'crypto';
// import express from "express";
// import serveStatic from "serve-static";
// import shopify from "./shopify.js";
// import PrivacyWebhookHandlers from "./privacy.js";
// import { join } from "path";
// import { readFileSync } from "fs";
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
//     req.rawBody = buf.toString(); // Capture the raw body as a string
//   }
// }));

// // Function to verify the Shopify webhook HMAC
// function verifyShopifyWebhook(req) {
//   const hmac = req.headers['x-shopify-hmac-sha256'];
//   if (!hmac) return false;  // Return false if HMAC is missing

//   const body = req.rawBody;
//   const generatedHash = crypto
//     .createHmac('sha256', process.env.SHOPIFY_API_SECRET)
//     .update(body, 'utf8')
//     .digest('base64');

//   return generatedHash === hmac;
// }

// // Webhook endpoint
// let payload = null;

// app.post('/api/webhooks/ordercreate', async (req, res) => {
//   if (!verifyShopifyWebhook(req)) {
//     return res.status(401).json({ success: false, message: 'Unauthorized' }); // Return 401 if the HMAC validation fails
//   }

//   try {
//     payload = req.body;
//     // Process the payload asynchronously
//     setImmediate(() => processWebhookData(payload));
//     console.log("Webhook received:", payload); // Log headers and payload
//   console.log("hii webhook");
//     res.status(200).json({ success: true, message: 'Webhook received' });
//   } catch (error) {
//     console.error('Error processing webhook:', error);
//     res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
//   }
// });

// // Function to process webhook data
// function processWebhookData(payload) {
//   console.log("Processing webhook data:", payload);
//   // Add logic to process the webhook payload
// }

// // Endpoint to get the latest webhook data
// app.get('/api/webhooks/latest', (_req, res) => {
//   if (payload) {
//     return res.status(200).json({ success: true, data: payload });
//   } else {
//     return res.status(204).json({ success: false, message: 'No webhook data available' });
//   }
// });

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
// app.use("/api/*", shopify.validateAuthenticatedSession());

// app.get("/api/orders/all", async (_req, res) => {
//   try {
//     const orderData = await shopify.api.rest.Order.all({
//       session: res.locals.shopify.session,
//       status: "any"
//     });
//     res.status(200).json({ success: true, data: orderData });
//     console.log("order-data");
//   } catch (error) {
//     console.error('Error fetching orders:', error);
//     res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
//   }
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




// // test Code

// import crypto from 'crypto';
// import express from "express";
// import serveStatic from "serve-static";
// import shopify from "./shopify.js";
// import PrivacyWebhookHandlers from "./privacy.js";
// import { join } from "path";
// import { readFileSync } from "fs";

// // Additional imports for fetch
// import fetch from 'node-fetch';

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
//     req.rawBody = buf.toString(); // Capture the raw body as a string
//   }
// }));

// // Function to verify the Shopify webhook HMAC
// function verifyShopifyWebhook(req) {
//   const hmac = req.headers['x-shopify-hmac-sha256'];
//   if (!hmac) return false;  // Return false if HMAC is missing

//   const body = req.rawBody;
//   const generatedHash = crypto
//     .createHmac('sha256', process.env.SHOPIFY_API_SECRET)
//     .update(body, 'utf8')
//     .digest('base64');

//   return generatedHash === hmac;
// }

// // Webhook endpoint
// let payload = null;

// app.post('/api/webhooks/ordercreate', async (req, res) => {
//   if (!verifyShopifyWebhook(req)) {
//     return res.status(401).json({ success: false, message: 'Unauthorized' }); // Return 401 if the HMAC validation fails
//   }

//   try {
//     payload = req.body;

//     // Process the payload asynchronously and send it to the bookshipment API
//     setImmediate(() => processWebhookData(payload));
//     console.log("Webhook received:", payload);

//     res.status(200).json({ success: true, message: 'Webhook received' });
//   } catch (error) {
//     console.error('Error processing webhook:', error);
//     res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
//   }
// });

// // Function to process webhook data and call createShipment
// async function processWebhookData(payload) {
//   console.log("Processing webhook data:", payload);

//   // Fetch the default address from the get_address API
//   const defaultAddress = await fetchDefaultAddress();

//   if (!defaultAddress) {
//     console.error("No default address found. Shipment creation aborted.");
//     return;
//   }

//   // Example of extracting data from the webhook payload
//   const description = payload?.line_items?.[0]?.title || "Default description";
//   const weight = payload?.line_items?.[0]?.grams || 1; // Default weight
//   const codAmount = payload?.total_price || 0;
//   const pieces = payload?.line_items?.length || 1;
//   const dropoffName = payload?.shipping_address?.name || "Unknown";
//   const dropoffPhone = payload?.shipping_address?.phone || "Unknown";
//   const selectedArea = payload?.shipping_address?.address1 || "Unknown Area";
//   const selectedCity = payload?.shipping_address?.city || "Unknown City";
  
//   const paymentType = payload?.financial_status === "paid" ? "Prepaid" : "COD";

//   // Call the createShipment function with the extracted data
//   await createShipment({
//     description,
//     weight,
//     codAmount,
//     pieces,
//     dropoffName,
//     dropoffPhone,
//     selectedArea,
//     selectedCity,
//     paymentType,
   
//   });
// }

// // Function to call the bookshipment API
// async function createShipment({
//   description,
//   weight,
//   codAmount,
//   pieces,
//   dropoffName,
//   dropoffPhone,
//   selectedArea,
//   selectedCity,
//   paymentType,
//   defaultAddress
// }) {
//   const url = "https://demo.jeebly.com/app/create_shipment?client_key=fa618e51da171e489db355986c6dfc7c";
//   const body = JSON.stringify({
//     client_key: "fa618e51da171e489db355986c6dfc7c",
//     delivery_type: "Next Day",
//     load_type: "Non-document",
//     consignment_type: "FORWARD",
//     description: description,
//     weight: weight,
//     payment_type: paymentType,
//     cod_amount: codAmount,
//     num_pieces: pieces,
//     customer_reference_number: "1034",
//     origin_address_name:"shekhar",
//     origin_address_mob_no_country_code: "971",
//     origin_address_mobile_number: "+236332521411",
//     origin_address_alt_ph_country_code: "2522",
//     origin_address_alternate_phone: "3631422252141",
//     origin_address_house_no: "50",
//     origin_address_building_name: "test building",
//     origin_address_area: "test area",
//     origin_address_landmark: "name",
//     origin_address_city: "Dubai",
//     origin_address_type: "Normal",
//     destination_address_name: dropoffName,
//     destination_address_mob_no_country_code: "971",
//     destination_address_mobile_number: dropoffPhone,
//     destination_details_alt_ph_country_code: "+11",
//     destination_details_alternate_phone: "569996547444",
//     destination_address_house_no: "43",
//     destination_address_building_name: "building_name",
//     destination_address_area: selectedArea,
//     destination_address_landmark: "landmark",
//     destination_address_city: selectedCity,
//     destination_address_type: "Normal",
//     pickup_date: "2024-09-10"
//   });

//   try {
//     const response = await fetch(url, {
//       method: "POST",
//       headers: { 'Content-Type': 'application/json' },
//       body: body
//     });

//     if (response.ok) {
//       const responseBody = await response.json();
//       console.log("Shipment created successfully:", responseBody);
//     } else {
//       const responseBody = await response.json();
//       console.error("Failed to create shipment:", responseBody);
//     }
//   } catch (error) {
//     console.error("Network error:", error);
//   }
// }

// // Function to fetch the default address
// async function fetchDefaultAddress() {
//   const url = "https://demo.jeebly.com/app/get_address?client_key=fa618e51da171e489db355986c6dfc7c";
  
//   try {
//     const response = await fetch(url, { method: "GET" });
//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     const data = await response.json();
//     if (data && data.success === "true" && Array.isArray(data.address)) {
//       const defaultAddr = data.address.find(addr => addr.default_address === "1");
//       if (defaultAddr) {
//         console.log("Default address found:", defaultAddr);
//         return defaultAddr;
//       } else {
//         console.log("No default address found");
//       }
//     } else {
//       console.error("Unexpected data format:", data);
//     }
//   } catch (error) {
//     console.error("Error fetching default address:", error);
//   }
//   return null;
// }

// // Endpoint to get the latest webhook data
// app.get('/api/webhooks/latest', (_req, res) => {
//   if (payload) {
//     return res.status(200).json({ success: true, data: payload });
//   } else {
//     return res.status(204).json({ success: false, message: 'No webhook data available' });
//   }
// });

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
// app.use("/api/*", shopify.validateAuthenticatedSession());

// app.get("/api/orders/all", async (_req, res) => {
//   try {
//     const orderData = await shopify.api.rest.Order.all({
//       session: res.locals.shopify.session,
//       status: "any"
//     });
//     res.status(200).json({ success: true, data: orderData });
//     console.log("order-data");
//   } catch (error) {
//     console.error('Error fetching orders:', error);
//     res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
//   }
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



// Test code 2

// import crypto from 'crypto';
// import express from "express";
// import serveStatic from "serve-static";
// import shopify from "./shopify.js";
// import PrivacyWebhookHandlers from "./privacy.js";
// import { join } from "path";
// import { readFileSync } from "fs";
// import fetch from 'node-fetch';

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
//     req.rawBody = buf.toString(); // Capture the raw body as a string
//   }
// }));

// // Function to verify the Shopify webhook HMAC
// function verifyShopifyWebhook(req) {
//   const hmac = req.headers['x-shopify-hmac-sha256'];
//   if (!hmac) {
//     console.warn("Missing HMAC in webhook headers.");
//     return false;  // Return false if HMAC is missing
//   }

//   const body = req.rawBody;
//   const generatedHash = crypto
//     .createHmac('sha256', process.env.SHOPIFY_API_SECRET)
//     .update(body, 'utf8')
//     .digest('base64');

//   const isValid = generatedHash === hmac;
//   if (!isValid) {
//     console.warn("Invalid HMAC. HMAC verification failed.");
//   }

//   return isValid;
// }

// // Webhook endpoint
// let payload = null;

// app.post('/api/webhooks/ordercreate', async (req, res) => {
//   console.log("Received a webhook event at /api/webhooks/ordercreate");

//   if (!verifyShopifyWebhook(req)) {
//     console.warn("Unauthorized webhook attempt detected.");
//     return res.status(401).json({ success: false, message: 'Unauthorized' }); // Return 401 if the HMAC validation fails
//   }

//   try {
//     payload = req.body;
//     console.log("Webhook payload successfully verified and received.");
//    console.log("payload data",payload?.shipping_address?.name)
//    console.log("payload data",payload?.order_number)
//     // Process the payload asynchronously and send it to the bookshipment API
//     await processWebhookData(payload);
//     console.log("Initiated asynchronous processing of the webhook payload.");

//     res.status(200).json({ success: true, message: 'Webhook received' });
//   } catch (error) {
//     console.error('Error processing webhook:', error);
//     res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
//   }
// });
// // Pickupe date 
// function getNextDayDate() {
//   const today = new Date();
  
//   // Add one day to the current date
//   const nextDay = new Date(today);
//   nextDay.setDate(today.getDate() + 1);

//   // Format the date as "YYYY-MM-DD"
//   const year = nextDay.getFullYear();
//   const month = String(nextDay.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed, so we add 1
//   const day = String(nextDay.getDate()).padStart(2, '0');

//   return `${year}-${month}-${day}`;
// }
// // Function to process webhook data and call createShipment
// async function processWebhookData(payload) {
//   console.log("Processing webhook data:", JSON.stringify(payload, null, 2));

//   // Fetch the default address from the get_address API
//   const defaultAddress = await fetchDefaultAddress();

//   if (!defaultAddress) {
//     console.error("No default address found. Shipment creation aborted.");
//     return;
//   }

//   // Extract data from the webhook payload
//   const description = payload?.line_items?.[0]?.title || "Default description";
//   const weight = payload?.line_items?.[0]?.grams || 1; // Default weight
//   const codAmount = parseFloat(payload?.total_price) || 0;
//   const pieces = payload?.line_items?.length || 1;
//   const dropoffName = payload?.shipping_address?.name || "Unknown";
//   const dropoffPhone = payload?.shipping_address?.phone || "Unknown";
//   const selectedArea = payload?.shipping_address?.address1 || "Unknown Area";
//   const selectedCity = payload?.shipping_address?.city || "Unknown City";
//   const orderNumber = payload?.order_number || "#001";
//   const paymentType = payload?.financial_status === "paid" ? "Prepaid" : "COD";
//   const pickupDate = getNextDayDate();

//   console.log("Extracted Data for Shipment:", {
//     description,
//     weight,
//     codAmount,
//     pieces,
//     dropoffName,
//     dropoffPhone,
//     selectedArea,
//     selectedCity,
//     paymentType,
//     pickupDate,
//     defaultAddress,
//     orderNumber
//   });

//   // Call the createShipment function with the extracted data
//   await createShipment({
//     description,
//     weight,
//     codAmount,
//     pieces,
//     dropoffName,
//     dropoffPhone,
//     selectedArea,
//     selectedCity,
//     pickupDate,
//     paymentType,
//     defaultAddress,
//     orderNumber
//   });
// }

// // Function to call the bookshipment API
// async function createShipment({
//   description,
//   weight,
//   codAmount,
//   pieces,
//   dropoffName,
//   dropoffPhone,
//   selectedArea,
//   selectedCity,
//   paymentType,
//   defaultAddress,
//   orderNumber,
//   pickupDate
// }) {
//   const url = "https://demo.jeebly.com/app/create_shipment_webhook?client_key=fa618e51da171e489db355986c6dfc7c";
//   // const url = "https://demo.jeebly.com/app/create_shipment?client_key=fa618e51da171e489db355986c6dfc7c";
//   const body = JSON.stringify({
//     client_key: "fa618e51da171e489db355986c6dfc7c",
//     delivery_type: "Next Day",
//     load_type: "Non-document",
//     consignment_type: "FORWARD",
//     description: description,
//     weight: weight,
//     payment_type: paymentType,
//     cod_amount:"0",
//     num_pieces: pieces,
//     customer_reference_number: orderNumber || "#001",
//     origin_address_name: defaultAddress.addr_area,
//     origin_address_mob_no_country_code: "971",
//     origin_address_mobile_number: defaultAddress.addr_mobile_number,
//     origin_address_alt_ph_country_code: "2522",
//     origin_address_alternate_phone: "3631422252141",
//     origin_address_house_no: defaultAddress.addr_house_no,
//     origin_address_building_name: defaultAddress.addr_building_name,
//     origin_address_area: defaultAddress.addr_area,
//     origin_address_landmark: defaultAddress.addr_landmark,
//     origin_address_city: "Dubai",
//     origin_address_type: "Normal",
//     destination_address_name: dropoffName,
//     destination_address_mob_no_country_code: "971",
//     destination_address_mobile_number: dropoffPhone|| "569996547444",
//     destination_details_alt_ph_country_code: "11",
//     destination_details_alternate_phone: dropoffPhone|| "569996547444",
//     destination_address_house_no: "43",
//     destination_address_building_name: "building_name",
//     destination_address_area: selectedArea,
//     destination_address_landmark: "landmark",
//     destination_address_city: selectedCity,
//     destination_address_type: "Normal",
//     pickup_date: pickupDate||"2024-09-12"
//   });

//   console.log("Creating shipment with the following payload:");

//   try {
//     const response = await fetch(url, {
//       method: "POST",
//       headers: { 'Content-Type': 'application/json' },
//       body: body
//     });

//     console.log(`Shipment API Response Status: ${response.status}`);

//     const responseBody = await response.json();
//     console.log("Shipment API Response Body:", responseBody);

//     if (response.ok) {
//       console.log("Shipment created successfully:", responseBody);
//     } else {
//       console.error("Failed to create shipment:", responseBody);
//     }
//   } catch (error) {
//     console.error("Network error while creating shipment:", error);
//   }
// }

// // Function to fetch the default address
// async function fetchDefaultAddress() {
//   const url = "https://demo.jeebly.com/app/get_address?client_key=fa618e51da171e489db355986c6dfc7c";

//   console.log("Fetching default address from:", url);

//   try {
//     const response = await fetch(url, { method: "GET" });
//     console.log(`Default Address API Response Status: ${response.status}`);

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     const data = await response.json();
//     console.log("Default Address API Response Body:", data);

//     if (data && data.success === "true" && Array.isArray(data.address)) {
//       const defaultAddr = data.address.find(addr => addr.default_address === "1");
//       if (defaultAddr) {
//         console.log("Default address found:", defaultAddr);
//         return defaultAddr;
//       } else {
//         console.log("No default address found in the response.");
//       }
//     } else {
//       console.error("Unexpected data format in default address response:", data);
//     }
//   } catch (error) {
//     console.error("Error fetching default address:", error);
//   }
//   return null;
// }

// // Endpoint to get the latest webhook data
// app.get('/api/webhooks/latest', (_req, res) => {
//   if (payload) {
//     return res.status(200).json({ success: true, data: payload });
//   } else {
//     return res.status(204).json({ success: false, message: 'No webhook data available' });
//   }
// });

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
// app.use("/api/*", shopify.validateAuthenticatedSession());

// app.get("/api/orders/all", async (_req, res) => {
//   try {
//     const orderData = await shopify.api.rest.Order.all({
//       session: res.locals.shopify.session,
//       status: "any"
//     });
//     res.status(200).json({ success: true, data: orderData });
//     console.log("order-data retrieved successfully.");
//   } catch (error) {
//     console.error('Error fetching orders:', error);
//     res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
//   }
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





// Test code 2 AWB update vala testing code

import crypto from 'crypto';
import express from "express";
import serveStatic from "serve-static";
import shopify from "./shopify.js";
import PrivacyWebhookHandlers from "./privacy.js";
import { join } from "path";
import { readFileSync } from "fs";
import fetch from 'node-fetch';

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
  if (!hmac) {
    console.warn("Missing HMAC in webhook headers.");
    return false;  // Return false if HMAC is missing
  }

  const body = req.rawBody;
  const generatedHash = crypto
    .createHmac('sha256', process.env.SHOPIFY_API_SECRET)
    .update(body, 'utf8')
    .digest('base64');

  const isValid = generatedHash === hmac;
  if (!isValid) {
    console.warn("Invalid HMAC. HMAC verification failed.");
  }

  return isValid;
}

// Webhook endpoint
let payload = null;

app.post('/api/webhooks/ordercreate', async (req, res) => {
  console.log("Received a webhook event at /api/webhooks/ordercreate");

  if (!verifyShopifyWebhook(req)) {
    console.warn("Unauthorized webhook attempt detected.");
    return res.status(401).json({ success: false, message: 'Unauthorized' }); // Return 401 if the HMAC validation fails
  }

  try {
    payload = req.body;
    console.log("Webhook payload successfully verified and received.");
   console.log("payload data",payload?.shipping_address?.name)
   console.log("payload data",payload?.order_number)
    // Process the payload asynchronously and send it to the bookshipment API
    await processWebhookData(payload);
    console.log("Initiated asynchronous processing of the webhook payload.");

    res.status(200).json({ success: true, message: 'Webhook received' });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
});
// Pickupe date 
function getNextDayDate() {
  const today = new Date();
  
  // Add one day to the current date
  const nextDay = new Date(today);
  nextDay.setDate(today.getDate() + 1);

  // Format the date as "YYYY-MM-DD"
  const year = nextDay.getFullYear();
  const month = String(nextDay.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed, so we add 1
  const day = String(nextDay.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}
// Function to process webhook data and call createShipment
async function processWebhookData(payload) {
  console.log("Processing webhook data:", JSON.stringify(payload, null, 2));

  // Fetch the default address from the get_address API
  const defaultAddress = await fetchDefaultAddress();

  if (!defaultAddress) {
    console.error("No default address found. Shipment creation aborted.");
    return;
  }

  // Extract data from the webhook payload
  const description = payload?.line_items?.[0]?.title || "Default description";
  const weight = payload?.line_items?.[0]?.grams || 1; // Default weight
  const codAmount = parseFloat(payload?.total_price) || 0;
  const pieces = payload?.line_items?.length || 1;
  const dropoffName = payload?.shipping_address?.name || "Unknown";
  const dropoffPhone = payload?.shipping_address?.phone || "Unknown";
  const selectedArea = payload?.shipping_address?.address1 || "Unknown Area";
  const selectedCity = payload?.shipping_address?.city || "Unknown City";
  const orderNumber = payload?.order_number || "#001";
  const paymentType = payload?.financial_status === "paid" ? "Prepaid" : "COD";
  const pickupDate = getNextDayDate();

  console.log("Extracted Data for Shipment:", {
    description,
    weight,
    codAmount,
    pieces,
    dropoffName,
    dropoffPhone,
    selectedArea,
    selectedCity,
    paymentType,
    pickupDate,
    defaultAddress,
    orderNumber
  });

  // Call the createShipment function with the extracted data
  await createShipment({
    description,
    weight,
    codAmount,
    pieces,
    dropoffName,
    dropoffPhone,
    selectedArea,
    selectedCity,
    pickupDate,
    paymentType,
    defaultAddress,
    orderNumber
  });
}

// Function to call the bookshipment API
async function createShipment({
  description,
  weight,
  codAmount,
  pieces,
  dropoffName,
  dropoffPhone,
  selectedArea,
  selectedCity,
  paymentType,
  defaultAddress,
  orderNumber,
  pickupDate
}) {
  // const url = "https://demo.jeebly.com/app/create_shipment_webhook?client_key=fa618e51da171e489db355986c6dfc7c";
  const url = "https://demo.jeebly.com/app/create_shipment?client_key=fa618e51da171e489db355986c6dfc7c";
  const body = JSON.stringify({
    client_key: "fa618e51da171e489db355986c6dfc7c",
    delivery_type: "Next Day",
    load_type: "Non-document",
    consignment_type: "FORWARD",
    description: description,
    weight: weight,
    payment_type: paymentType,
    cod_amount:"0",
    num_pieces: pieces,
    customer_reference_number: orderNumber || "#001",
    origin_address_name: defaultAddress.addr_area,
    origin_address_mob_no_country_code: "971",
    origin_address_mobile_number: defaultAddress.addr_mobile_number,
    origin_address_alt_ph_country_code: "2522",
    origin_address_alternate_phone: "3631422252141",
    origin_address_house_no: defaultAddress.addr_house_no,
    origin_address_building_name: defaultAddress.addr_building_name,
    origin_address_area: defaultAddress.addr_area,
    origin_address_landmark: defaultAddress.addr_landmark,
    origin_address_city: "Dubai",
    origin_address_type: "Normal",
    destination_address_name: dropoffName,
    destination_address_mob_no_country_code: "971",
    destination_address_mobile_number: dropoffPhone|| "569996547444",
    destination_details_alt_ph_country_code: "11",
    destination_details_alternate_phone: dropoffPhone|| "569996547444",
    destination_address_house_no: "43",
    destination_address_building_name: "building_name",
    destination_address_area: selectedArea,
    destination_address_landmark: "landmark",
    destination_address_city: selectedCity,
    destination_address_type: "Normal",
    pickup_date: pickupDate||"2024-09-12"
  });

  console.log("Creating shipment with the following payload:");

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: body
    });

    console.log(`Shipment API Response Status: ${response.status}`);

    const responseBody = await response.json();
    console.log("Shipment API Response Body:", responseBody);

    if (response.ok) {
      console.log("Shipment created successfully:", responseBody);
      const awbNumber = responseBody?.awbNumber; // Assuming the AWB number is in the response body
      if (awbNumber) {
        updateOrderNoteWithAWB(session, orderNumber, awbNumber);
      } else {
        console.error("AWB number is missing in the shipment response.");
      }
    } else {
      console.error("Failed to create shipment:", responseBody);
    }
  } catch (error) {
    console.error("Network error while creating shipment:", error);
  }
}

async function updateOrderNoteWithAWB(orderNumber,awbNumber) {
  try {
    const session = res.locals.shopify.session;
    const order = new shopify.rest.Order({ session });
    order.id = orderNumber;
    order.note = `AWB Number: ${awbNumber}`;
    await order.save({
      update: true,
    });

    console.log(`Order ${orderNumber} updated with AWB: ${"236663666"}`);
  } catch (error) {
    console.error(`Error updating order ${orderNumber}:`, error);
  }
}

// Function to fetch the default address
async function fetchDefaultAddress() {
  const url = "https://demo.jeebly.com/app/get_address?client_key=fa618e51da171e489db355986c6dfc7c";

  console.log("Fetching default address from:", url);

  try {
    const response = await fetch(url, { method: "GET" });
    console.log(`Default Address API Response Status: ${response.status}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Default Address API Response Body:", data);

    if (data && data.success === "true" && Array.isArray(data.address)) {
      const defaultAddr = data.address.find(addr => addr.default_address === "1");
      if (defaultAddr) {
        console.log("Default address found:", defaultAddr);
        return defaultAddr;
      } else {
        console.log("No default address found in the response.");
      }
    } else {
      console.error("Unexpected data format in default address response:", data);
    }
  } catch (error) {
    console.error("Error fetching default address:", error);
  }
  return null;
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
    console.log("order-data retrieved successfully.");
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