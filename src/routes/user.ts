import { Router } from 'express';
import isAuth from '../middleware/is_auth';
import * as userController from '../controllers/user';
import { check, body } from 'express-validator';

const router = Router();

router.get('/', isAuth, userController.getUser);

router.post("/update",[
    check("name", "Please enter a valid name.").not().isEmpty().trim(),
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
    body("status", "Please enter a valid status.").not().isEmpty().trim(),
    // body("profileImage", "Please enter a valid image url.").not().isEmpty().trim(),
  ],isAuth, userController.postUpdate);

router.get("/connections", isAuth, userController.getConnections);

// chats, profile, start_connection 

export default router;