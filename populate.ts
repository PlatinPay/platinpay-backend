import { fetch } from "bun";
import app from "./index";

const PORT = 3001;
const BASE_URL = `http://localhost:${PORT}`;

const startServer = () => {
  return new Promise<void>((resolve) => {
    app.listen(PORT, () => {
      console.log(`Server started in test mode on port ${PORT}`);
      resolve();
    });
  });
};

const populateDatabase = async () => {
  await startServer();

  const store = await fetch(`${BASE_URL}/store/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      storeName: "main",
      storeDisplayName: "Main Store",
    }),
  }).then((res) => res.json());

  const storeId = store.storeId;

  await fetch(`${BASE_URL}/store/${storeId}/product/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      productName: "diamond",
      productDisplayName: "Diamond",
      productDescription: "test",
      price: 5.0,
      stock: 10,
      action: "give {playeruuid} minecraft:diamond",
      image: "diamond",
    }),
  });

  await fetch(`${BASE_URL}/store/${storeId}/product/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      productName: "emerald",
      productDisplayName: "Emerald",
      productDescription: "test",
      price: 5.0,
      stock: 20,
      action: "give {playeruuid} minecraft:emerald",
      image: "emerald",
    }),
  });

  await fetch(`${BASE_URL}/store/${storeId}/product/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      productName: "x16-bread",
      productDisplayName: "x16 Bread",
      productDescription: "test",
      price: 1.0,
      stock: 20,
      action: "give {playeruuid} minecraft:bread 16",
      image: "bread",
    }),
  });

  await fetch(`${BASE_URL}/store/${storeId}/product/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      productName: "x16-apple",
      productDisplayName: "x16 Apple",
      productDescription: "test",
      price: 1.0,
      stock: 20,
      action: "give {playeruuid} minecraft:apple 16",
      image: "apple",
    }),
  });

  await fetch(`${BASE_URL}/store/${storeId}/product/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      productName: "gap",
      productDisplayName: "Golden Apple",
      productDescription: "test",
      price: 8.0,
      stock: 10,
      action: "give {playeruuid} minecraft:golden_apple",
      image: "golden-apple",
    }),
  });

  await fetch(`${BASE_URL}/store/${storeId}/product/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      productName: "egap",
      productDisplayName: "Enchanted Golden Apple",
      productDescription: "test",
      price: 16.0,
      stock: 3,
      action: "give {playeruuid} minecraft:enchanted_golden_apple",
      image: "enchanted-golden-apple.gif",
    }),
  });

  await fetch(`${BASE_URL}/store/${storeId}/product/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      productName: "nether-star",
      productDisplayName: "Nether Star",
      productDescription: "test",
      price: 10.0,
      stock: 10,
      action: "give {playeruuid} minecraft:nether_star",
      image: "nether-star.gif",
    }),
  });

  console.log("Database populated successfully.");

  // 	Exit
  process.exit(0);
};

populateDatabase().catch((error) => {
  console.error("Error populating database:", error);
});
