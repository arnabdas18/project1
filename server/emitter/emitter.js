const express = require("express");
const crypto = require("crypto");
const socket = require("socket.io-client");

const data = require("./data.json");

const app = express();

const socketClient = socket.connect("http://localhost:4000");

function generateRandomMessage() {
  const randomNameIndex = Math.floor(Math.random() * data.names.length);
  const randomName = data.names[randomNameIndex];

  const randomOriginIndex = Math.floor(Math.random() * data.cities.length);
  const randomOrigin = data.cities[randomOriginIndex];

  const randomDestinationIndex = Math.floor(Math.random() * data.cities.length);
  const randomDestination = data.cities[randomDestinationIndex];

  const randomMessage = {
    name: randomName,
    origin: randomOrigin,
    destination: randomDestination,
  };

  return randomMessage;
}

function generateSumCheckMessage(originalMessage) {
  const secretKey = crypto
    .createHash("sha256")
    .update(JSON.stringify(originalMessage))
    .digest("hex");

  const message = {
    ...originalMessage,
    secretKey,
  };

  return message;
}

function encryptMessage(message) {
  const key = process.env.KEY;
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    "aes-256-ctr",
    "nwybnavbjuofthxxjfdwbevmsmmwmjbf",
    iv
  );
  const encryptedMessage = cipher.update(
    JSON.stringify(message),
    "utf-8",
    "hex"
  );

  return { encryptedMessage, iv };
}

setInterval(() => {
  const originalMessage = generateRandomMessage();
  const sumCheckMessage = generateSumCheckMessage(originalMessage);
  const encryptedPackage = encryptMessage(sumCheckMessage);
  socketClient.emit("encrypted-package", encryptedPackage);
}, 10000);

app.listen(3000, () => {
  console.log("Emitter running on PORT: 3000");
});
