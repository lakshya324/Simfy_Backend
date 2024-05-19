import mongoose, { Connection, Schema } from "mongoose";
import { url } from "../config/config";
import { v4 as uuidv4 } from "uuid";

const userSchema = new Schema({
  uniqueName: {
    type: String,
    required: true,
    unique: true,
    default: uuidv4()
  },
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
  status: {
    type: String,
    default: "I am new!",
  },
  feeling: {
    type: String,
    default: "normal",
  },
  profileImage: {
    type: String,
    default: url+"/images/default/default.png",
  },
  connections: [
    {
      from: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      last_updated: {
        type: Date,
        default: Date.now,
        required: true,
      },
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("User", userSchema);