import dotenv from "dotenv";

dotenv.config();

export const port = process.env.PORT || 8080;
export const mongoDbUri = process.env.MONGODB_URI!;
export const secretKey = process.env.SECRET_KEY!;