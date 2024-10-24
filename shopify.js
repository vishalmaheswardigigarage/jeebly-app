import { LATEST_API_VERSION } from "@shopify/shopify-api";
import { shopifyApp } from "@shopify/shopify-app-express";
import { MemorySessionStorage } from "@shopify/shopify-app-session-storage-memory";
import { SQLiteSessionStorage } from "@shopify/shopify-app-session-storage-sqlite";  // Import SQLite session storage
import { restResources } from "@shopify/shopify-api/rest/admin/2024-07";
import dotenv from 'dotenv';
dotenv.config();  // Load environment variables
const sessionDb = new SQLiteSessionStorage('sessions.db');  // SQLite database file
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