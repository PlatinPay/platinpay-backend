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

const genKeyPair = async () => {
  await startServer();

  const response = await fetch(`${BASE_URL}/genkeypair`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  }).then((res) => res.json());

  console.log("Public Key: ", response.publicKey);
  console.log("Private Key: ", response.privateKey);

  console.log("Key pair generated successfully");

  process.exit(0);
};

genKeyPair().catch((error) => {
  console.error("Error generating keypair:", error);
});
