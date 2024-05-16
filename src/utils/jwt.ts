import jwt from 'jsonwebtoken';
import { secretKey,jwtExpireTime } from '../config/config';

export function createToken(payload: object): string {
    return jwt.sign(payload, secretKey, { expiresIn: jwtExpireTime });
}

export function verifyToken(token: string): object | null {
    try {
        const decoded = jwt.verify(token, secretKey);
        return decoded as object;
    } catch (error) {
        return null;
    }
}