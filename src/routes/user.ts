import { Router } from 'express';
import isAuth from '../middleware/is_auth';
import * as userController from '../controllers/user';
import { check, body } from 'express-validator';

const router = Router();

//* Fetch User Profile
router.get('/', isAuth, userController.getUser);

//* Update User Profile
router.post("/update",[
    check("name", "Please enter a valid name.").not().isEmpty().trim(),
    check("email", "Please enter a valid email.")
      .isEmail(),
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

//* Get All Connections made by User
router.get("/connections", isAuth, userController.getConnections);

//* Send connection request using Unique Name
router.post("/request", isAuth, userController.sendConnectionRequest);

//* Accept Connection
router.get("/request/accept/:connectionId", userController.acceptConnectionRequest);

//* Reject Connection
router.get("/request/reject/:connectionId", userController.rejectConnectionRequest);


// chats, profile, start_connection 
//TODO: Add routes for loading other users (connections) profile
//TODO: Change Email
//TODO: Change and set Unique Name
//TODO: Change profile image route [Image Upload]

export default router;