import {Router} from "express";
import { check, body } from "express-validator";
import User from "../models/user";
import * as authController from "../controllers/auth";
import isAuth from "../middleware/is_auth";

const router = Router();

router.post(
  "/signup",
  [
    check("name", "Please enter a valid name.").not().isEmpty().trim(),
    check("email", "Please enter a valid email.")
      .isEmail()
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject(
              "E-Mail exists already, please pick a different one."
            );
          }
        });
      })
      .normalizeEmail(),
    body(
      "password",
      "Please enter a password with only numbers and text and at least 5 characters."
    )
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim(),
  ],
  authController.postSignup
);

router.post(
  "/login",
  [
    check("email", "Please enter a valid email.").isEmail().normalizeEmail(),
    body(
      "password",
      "Please enter a password with only numbers and text and at least 5 characters."
    )
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim(),
  ],
  authController.postLogin
);

router.get("/verify/:userId", authController.getVerify);

router.post(
  "/resend",
  [
    check("email", "Please enter a valid email.")
      .isEmail()
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (!userDoc) {
            return Promise.reject("E-Mail Already Verified!");
          }
        });
      })
      .normalizeEmail(),
  ],
  authController.postResend
);

router.post("/otp",[
  check("email", "Please enter a valid email.")
    .isEmail()
    .normalizeEmail(),
],authController.postGenerateOTP);

router.post("/reset",[
  check("email", "Please enter a valid email.")
    .isEmail()
    .normalizeEmail(),
  body(
    "password",
    "Please enter a password with only numbers and text and at least 5 characters."
  )
    .isLength({ min: 5 })
    .isAlphanumeric()
    .trim(),
  body("otp", "Please enter a valid OTP.").not().isEmpty().trim(),
],authController.postResetPassword);

router.delete("/delete",isAuth,authController.getDelete);

export default router;