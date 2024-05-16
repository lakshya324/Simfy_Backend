import { Router, Response } from "express";
import isAuth from "../middleware/is_auth";
import { AuthRequest } from "../types/type";
import User from "../models/user";

const router = Router();

router.get("/predict", isAuth, async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  console.log(userId);
  const user = await User.findById(userId);
  res.json({ message: "Predicted", user: user });
});

export default router;
