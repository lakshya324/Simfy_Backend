import { Request, Response, NextFunction } from "express";
import { Socket } from "socket.io";

export interface AuthRequest extends Request {
    userId?: string;
}

export interface AuthSocket extends Socket {
    userId?: string;
}

export interface StatusError extends Error {
    statusCode?: number;
    // data?: any;
}