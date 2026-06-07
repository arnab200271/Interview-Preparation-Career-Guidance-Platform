const mongoose = require("mongoose");
const schema = mongoose.Schema
const notificationSchema = new schema(
  {
    title: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: ["test", "coding", "resume", "general","challenge",],
      default: "general",
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);
const notificationmodel = mongoose.model("notification",notificationSchema)
module.exports = notificationmodel