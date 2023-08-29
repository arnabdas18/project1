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

function generateSumCheckMessage(originalMessage) {
  const secretKey = crypto
    .createHash("sha256")
    .update(JSON.stringify(originalMessage));

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
  const { encryptedMessage, iv } = encryptMessage(sumCheckMessage);

  console.log(encryptedMessage);
  console.log(iv);
}, 10000);
