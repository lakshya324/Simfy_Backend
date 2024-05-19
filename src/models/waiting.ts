import mongoose, { Schema } from "mongoose";

const waitingSchema = new Schema(
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
      message_type: {
        type: String,
        required: true,
      },
      data: {
        type: String,
        required: true,
      },
    },
    sent_time: {
      type: Date,
      default: Date.now,
    },
  }
);

export default mongoose.model("Dispose", waitingSchema);
