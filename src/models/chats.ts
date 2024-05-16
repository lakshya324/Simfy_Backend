import mongoose, { Schema } from "mongoose";

const chatSchema = new Schema(
  {
    from: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    to: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: {
        type: String,
        required: true,
      },
      data: {
        type: String,
        required: true,
      },
    },
    meta_data: {
      read: {
        type: Boolean,
        default: false,
        required: true,
      },
      seen_time: {
        type: Date,
        default: null,
      },
      delivered_time: {
        type: Date,
        default: Date.now,
      },
      sent_time: {
        type: Date,
      },
    },
  },
  { timestamps: false }
);

export default mongoose.model("Chat", chatSchema);
