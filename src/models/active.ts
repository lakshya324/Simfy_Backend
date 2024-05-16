import mongoose, { Schema } from "mongoose";

const onlineSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  connectionId: {
    type: String,
    required: true,
  },
});

export default mongoose.model("Online", onlineSchema);
