const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema(
  {
    answer: {
      type: String,
      required: true,
      trim: true,
    },

    query: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Query",
      required: true,
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Answer", answerSchema);