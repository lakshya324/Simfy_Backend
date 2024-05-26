import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { AuthRequest, StatusError } from "../types/types";
import bcrypt from "bcryptjs";
import User from "../models/user";
import TempUser from "../models/temp_user";
import { saltRounds } from "../config/config";
import { createToken, verifyToken } from "../utils/jwt";
import {
  emailCoolDown,
  validationMail,
  verifiedMail,
  forgotPasswordMail,
  passwordChangedMail,
} from "../emails/emailUtils";
import { decodeString, generateOTP } from "../utils/encoding";
import OTP from "../models/otp";
import messageHandler from "../handlers/messageHandler";

export const postSignup = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const name: string = req.body.name;
    const email: string = req.body.email;
    const password: string = req.body.password;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // console.log(errors.array());
      const error = new Error(`Validation Error! ${errors.array()[0].msg}`);
      (error as StatusError).statusCode = 422;
      return next(error);
    }
    const isTempUser = await TempUser.findOne({ "user.email": email });
    const isUser = await User.findOne({ email: email });
    if (isTempUser || isUser) {
      const error = new Error("Email already exists!");
      (error as StatusError).statusCode = 422;
      return next(error);
    }

    const encryptedPassword = await bcrypt.hash(password, saltRounds);
    const temp_user = new TempUser({
      user: {
        name: name,
        email: email,
        password: encryptedPassword,
      },
    });
    await temp_user.save();
    validationMail(email, temp_user._id.toString());
    return res.status(201).json({
      success: true,
      message: "User Created!",
      data: { isVerify: false, emailSent: true },
    });
  } catch (error) {
    return next(error);
  }
};

export const postLogin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // console.log(errors.array());
      const error = new Error(`Validation Error! ${errors.array()[0].msg}`);
      (error as StatusError).statusCode = 422;
      return next(error);
    }

    const email: string = req.body.email;
    const password: string = req.body.password;

    const user = await User.findOne({
      email: email,
    });
    if (!user) {
      const temp_user = await TempUser.findOne({
        "user.email": email,
      });
      if (!temp_user) {
        const error = new Error("User not found!");
        (error as StatusError).statusCode = 404;
        return next(error);
      } else {
        if (!emailCoolDown(temp_user.emailLastSent)) {
          return res.status(200).json({
            success: true,
            message: "Email not verified!",
            data: {
              isVerify: false,
              emailSent: false,
            },
          });
        } else {
          validationMail(email, temp_user._id.toString());
          return res.status(200).json({
            success: true,
            message: "Email not verified, Resend Validation Email!",
            data: {
              isVerify: false,
              emailSent: true,
            },
          });
        }
      }
    } else {
      const isEqual = await bcrypt.compare(password, user.password);
      if (!isEqual) {
        const error = new Error("Wrong Password!");
        (error as StatusError).statusCode = 401;
        return next(error);
      }
      const token = createToken({ userId: user._id.toString() });
      return res.status(200).json({
        success: true,
        message: "Login Successful!",
        data: { token: token },
      });
    }
  } catch (error) {
    return next(error);
  }
};

export const postResend = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const email = req.body.email;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // console.log(errors.array());
      const error = new Error(`Validation Error! ${errors.array()[0].msg}`);
      (error as StatusError).statusCode = 422;
      return next(error);
    }

    // const isUser = await User.findOne({ email: email });
    // console.log(isUser,email);
    // if (isUser) {
    //   const error = new Error("Email already exists!");
    //   (error as StatusError).statusCode = 422;
    //   return next(error);
    // }

    const temp_user = await TempUser.findOne({ "user.email": email });
    if (!temp_user) {
      const error = new Error("User not found!");
      (error as StatusError).statusCode = 404;
      return next(error);
    }
    if (!emailCoolDown(temp_user.emailLastSent)) {
      return res.status(200).json({
        success: true,
        message: "Email sent recently!",
        data: {
          isVerify: false,
          emailSent: false,
        },
      });
    } else {
      try {
        validationMail(email, temp_user._id.toString());
        temp_user.emailLastSent = new Date();
        await temp_user.save();
      } catch (error) {
        console.log(`Error While Sending Emails in Resend: ${error}`);
      }
      return res.status(200).json({
        success: true,
        message: "Email sent!",
        data: {
          isVerify: false,
          emailSent: true,
        },
      });
    }
  } catch (error) {
    return next(error);
  }
};

// export const postForgot = async (
//   req: AuthRequest,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const email = req.body.email;
//     const user = await User.findOne({ email: email });
//     if (!user) {
//       const error = new Error("User not found!");
//       (error as StatusError).statusCode = 404;
//       return next(error);
//     }
//     try {
//       forgotPasswordMail(email, user._id.toString());
//     } catch (error) {
//       console.log(`Error While Sending Emails in Forgot: ${error}`);
//     }
//     return res.status(200).json({ message: "Email sent!" });
//   } catch (error) {
//     return next(error);
//   }
// };

export const getDelete = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error("User not found!");
      (error as StatusError).statusCode = 404;
      return next(error);
    }
    await User.findByIdAndDelete(userId);
    return res.status(200).json({ success: true, message: "User Deleted!" });
  } catch (error) {
    return next(error);
  }
};
