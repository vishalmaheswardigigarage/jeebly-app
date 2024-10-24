import { LATEST_API_VERSION } from "@shopify/shopify-api";
import { shopifyApp } from "@shopify/shopify-app-express";
import { MemorySessionStorage } from "@shopify/shopify-app-session-storage-memory";
import { SQLiteSessionStorage } from "@shopify/shopify-app-session-storage-sqlite";  // Import SQLite session storage
import { restResources } from "@shopify/shopify-api/rest/admin/2024-07";
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';  // Import for ES module __dirname-like functionality
import fs from 'fs';


dotenv.config();  // Load environment variables


// Manually create __dirname for ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure the directory for SQLite database exists
const dbDirectory = path.join(__dirname, 'database');
if (!fs.existsSync(dbDirectory)) {
  fs.mkdirSync(dbDirectory);  // Create the directory if it doesn't exist
}

// Define the full path to the SQLite database file
const dbPath = path.join(dbDirectory, 'sessions.db');
const sessionDb = new SQLiteSessionStorage(dbPath);  // Use SQLite session storage

const shopify = shopifyApp({
  api: {
    apiVersion: LATEST_API_VERSION,
    apiKey: process.env.SHOPIFY_API_KEY,
    apiSecretKey: process.env.SHOPIFY_API_SECRET,
    scopes: process.env.SHOPIFY_SCOPES,
    hostName: process.env.SHOPIFY_HOST,
    restResources,
  },
  auth: {
    path: "/api/auth",
    callbackPath: "/api/auth/callback",
  },
  webhooks: {
    path: "/api/webhooks",
  },
  // sessionStorage: new MemorySessionStorage(),
  sessionStorage: sessionDb,  // Use SQLite for session storage
});

async function createWebhook(shop, accessToken) {
  const client = new shopify.Clients.Rest(shop, accessToken);

  try {
    const response = await client.post({
      path: 'webhooks',
      data: {
        webhook: {
          topic: 'orders/create',
          address: 'https://yourapp.com/webhooks/orders/create',
          format: 'json'
        }
      },
      type: shopify.Clients.Rest.DataType.JSON,
    });
    console.log('Webhook created:', response.body);
  } catch (error) {
    console.error('Failed to create webhook:', error);
  }
}

export default shopify;