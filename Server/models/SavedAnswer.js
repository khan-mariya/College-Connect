const mongoose = require("mongoose");

const savedAnswerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    answer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Answer",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Same user cannot save the same answer twice
savedAnswerSchema.index(
  { user: 1, answer: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  "SavedAnswer",
  savedAnswerSchema
);