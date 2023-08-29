const mongoose = require("mongoose");

const dataPointSchema = new mongoose.Schema({
  name: String,
  origin: String,
  destination: String,
  secret_key: String,
  timestamp: Date,
});

const minuteDataSchema = new mongoose.Schema({
  minute: Date,
  data: [dataPointSchema],
});

minuteDataSchema.index({ minute: 1 });

const MinuteDataModel = mongoose.model("MinuteData", minuteDataSchema);

module.exports = MinuteDataModel;
