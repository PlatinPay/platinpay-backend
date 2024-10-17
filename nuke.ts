import { Database } from "bun:sqlite";

const args = process.argv.slice(2);
const db = new Database("platinpay.sqlite", { create: true });

if (args.includes("main")) {
  db.run("DROP TABLE IF EXISTS stores;");
  db.run("DROP TABLE IF EXISTS products;");
  console.log("Main tables dropped successfully.");
} else if (args.includes("settings")) {
  db.run("DROP TABLE IF EXISTS settings;");
  console.log("Settings table dropped successfully.");
} else {
  console.log("No valid arguments provided. Use 'all' or 'settings'.");
}
