import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { AuthRequest } from "../types/type";
import { secretKey } from "../config/config";

export default (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.get('Authorization');
  if (!authHeader) {
    const error = new Error('Not authenticated.') as any;
    error.statusCode = 401;
    throw error;
  }
  // Bearer token
  const token = authHeader.split(' ')[1];
  let decodedToken: JwtPayload;
  try {
    decodedToken = jwt.verify(token, secretKey) as JwtPayload;
  } catch (err) {
    (err as any).statusCode = 500;
    throw err;
  }
  if (!decodedToken) {
    const error = new Error('Not authenticated.') as any;
    error.statusCode = 401;
    throw error;
  }
  // console.log(">",decodedToken);
  req.userId = decodedToken.userId;
  next();
};
