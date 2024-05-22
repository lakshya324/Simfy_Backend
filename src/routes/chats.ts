import { Router, Response } from "express";
import isAuth from "../middleware/is_auth";
import * as chatController from "../controllers/chats";

const router = Router();

//todo: Add messages from dispose db
//todo: Add online status of user
//todo: change status of messages to seen
router.get("/:receiverUniqueName", isAuth,chatController.getChat);

//Todo: Add routes for mark as seen messages

export default router;