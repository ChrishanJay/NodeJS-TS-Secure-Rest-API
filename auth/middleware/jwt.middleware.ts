import express from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { JWT } from '../../common/types/jwt';
import userService from '../../users/services/users.service';

const jwtSecret: string = process.env.JWT_SECRET || "0";

class JWTMiddleware {
    verifyRefreshBodyField(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) {
        if (req.body && req.body.refreshToken) {
            return next();
        } else {
            return res.status(400).send({
                errors: ["Missing required field: refreshToken"]
            });
        }
    }

    async validRefreshNeeded(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) {
        const user: any = await userService.getUserByEmailWithPassword(
            res.locals.jwt.email
        );

        const salt = crypto.createSecretKey(
            Buffer.from(res.locals.jwt.refreshKey.data)
        );

        const hash = crypto
            .createHmac('sha512', salt)
            .update(res.locals.jwt.userId + jwtSecret)
            .digest('base64');

        if (hash === req.body.refreshToken) {
            req.body = {
                userId: user._id,
                email: user.email,
                permissionFlags: user.permissionFlags,
            };
            return next();
        } else {
            return res.status(400).send({
                errors: ["Invalid refresh token"]
            });
        }
    }

    validJWTNeeded(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) {
        if (req.headers['authorization']) {
            try {
                const authorization = req.headers['authorization'].split(' ');
                if (authorization[0] !== 'Bearer') {
                    return res.status(401).send();
                } else {
                    res.locals.jwt = jwt.verify(
                        authorization[1],
                        jwtSecret
                    ) as JWT;
                    next();
                }
            } catch (error) {
                return res.status(403).send(error);
            }
        } else {
            return res.status(401).send();
        }
    }
}

export default new JWTMiddleware();