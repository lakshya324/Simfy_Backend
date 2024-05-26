import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { AuthRequest, StatusError } from "../types/types";
import User from "../models/user";
import TempUser from "../models/temp_user";
import { saltRounds } from "../config/config";
import {
  verifiedMail,
  forgotPasswordMail,
  passwordChangedMail,
} from "../emails/emailUtils";
import OTP from "../models/otp";
import bcrypt from "bcryptjs";
import { generateOTP } from "../utils/encoding";
import { decodeString } from "../utils/encoding";

export const getVerify = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = decodeString(req.params.userId);
    if (!userId) {
      const error = new Error("Invalid User Id!");
      (error as StatusError).statusCode = 422;
      return next(error);
    }
    const temp_user = await TempUser.findById(userId);
    if (!temp_user) {
      const error = new Error("User not found!");
      (error as StatusError).statusCode = 404;
      return next(error);
    }
    const user = new User({
      ...temp_user.user,
      connections: [],
    });
    await user.save();
    await TempUser.findByIdAndDelete(userId);
    verifiedMail(user.email, user._id.toString());
    return res.status(201).json({ success: true, message: "User Verified!" });
  } catch (error) {
    return next(error);
  }
};

export const postGenerateOTP = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error(`Validation Error! ${errors.array()[0].msg}`);
      (error as StatusError).statusCode = 422;
      return next(error);
    }

    const email = req.body.email;

    const isTempUser = await TempUser.findOne({ "user.email": email });
    if (isTempUser) {
      const error = new Error("Please verify your email first!");
      (error as StatusError).statusCode = 422;
      return next(error);
    }

    const user = await User.findOne({ email: email });
    if (!user) {
      const error = new Error("User not found!");
      (error as StatusError).statusCode = 404;
      return next(error);
    }

    const isAlreadySent = await OTP.findOne({ email: email });
    if (isAlreadySent) {
      const error = new Error("OTP already sent!");
      (error as StatusError).statusCode = 429;
      return next(error);
    }
    const otp = generateOTP(6);
    const otpDoc = new OTP({
      email: email,
      otp: otp,
    });
    await otpDoc.save();
    await forgotPasswordMail(email, otp);
    return res.status(200).json({ success: true, message: "OTP sent!" });
  } catch (error) {
    return next(error);
  }
};

export const postResetPassword = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error(`Validation Error! ${errors.array()[0].msg}`);
      (error as StatusError).statusCode = 422;
      return next(error);
    }

    const email = req.body.email;
    const otp = req.body.otp;
    const password = req.body.password;

    const isTempUser = await TempUser.findOne({ "user.email": email });
    if (isTempUser) {
      const error = new Error("Please verify your email first!");
      (error as StatusError).statusCode = 422;
      return next(error);
    }

    const user = await User.findOne({ email: email });
    if (!user) {
      const error = new Error("User not found!");
      (error as StatusError).statusCode = 404;
      return next(error);
    }

    const otpDoc = await OTP.findOne({ email: email });
    if (!otpDoc) {
      const error = new Error("OTP not found!");
      (error as StatusError).statusCode = 404;
      return next(error);
    }
    if (otpDoc.otp.toString() !== otp.toString()) {
      const error = new Error("Invalid OTP!");
      (error as StatusError).statusCode = 401;
      return next(error);
    }
    const encryptedPassword = await bcrypt.hash(password, saltRounds);
    user.password = encryptedPassword;
    await user.save();
    await OTP.findByIdAndDelete(otpDoc._id);
    passwordChangedMail(email);
    return res.status(200).json({ success: true, message: "Password Reset!" });
  } catch (error) {
    return next(error);
  }
};
