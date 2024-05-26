import { Router, Response } from "express";
import isAuth from "../middleware/is_auth";
import * as chatController from "../controllers/chats";
import upload from "../middleware/multer";

const router = Router();

//TODO: Add messages from dispose db
//TODO: Add online status of user
//TODO: change status of messages to seen

//* Fetch all chat between two users and mark messages as seen
router.get("/:receiverUniqueName", isAuth,chatController.getChat);

//* Upload Image and get URL
router.post(
  "/upload",
  isAuth,
  upload.single("image"),
  chatController.uploadImage
);

//TODO: image delete implementation for images not connected to any chat
// router.get("/delete", async (req: AuthRequest, res: Response) => {
//   console.log("Delete images without chatId");
//   //delete all images which dont have chatId parameter
//   const images = await ImageDB.find({ chatId: undefined });
//   res.send({ images });
// });

export default router;
