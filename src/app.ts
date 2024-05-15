import path from "path";
import express, { Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import { mongoDbUri, port } from "./config/config";
import authRoutes from "./routers/auth";

const app = express();

app.use(cors());

app.use(bodyParser.json()); // application/json

app.use("/images", express.static(path.join(__dirname, "../public/images")));

app.use(authRoutes);

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  console.log(error);
  const status = res.statusCode || 500;
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
