const mongoose = require("mongoose");

const notificationSettingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    connectRequests: {
      type: Boolean,
      default: true,
    },

    requestAccepted: {
      type: Boolean,
      default: true,
    },

    studyMaterial: {
      type: Boolean,
      default: true,
    },

    chatMessages: {
  type: Boolean,
  default: true,
},

    queries: {
      type: Boolean,
      default: true,
    },

    projectUpdates: {
      type: Boolean,
      default: true,
    },

    importantWebsiteUpdates: {
      type: Boolean,
      default: true,
    },

    muteAll: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const NotificationSetting = mongoose.model(
  "NotificationSetting",
  notificationSettingSchema
);

module.exports = NotificationSetting;