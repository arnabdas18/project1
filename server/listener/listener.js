const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const crypto = require("crypto");
const mongoose = require("mongoose");

const DataModel = require("./models/MinuteData");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

io.on("connection", (socket) => {
  socket.on("encrypted-package", ({ encryptedMessage, iv }) => {
    const decryptedMessage = decryptMessage(encryptedMessage, iv);
    const { safe, assumedOriginalMessage } =
      validateDataIntegrity(decryptedMessage);

    if (safe) {
      console.log(assumedOriginalMessage);
    }
  });
});

function decryptMessage(encryptedMessage, iv) {
  const decipher = crypto.createDecipheriv(
    "aes-256-ctr",
    "nwybnavbjuofthxxjfdwbevmsmmwmjbf",
    iv
  );
  const decryptedMessage = decipher.update(encryptedMessage, "hex", "utf8");
  return JSON.parse(decryptedMessage);
}

function validateDataIntegrity(message) {
  const assumedOriginalMessage = {
    name: message.name,
    origin: message.origin,
    destination: message.destination,
  };

  const calculatedSecretKey = crypto
    .createHash("sha256")
    .update(JSON.stringify(assumedOriginalMessage))
    .digest("hex");

  const safe = calculatedSecretKey === message.secretKey;

  return {
    safe,
    assumedOriginalMessage,
  };
}

function saveToDatabase(message) {
  const now = new Date();
  const minute = now.getMinutes();
  const newData = new DataModel({
    minute,
    data: message,
  });
  newData.save();
}

server.listen(4000, () => {
  console.log("Listener is running on port: 4000");
});
