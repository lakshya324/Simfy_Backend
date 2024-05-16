import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/type";
import User from "../models/user";
import { StatusError } from "../types/type";
import bcrypt from "bcryptjs";
import { validationResult } from "express-validator";
import { saltRounds } from "../config/config";

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
    return res.status(200).json({ user: user });
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

    return res.status(200).json({ message: "User Updated!" });
  } catch (error) {
    return next(error);
  }
};

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
        const user = await User.findById(userId).sort({ 'connections.last_updated': -1 });
        if (!user) {
        const error = new Error("User not found!");
        (error as StatusError).statusCode = 404;
        return next(error);
        }
        return res.status(200).json({ connections: user.connections });
    } catch (error) {
        return next(error);
    }
    }