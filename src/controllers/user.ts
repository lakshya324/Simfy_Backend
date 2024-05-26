import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/types";
import User from "../models/user";
import { StatusError } from "../types/types";
import bcrypt from "bcryptjs";
import { validationResult } from "express-validator";
import { saltRounds } from "../config/config";
import ConnectionDB from "../models/connection";
import { connectionRequestMail } from "../emails/emailUtils";
import { decodeString } from "../utils/encoding";

export const getUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId;
    if (!userId) {
      const error = new Error("Invalid User Id!");
      (error as StatusError).statusCode = 422;
      return next(error);
    }
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error("User not found!");
      (error as StatusError).statusCode = 404;
      return next(error);
    }
    return res
      .status(200)
      .json({ success: true, message: "User Data", data: { user: user } });
  } catch (error) {
    return next(error);
  }
};

export const postUpdate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId;
    const name: string = req.body.name;
    const email: string = req.body.email;
    const password: string = req.body.password;
    const status: string = req.body.status;
    // const profileImage: string = req.body.profileImage;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // console.log(errors.array());
      const error = new Error(`Validation Error! ${errors.array()[0].msg}`);
      (error as StatusError).statusCode = 422;
      return next(error);
    }

    const user = await User.findById(userId);
    const user_check = await User.findOne({ email: email });
    if (!user || !user_check) {
      const error = new Error("User not found!");
      (error as StatusError).statusCode = 404;
      return next(error);
    }
    if (user.id.toString() !== user_check.id.toString()) {
      const error = new Error("Unauthorized!");
      (error as StatusError).statusCode = 401;
      return next(error);
    }

    user.name = name;
    user.email = email;
    user.password = await bcrypt.hash(password, saltRounds);
    user.status = status;
    // user.profileImage = profileImage;

    try {
      await user.save();
    } catch (error) {
      return next(error);
    }

    return res.status(200).json({ success: true, message: "User Updated!" });
  } catch (error) {
    return next(error);
  }
};

// TODO: modifty this function to get connections details as well
export const getConnections = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId;
    if (!userId) {
      const error = new Error("Invalid User Id!");
      (error as StatusError).statusCode = 422;
      return next(error);
    }
    const user = await User.findById(userId).sort({
      "connections.last_updated": -1,
    });
    if (!user) {
      const error = new Error("User not found!");
      (error as StatusError).statusCode = 404;
      return next(error);
    }
    return res.status(200).json({
      success: true,
      message: "User Connections",
      data: { connections: user.connections },
    });
  } catch (error) {
    return next(error);
  }
};

export const sendConnectionRequest = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId;
    const connectionUniqueName: string = req.body.unique_name;
    if (!userId || !connectionUniqueName) {
      const error = new Error(
        `Invalid User Id or Connection Id! ${userId} ${connectionUniqueName}`
      );
      (error as StatusError).statusCode = 422;
      return next(error);
    }
    const user = await User.findById(userId);
    const connection_user = await User.findOne({
      uniqueName: connectionUniqueName,
    });
    if (!user || !connection_user) {
      const error = new Error("User not found!");
      (error as StatusError).statusCode = 404;
      return next(error);
    }
    const connectionId = connection_user._id.toString();
    if (user._id.toString() === connectionId) {
      const error = new Error("Cannot connect to self!");
      (error as StatusError).statusCode = 422;
      return next(error);
    }
    const connection = user.connections.find(
      (connection) => connection.from.toString() === connectionId
    );
    if (connection) {
      const error = new Error("Connection already exists!");
      (error as StatusError).statusCode = 422;
      return next(error);
    }
    const newConnection = new ConnectionDB({
      from: userId,
      to: connectionId,
      createdAt: Date.now(),
    });
    await newConnection.save();
    connectionRequestMail(
      connection_user.email,
      user.uniqueName,
      user.name,
      newConnection._id.toString()
    );
    return res.status(200).json({
      success: true,
      message: "Connection Request Sent!",
      data: {
        connectionId: newConnection._id.toString(),
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const acceptConnectionRequest = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const connectionId = decodeString(req.params.connectionId);
    if (!connectionId) {
      const error = new Error("Invalid Connection Id!");
      (error as StatusError).statusCode = 422;
      return next(error);
    }
    const connection = await ConnectionDB.findById(connectionId);
    if (!connection) {
      const error = new Error("Connection not found!");
      (error as StatusError).statusCode = 404;
      return next(error);
    }
    const user_to = await User.findById(connection.to);
    const user_from = await User.findById(connection.from);
    if (!user_to || !user_from) {
      const error = new Error("User not found!");
      (error as StatusError).statusCode = 404;
      return next(error);
    }

    user_to.connections.push({
      from: connection.from,
      last_updated: Date.now(),
    });
    user_from.connections.push({
      from: connection.to,
      last_updated: Date.now(),
    });
    await user_to.save();
    await user_from.save();
    await ConnectionDB.findByIdAndDelete(connectionId);
    // await Promise.all([
    //   user_to.save(),
    //   user_from.save(),
    //   ConnectionDB.findByIdAndDelete(connectionId),
    // ]);
    return res
      .status(200)
      .json({ success: true, message: "Connection Request Accepted!" });
  } catch (error) {
    return next(error);
  }
};

export const rejectConnectionRequest = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const connectionId = decodeString(req.params.connectionId);
    if (!connectionId) {
      const error = new Error("Invalid Connection Id!");
      (error as StatusError).statusCode = 422;
      return next(error);
    }
    const connection = await ConnectionDB.findById(connectionId);
    if (!connection) {
      const error = new Error("Connection not found!");
      (error as StatusError).statusCode = 404;
      return next(error);
    }
    await ConnectionDB.findByIdAndDelete(connectionId);
    return res
      .status(200)
      .json({ success: true, message: "Connection Request Rejected!" });
  } catch (error) {
    return next(error);
  }
};
