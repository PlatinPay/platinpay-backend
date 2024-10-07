import { fetch } from "bun";

import { Database } from "bun:sqlite";

const db = new Database("platinpay.sqlite", { create: true });

// import requests
// import json
//
// url = "http://localhost:8081/"
//
// data = {
//     "playeruuid": "a061e888-bbe1-41cc-8630-f34f6c7b7762",
//     "commands": [
//         "say Hello, {playeruuid}!",
//         "give {playeruuid} minecraft:dirt 1"
//     ]
// }
//
// try:
//     response = requests.post(url, json=data, headers={"Content-Type": "application/json"})
//
//     print("Response status code:", response.status_code)
//     print("Response body:", response.text)
//
// except requests.exceptions.RequestException as e:
//     print(f"Error sending POST request: {e}")

const url = "http://localhost:8081/";

const data = {
  playeruuid: "a061e888-bbe1-41cc-8630-f34f6c7b7762",
  commands: [
    "say Hello, {playeruuid}!",
    "give {playeruuid} minecraft:dirt 1"
  ]
};

try {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  console.log("Response status code:", response.status);
  const responseBody = await response.text();
  console.log("Response body:", responseBody);
} catch (error) {
  console.error(`Error sending POST request: ${error}`);
}