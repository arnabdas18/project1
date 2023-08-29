require("dotenv").config();
const crypto = require("crypto");
const data = require("./data.json");

function generateRandomMessage() {
  const randomNameIndex = Math.floor(Math.random() * data.names.length);
  const randomName = data.names[randomNameIndex];

  const randomOriginIndex = Math.floor(Math.random() * data.cities.length);
  const randomOrigin = data.cities[randomOriginIndex];

  const randomDestinationIndex = Math.floor(Math.random() * data.cities.length);
  const randomDestination = data.cities[randomDestinationIndex];

  return {
    name: randomName,
    origin: randomOrigin,
    destination: randomDestination,
  };
}

const originalMessage = generateRandomMessage();

function sumCheckMessage(originalMessage) {
  const secretKey = crypto
    .createHash("sha256")
    .update(JSON.stringify(originalMessage));

  const message = {
    ...originalMessage,
    secretKey,
  };

  return message;
}

const message = sumCheckMessage(originalMessage);

function encryptMessage(message) {
  const cipher = crypto.createCipheriv(
    "aes-256-ctr",
    process.env.KEY,
    process.env.IV
  );
  const encryptedMessage = cipher.update(
    JSON.stringify(message),
    "utf-8",
    "hex"
  );

  return encryptedMessage;
}

console.log(encryptMessage(message));
