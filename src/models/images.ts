import mongoose, { Schema } from "mongoose";

const image = new Schema({
    imageUrl: {
        type: String,
        required: true,
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    chatId: {
        type: Schema.Types.ObjectId,
        ref: "Chat",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

export default mongoose.model("Image", image);