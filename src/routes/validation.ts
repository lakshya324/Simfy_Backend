import { Router } from "express";
import { body, check } from "express-validator";
import * as validationController from "../controllers/validation";

const router = Router();

router.get("/verify/:userId", validationController.getVerify);

router.post("/otp",[
    check("email", "Please enter a valid email.")
      .isEmail(),
  ],validationController.postGenerateOTP);

  router.post("/reset",[
    check("email", "Please enter a valid email.")
      .isEmail(),
    body(
      "password",
      "Please enter a password with only numbers and text and at least 5 characters."
    )
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim(),
    body("otp", "Please enter a valid OTP.").not().isEmpty().trim(),
  ],validationController.postResetPassword);

export default router;