import { connection_schema } from "../types/user";

const User = require("../models/user");

export async function getAllConnections(userId: string) {
  try {
    const user = await User.findById(userId)
      .populate({
        path: "connections.from",
        select: "-connections -password",
      })
      .exec()
      .sort({ "connections.last_updated": -1 });

    if (!user) {
      const error = new Error("User not found!");
      return error;
    }
    return user.connections;
  } catch (error) {
    return error;
  }
}

//Todo: Error handling [Break if connection not found]
export async function updateLastChatTime(userId1: string, userId2: string) {
  try {
    const user1 = User.findById(userId1);
    const user2 = User.findById(userId2);
    await Promise.all([user1, user2]);
    if (!user1 || !user2) {
      const error = new Error("User not found!");
      return error;
    }
    const user1Index = user1.connections.findIndex(
      (connection:connection_schema) => connection.from.toString() === userId2
    );
    const user2Index = user2.connections.findIndex(
      (connection:connection_schema) => connection.from.toString() === userId1
    );
    if (user1Index === -1 || user2Index === -1) {
      const error = new Error("Connection not found!");
      return error;
    }
    user1.connections[user1Index].last_updated = Date.now();
    user2.connections[user2Index].last_updated = Date.now();
    await Promise.all([user1.save(), user2.save()]);
} catch (error) {
    console.log("Error in updating last chat time. Error:", error);
    const err = new Error("Server error");
    return err;
}}