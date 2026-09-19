const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    skills: {
      type: [String],
      default: [],
    },

    // Automatically taken from user's registration/profile
    level: {
      type: String,
      enum: ["UG", "PG"],
      required: true,
      trim: true,
    },

    // Automatically taken from user's registration/profile
    degree: {
      type: String,
      required: true,
      trim: true,
    },

    branch: {
      type: String,
      default: "",
      trim: true,
    },

    // Example: 2026–27
    academicYear: {
      type: String,
      required: true,
      trim: true,
    },

    projectLink: {
      type: String,
      default: "",
      trim: true,
    },

    projectFileUrl: {
      type: String,
      default: "",
      trim: true,
    },

    projectFileName: {
      type: String,
      default: "",
      trim: true,
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Project", projectSchema);