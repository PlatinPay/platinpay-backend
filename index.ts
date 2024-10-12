import { fetch } from "bun";

import { Database } from "bun:sqlite";

import express from "express";
import type { Request, Response } from "express";

import { v4 as uuidv4 } from "uuid";

const app = express();

app.use(express.json());

const db = new Database("platinpay.sqlite", { create: true });

// Nuke db

// db.run("DROP TABLE IF EXISTS stores;");
// db.run("DROP TABLE IF EXISTS products;");

// Enable foreign key constraints
db.run("PRAGMA foreign_keys = ON;");

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
    
    offsale BOOLEAN NOT NULL DEFAULT TRUE,
    
    store_id TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (store_id) REFERENCES stores(store_id)
);
`);

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
  const { productName, productDisplayName, productDescription, price, stock, action } =
    req.body;

  try {
    const productId = uuidv4();

    const id = db
      .query(
        "INSERT INTO products (product_id, product_name, product_display_name, product_description, price, stock, action, store_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      )
      .run(
        productId,
        productName,
        productDisplayName,
        productDescription,
        price,
        stock,
        action,
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
