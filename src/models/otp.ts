import mongoose, { Schema } from "mongoose";
import { expireTimeOTP } from "../config/config";

const otpSchema = new Schema({
  otp: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  expireAt: {
    type: Date,
    default: Date.now,
    // index: { expires: expireTimeOTP },
    index: { expires: 30 },
  },
});

export default mongoose.model("otp", otpSchema);
