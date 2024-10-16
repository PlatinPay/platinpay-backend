import { fetch } from "bun";

import { Database } from "bun:sqlite";

import express from "express";
import cors from "cors";
import type { Request, Response } from "express";
import crypto from "node:crypto";

import { v4 as uuidv4 } from "uuid";

const app = express();

// const { exec } = require("child_process");

const axios = require("axios").default;

app.use(express.json());
app.use(cors());

const db = new Database("platinpay.sqlite", { create: true });

// Nuke db

// db.run("DROP TABLE IF EXISTS settings;");
// db.run("DROP TABLE IF EXISTS stores;");
// db.run("DROP TABLE IF EXISTS products;");

// Enable foreign key constraints
db.run("PRAGMA foreign_keys = ON;");

db.run(`
CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT NOT NULL UNIQUE,
    value TEXT NOT NULL
);
`);

db.run(`
CREATE TABLE IF NOT EXISTS stores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    store_id TEXT NOT NULL UNIQUE,
    store_name TEXT NOT NULL UNIQUE,
    store_display_name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`);

db.run(`
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id TEXT NOT NULL UNIQUE,
    product_name TEXT NOT NULL UNIQUE,
    product_display_name TEXT NOT NULL,
    product_description TEXT NOT NULL,
    
    price REAL NOT NULL,
    stock INTEGER NOT NULL DEFAULT -1,
    
    action TEXT NOT NULL,
    
    image TEXT NOT NULL DEFAULT "product",
    
    offsale BOOLEAN NOT NULL DEFAULT TRUE,
    
    store_id TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (store_id) REFERENCES stores(store_id)
);
`);

function addDashesToUUID(uuid: string): string {
  if (uuid.length !== 32) {
    throw new Error("Invalid UUID length");
  }

  return `${uuid.slice(0, 8)}-${uuid.slice(8, 12)}-${uuid.slice(12, 16)}-${uuid.slice(16, 20)}-${uuid.slice(20)}`;
}

function importPrivateKey(base64PrivateKey) {
  const rawPrivateKey = Buffer.from(base64PrivateKey, "base64");
  const pkcs8PrivateKey = Buffer.concat([
    Buffer.from("302e020100300506032b657004220420", "hex"),
    rawPrivateKey,
  ]);

  return crypto.createPrivateKey({
    key: pkcs8PrivateKey,
    format: "der",
    type: "pkcs8",
  });
}

function importPublicKey(base64PublicKey) {
  const x509PublicKey = Buffer.from(base64PublicKey, "base64");

  return crypto.createPublicKey({
    key: x509PublicKey,
    format: "der",
    type: "spki",
  });
}

app.get("/store/by-id/:name", async (req, res) => {
  const { name: storeName } = req.params;

  try {
    const store: any = db
      .query("SELECT * FROM stores WHERE store_name = $storeName;")
      .get({
        $storeName: storeName,
      });

    if (!store) {
      res.status(404).json({ error: "Store not found." });
      return;
    }

    res.json(store);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while fetching the store." });

    throw error;
  }
});

app.get("/store/:id/details", async (req, res) => {
  const { id: storeId } = req.params;

  try {
    const store: any = db
      .query("SELECT * FROM stores WHERE store_id = $storeId;")
      .get({
        $storeId: storeId,
      });

    if (!store) {
      res.status(404).json({ error: "Store not found." });
      return;
    }

    res.json(store);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while fetching the store." });

    throw error;
  }
});

app.get("/store/:id/products", async (req, res) => {
  const { id: storeId } = req.params;

  try {
    const products = db
      .query("SELECT * FROM products WHERE store_id = $storeId;")
      .all({
        $storeId: storeId,
      });

    res.json(products);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while fetching the products." });

    throw error;
  }
});

app.post("/store/create", (req, res) => {
  const { storeName, storeDisplayName } = req.body;

  // const storeId = "test1234";

  const storeId = uuidv4();

  try {
    const id = db
      .query(
        "INSERT INTO stores (store_id, store_name, store_display_name) VALUES (?, ?, ?)",
      )
      .run(storeId, storeName, storeDisplayName).lastInsertRowid;

    res.json({ storeId });
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while creating the store." });

    throw error;
  }
});

app.post("/store/:id/product/create", (req, res) => {
  const { id: storeId } = req.params;
  const {
    productName,
    productDisplayName,
    productDescription,
    price,
    stock,
    action,
    image,
  } = req.body;

  try {
    const productId = uuidv4();

    const id = db
      .query(
        "INSERT INTO products (product_id, product_name, product_display_name, product_description, price, stock, action, image, store_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      )
      .run(
        productId,
        productName,
        productDisplayName,
        productDescription,
        price,
        stock,
        action,
        image,
        storeId,
      ).lastInsertRowid;

    res.json({ productId });
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while creating the product." });

    throw error;
  }
});

app.post("/store/:id/product/delete", (req, res) => {
  const { id: storeId } = req.params;
  const { productId } = req.body;

  try {
    const id = db
      .query("DELETE FROM products WHERE store_id = ? AND product_id = ?")
      .run(storeId, productId).lastInsertRowid;

    res.json({ productId });
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while deleting the product." });

    throw error;
  }
});

app.post("/user/checkout", async (req, res) => {
  const { ign, discordId, cart } = req.body;

  if (!ign) {
    res.status(400).json({ error: "Missing IGN." });
    return;
  }

  if (!discordId) {
    res.status(400).json({
      error: "Missing Discord ID.",
    });
    return;
  }

  const playeruuid = await axios
    .get(`https://api.mojang.com/users/profiles/minecraft/${ign}`)
    .then((response) => {
      return addDashesToUUID(response.data.id);
    })
    .catch((error) => {
      console.error(error);
      return;
    });

  if (!playeruuid) {
    res.status(404).json({ error: "Player not found." });
    return;
  }

  if (!cart || !Array.isArray(cart) || cart.length === 0) {
    res.status(400).json({ error: "Invalid cart format or empty cart." });
    return;
  }

  // Extract product IDs from the cart
  const productIds = cart.map((item) => item.product_id);

  try {
    // Fetch all product details in a single query using the IN clause
    const placeholders = productIds.map(() => "?").join(",");
    const query = `SELECT product_id, product_name, price, action, stock FROM products WHERE product_id IN (${placeholders})`;

    const products = db.query(query).all(...productIds); // Batch fetch

    // if (!products || products.length !== cart.length) {
    //   return res.status(404).json({ error: "One or more products not found." });
    // }

    // Merge cart with product details
    const checkoutActions = cart.map((cartItem) => {
      const product = products.find(
        (p) => p.product_id === cartItem.product_id,
      );

      if (!product) {
        return null; // Should never happen because we already checked
      }

      return product.action;
    });

    // console.log(checkoutActions);

    const url = "http://localhost:8081";

    const url_2 = "http://localhost:8082/dmuser";

    const data = {
      playeruuid,
      commands: [
        "say Hello, {playeruuid}!",
        // "stop",
        // "say Hi!",
        ...checkoutActions,
      ],
      timestamp: Date.now(),
    };

    const data_2 = {
      message: `Hello, ${ign}! Your order has been processed.\n\n${cart.map((item) => `${item.product_display_name} (${item.product_name}) - $${item.price}`).join("\n")}\n\nTotal: $${cart.reduce((acc, item) => acc + item.price, 0)}`,
      userID: discordId,
      timestamp: Date.now(),
    };

    const settings = db
      .query(
        "SELECT key, value FROM settings WHERE key IN ('public_key', 'private_key')",
      )
      .all();
    const settingsMap = Object.fromEntries(
      settings.map((setting) => [setting.key, setting.value]),
    );

    const base64PrivateKey = settingsMap["private_key"];
    const base64PublicKey = settingsMap["public_key"];

    const privateKey = importPrivateKey(base64PrivateKey);
    const publicKey = importPublicKey(base64PublicKey);

    const encodedData = JSON.stringify(data);
    const encodedData_2 = JSON.stringify(data_2);

    console.log(encodedData_2);

    const signature = crypto.sign(null, Buffer.from(encodedData), privateKey);
    const signature_2 = crypto.sign(
      null,
      Buffer.from(encodedData_2),
      privateKey,
    );

    const payload = {
      data,
      signature: signature.toString("base64"),
    };

    const payload_2 = {
      data: data_2,
      signature: signature_2.toString("base64"),
    };

    console.log(payload);
    console.log(payload_2);

    //
    // console.log(["say Hello, {playeruuid}!", ...checkoutActions]);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const response_2 = await fetch(url_2, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload_2),
      });

      console.log("Response status code:", response.status);
      console.log("Response status code 2:", response_2.status);
      const responseBody = await response.text();
      const responseBody_2 = await response_2.text();
      console.log("Response body:", responseBody);
      console.log("Response body 2:", responseBody_2);
    } catch (error) {
      console.error(`Error sending POST request: ${error}`);
    }

    res
      .status(200)
      .json({ message: "Checkout successful", cart: checkoutActions });
  } catch (error) {
    console.error("Error during checkout:", error);
    res.status(500).json({ error: "An error occurred while checking out." });
    throw error;
  }
});

app.post("/genkeypair", async (req, res) => {
  const { publicKey, privateKey } = await crypto.generateKeyPairSync("ed25519");

  const rawPrivateKey = privateKey
    .export({
      format: "der",
      type: "pkcs8",
    })
    .subarray(-32);

  const privateKeyBase64 = Buffer.from(rawPrivateKey).toString("base64");

  const x509PublicKey = publicKey.export({
    format: "der", // DER format
    type: "spki", // X.509 SubjectPublicKeyInfo
  });

  const publicKeyBase64 = Buffer.from(x509PublicKey).toString("base64");

  // console.log("\nPublic Key (Base64 X.509):");
  // console.log(publicKeyBase64);

  db.transaction(() => {
    db.query("INSERT INTO settings (key, value) VALUES (?, ?);").run(
      "public_key",
      publicKeyBase64,
    );

    db.query("INSERT INTO settings (key, value) VALUES (?, ?);").run(
      "private_key",
      privateKeyBase64,
    );
  })();

  res
    .status(200)
    .json({ privateKey: privateKeyBase64, publicKey: publicKeyBase64 });
});

// const url = "http://localhost:8081/";
//
// const data = {
//   playeruuid: "a061e888-bbe1-41cc-8630-f34f6c7b7762",
//   commands: [
//     "say Hello, {playeruuid}!",
//     "give {playeruuid} minecraft:dirt 1"
//   ]
// };
//
// try {
//   const response = await fetch(url, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json"
//     },
//     body: JSON.stringify(data)
//   });
//
//   console.log("Response status code:", response.status);
//   const responseBody = await response.text();
//   console.log("Response body:", responseBody);
// } catch (error) {
//   console.error(`Error sending POST request: ${error}`);
// }

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(3001, () => {
  console.log("Server is running on port 3001");
});
