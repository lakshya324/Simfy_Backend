import mongoose, { Schema } from "mongoose";
import { tempTime } from "../config/config";

const tempUserSchema = new Schema({
  user: {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  // expireAt: {
  //   type: Date,
  //   default: Date.now,
  //   index: { expires: tempTime },
  // },
  emailLastSent: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Temp", tempUserSchema);
