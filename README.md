# PlatinPay-Backend

[Find the main README here! (It has a showcase video and deployment links so you can try PlatinPay yourself!)](https://github.com/PlatinPay)

This is the Backend of the PlatinPay project.

## Features
- Endpoints for various actions
  - GET /store/by-id/`[store_name]`
  - GET /store/`[store_id]`/details
  - GET /store/`[store_id]`/products
  - POST /store/create
  - POST /store/`[store_id]`/product/create
  - POST /store/`[store_id]`/product/delete
  - POST /user/checkout
  - POST /genkeypair
- Secure communications with Minecraft and Discord backend (Signing request body with ed25519 and timestamp validation)
- Local sqlite database

# NOTE: Everything is subject to change, this is only a proof-of-concept and definitely not finalized, there are still a lot more features on the roadmap and the backend will also be ported to either Go or Rust

## Prerequisites

Make sure `bun` is installed and up-to-date
```bash
curl -fsSL https://bun.sh/install | bash
```
or
```bash
bun upgrade
```

## Installation

1. Clone the repository
```bash
git clone https://github.com/PlatinPay/platinpay-backend
```
2. `cd` into the cloned git repo
```bash
cd platinpay-backend
```
3. Install packages
```bash
bun i
```
4. Populate the database
```bash
bun run populate
```
5. Generate a new keypair
```bash
bun run genkey
```
The command above should give you a `public_key` and a `private_key`

**Save the public key** as you will need it later for **PlatinPay-Discord** and **PlatinPay-Minecraft**

6. Start the server
```bash
bun run start
```

The backend will run on port 3001 by default, to change that, edit the file `index.ts`

(If you updated the port, make sure to also update it on the frontend)

https://github.com/PlatinPay/platinpay-frontend

7. Update your **PlatinPay-Discord** and **PlatinPay-Minecraft** public key to the one you just generated

Refer to the docs on how to set your public key for Minecraft and Discord

https://github.com/PlatinPay/platinpay-discord

https://github.com/PlatinPay/platinpay-minecraft


This project is licensed under the [GNU AGPL-3.0](LICENSE) License. See the `LICENSE` file for details.

**DISCLAIMER: This project is currently not ready for production usage. It is a work-in-progress.**
