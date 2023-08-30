const mongoose = require("mongoose");

const dataPointSchema = new mongoose.Schema({
  name: String,
  origin: String,
  destination: String,
  timestamp: Date,
});

const minuteDataSchema = new mongoose.Schema({
  minute: {
    type: Date,
    index: true,
    expires: 600,
  },
  data: [dataPointSchema],
});

const MinuteDataModel = mongoose.model("MinuteData", minuteDataSchema);

module.exports = MinuteDataModel;
