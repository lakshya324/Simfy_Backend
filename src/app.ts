import path from "path";
import express, { Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import { mongoDbUri, port } from "./config/config";
import authRoutes from "./routes/auth";
import { AuthRequest, StatusError } from "./types/type";
import mlRoutes from "./routes/ml";
import userRoutes from "./routes/user";

const app = express();

app.use(cors());

app.use(bodyParser.json()); // application/json

//Todo: Load and Change images for Chats and profile pictures
app.use("/images", express.static(path.join(__dirname, "../public/images")));

app.use(authRoutes);
app.use("/user", userRoutes);
app.use("/ml", mlRoutes);




app.use((error: StatusError, req: AuthRequest, res: Response, next: NextFunction) => {
  // console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  // const data = error.data;
  // res.status(status).json({ message: message, data: data });
  res.status(status).json({ error: message });
});

mongoose
  .connect(mongoDbUri)
  .then((result) => {
    app.listen(port, () =>
      console.log("\x1b[36m%s\x1b[0m", `Server started on port ${port}`)
    );
  })
  .catch((err) => console.log(err));
