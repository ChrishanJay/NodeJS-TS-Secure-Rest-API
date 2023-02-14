import express from 'express';
import debug from 'debug';
import jwt, { JsonWebTokenError } from 'jsonwebtoken';
import crypto from 'crypto';

const log: debug.IDebugger = debug('app:auth-controller');

const jwtSecret: string = process.env.JWT_SECRET || "0";
const tokenExpirationInSeconds = 60 * 60 // expires in 01 hour

class AuthController {
    async createJWT(req: express.Request, res: express.Response) {
        try {
            if (jwtSecret === "0") {
                throw new JsonWebTokenError("JWT_SECRET not set");
            }
            const refreshId = req.body.userId + jwtSecret;
            const salt = crypto.createSecretKey(crypto.randomBytes(16));
            const hash = crypto
                .createHmac('sha512', salt)
                .update(refreshId)
                .digest('base64');
            req.body.refreshKey = salt.export();
            const token = jwt.sign(req.body, jwtSecret, {
                expiresIn: tokenExpirationInSeconds
            });
            return res.status(201)
                .send({
                    accessToken: token,
                    refreshToken: hash
                });
        } catch (error) {
            log('createJWT error: %0', error);
            return res.status(500).send();
        }
    }
}

export default new AuthController();