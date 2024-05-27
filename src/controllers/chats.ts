import { Request, Response, NextFunction } from "express";
import { AuthRequest, StatusError } from "../types/types";
import User from "../models/user";
import ChatDB from "../models/chats";
import { deliveredDispose, deliveredSeenDispose } from "../utils/dispose";
import client from "../config/s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3BucketName, uploadFolderName } from "../config/config";
import ImageDB from "../models/images";

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
    const isinReceiverConnections = receiverConnections.some(
      (connection) => connection.from.toString() === userId
    );
    const isinUserConnections = userConnections.some(
      (connection) => connection.from.toString() === receiverId
    );
    if (!isinReceiverConnections || !isinUserConnections) {
      const error = new Error("Unauthorized!");
      (error as StatusError).statusCode = 401;
      return next(error);
    }

    const chats = await ChatDB.find({
      $or: [
        { from: userId, to: receiverId },
        { from: receiverId, to: userId },
      ],
    }).sort({ sent_time: 1 });
    // 1 for ascending order and -1 for descending order
    await deliveredDispose(userId, receiverId);
    await deliveredSeenDispose(userId, receiverId);
    return res.status(200).json({
      success: true,
      message: "Chats Fetched!",
      data: { chats: chats },
    });
  } catch (err) {
    console.log("Error in getting chat. Error:", err);
    const error = new Error("Server error in getting chat.");
    return next(error);
  }
};

export const uploadImage = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.file) {
      const error = new Error("No image provided.") as StatusError;
      error.statusCode = 422;
      return next(error);
    }

    const userId = req.userId!;
    const imageBuffer = req.file.buffer;
    const folderName = uploadFolderName;
    // File name based on user ID and current timestamp
    // const fileName = `${userId}_${Date.now()}.jpg`;
    const fileName = `${folderName}/${userId}_${Date.now()}.${
      req.file.mimetype.split("/")[1]
    }`;

    const command = new PutObjectCommand({
      Bucket: s3BucketName,
      Key: fileName,
      Body: imageBuffer,
      ContentType: req.file.mimetype,
      // ACL: 'public-read', // Make the file publicly readable
    });

    const response = await client.send(command);

    const imageUrl = `https://${s3BucketName}.s3.amazonaws.com/${fileName}`;

    // storing Image Data in ImageDB
    const image = new ImageDB({
      userId: userId,
      imageUrl,
    });
    await image.save();

    // Return the URL of the uploaded image
    res.send({ success: true, message: "Image Uploaded!", data: { imageUrl } });
  } catch (err) {
    console.log("Error in uploading image. Error:", err);
    const error = new Error("Server error in uploading image.") as StatusError;
    error.statusCode = 500;
    return next(error);
  }
};
