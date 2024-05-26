import { Request, Response, NextFunction } from "express";
import { AuthRequest, StatusError } from "../types/types";
import User from "../models/user";
import ChatDB from "../models/chats";
import { deliveredDispose } from "../utils/dispose";

export const getChat = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId!;
    const uniqueName = req.params.receiverUniqueName;
    const receiver = await User.findOne({ uniqueName });
    if (!receiver) {
      const error = new Error("Receiver not found!");
      (error as StatusError).statusCode = 404;
      return next(error);
    }
    const receiverId = receiver._id.toString();
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error("User not found!");
      (error as StatusError).statusCode = 404;
      return next(error);
    }

    const receiverConnections = receiver.connections;
    const userConnections = user.connections;
    const isinReceiverConnections = receiverConnections.some( (connection) => connection.from.toString() === userId);
    const isinUserConnections = userConnections.some( (connection) => connection.from.toString() === receiverId);
    if (!isinReceiverConnections || !isinUserConnections) {
      const error = new Error("Unauthorized!");
      (error as StatusError).statusCode = 401;
      return next(error);
    }

    const chats = await ChatDB.find({$or: [{ from: userId, to: receiverId }, { from: receiverId, to: userId }]}).sort({ sent_time: 1 });
    // 1 for ascending order and -1 for descending order
    await deliveredDispose(userId, receiverId);
    return res.status(200).json({ chats: chats });
  } catch (error) {
    return next(error);
  }
};
