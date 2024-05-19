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
} from "../utils/emails";
import { decodeString, generateOTP } from "../utils/encoding";
import OTP from "../models/otp";

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
    try {
      await temp_user.save();
    } catch (error) {
      return next(error);
    }
    try {
      validationMail(email, temp_user._id.toString());
    } catch (error) {
      console.log(`Error While Sending Emails in Signup: ${error}`);
    }
    return res
      .status(201)
      .json({ isVerify: false, emailSent: true, message: "User Created!" });
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
            isVerify: false,
            emailSent: false,
            message: "Email not verified!",
          });
        } else {
          try {
            validationMail(email, temp_user._id.toString());
          } catch (error) {
            console.log(`Error While Sending Emails in Login: ${error}`);
          }
          return res.status(200).json({
            isVerify: false,
            emailSent: true,
            message: "Email not verified!",
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
      return res.status(200).json({ token: token });
    }
  } catch (error) {
    return next(error);
  }
};

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
    try {
      await user.save();
      await TempUser.findByIdAndDelete(userId);
    } catch (error) {
      return next(error);
    }
    try {
      verifiedMail(user.email, user._id.toString());
    } catch (error) {
      console.log(`Error While Sending Emails in Verify: ${error}`);
    }
    return res.status(201).json({ message: "User Verified!" });
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
    const temp_user = await TempUser.findOne({ "user.email": email });
    if (!temp_user) {
      const error = new Error("User not found!");
      (error as StatusError).statusCode = 404;
      return next(error);
    }
    if (!emailCoolDown(temp_user.emailLastSent)) {
      return res.status(200).json({
        isVerify: false,
        emailSent: false,
        message: "Email sent recently!",
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
        isVerify: false,
        emailSent: true,
        message: "Email sent!",
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
    return res.status(200).json({ message: "User Deleted!" });
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
      return res.status(200).json({ message: "OTP already sent!" });
    }
    const otp = generateOTP(6);
    const otpDoc = new OTP({
      email: email,
      otp: otp,
    });
    try {
      await otpDoc.save();
    } catch (error) {
      return next(error);
    }
    try {
      forgotPasswordMail(email, otp);
    } catch (error) {
      console.log(`Error While Sending Emails in Forgot: ${error}`);
    }
    return res.status(200).json({ message: "OTP sent!" });
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
    try {
      await user.save();
      await OTP.findByIdAndDelete(otpDoc._id);
    } catch (error) {
      return next(error);
    }

    try {
      passwordChangedMail(email);
    } catch (error) {
      console.log(`Error While Sending Emails in Reset: ${error}`);
    }
    return res.status(200).json({ message: "Password Reset!" });
  } catch (error) {
    return next(error);
  }
};
