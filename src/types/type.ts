import { Request, Response, NextFunction } from "express";

export interface AuthRequest extends Request {
    userId?: string;
}

export interface StatusError extends Error {
    statusCode?: number;
    // data?: any;
}