const mongoose = require("mongoose");
module.exports = mongoose.model(
  "Chat",
  new mongoose.Schema(
    {
      question: String,
      answer: String,
      jurisdiction: String,
      sourceType: String,
      sources: Array,
    },
    { timestamps: true },
  ),
);
