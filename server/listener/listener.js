require("dotenv").config();
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const crypto = require("crypto");
const mongoose = require("mongoose");

const MinuteDataModel = require("./models/MinuteData");

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("DB connected"))
  .catch((err) => console.log("DB connection failed", err));

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(cors());

io.on("connection", (socket) => {
  socket.on("encrypted-package", ({ encryptedMessage, iv }) => {
    const decryptedMessage = decryptMessage(encryptedMessage, iv);
    const { safe, assumedOriginalMessage } =
      validateDataIntegrity(decryptedMessage);

    if (safe) {
      saveToDatabase(assumedOriginalMessage);
      socket.emit("data-added", assumedOriginalMessage);
    } else {
      socket.emit("data-validation-failed");
    }
  });
});

function decryptMessage(encryptedMessage, iv) {
  const key = process.env.KEY;
  const decipher = crypto.createDecipheriv("aes-256-ctr", key, iv);
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

async function saveToDatabase(message) {
  const now = new Date();
  const minute = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    now.getHours(),
    now.getMinutes()
  );

  try {
    const existingDocument = await MinuteDataModel.findOne({ minute });

    if (existingDocument) {
      existingDocument.data.push(message);
      await existingDocument.save();
    } else {
      const newDocument = new MinuteDataModel({
        minute,
        data: [message],
      });
      await newDocument.save();
    }
  } catch (error) {
    console.error("Error saving to database:", error);
  }
}

server.listen(5000, () => {
  console.log("Listener is running on port: 5000");
});
