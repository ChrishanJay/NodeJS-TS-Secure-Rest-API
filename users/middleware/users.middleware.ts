import express from 'express';
import userService from '../services/users.service';
import debug from 'debug';

const log: debug.IDebugger = debug('app:users-middleware');

class UsersMiddleware {

    async validateSameEmailDoesntExist(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) {
        const user = await userService.getUserByEmail(req.body.email);
        if (user) {
            res.status(400).send({
                error: 'User email already exists',
            });
        } else {
            next();
        }
    }

    async validateSameEmailBelongsToSameUser(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) {
        // TODO: check what's happening here
        //const user = await userService.getUserByEmail(req.body.email);
        //if (user && user.id === req.params.userId) {
        if (res.locals.user._id === req.params.userId) {
            next();
        } else {
            res.status(400).send({
                error: 'User email does not belong to this user',
            });
        }
    }

    validatePatchEmail = async (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) => {
        if (req.body.email) {
            log('Validating email', req.body.email)
            this.validateSameEmailBelongsToSameUser(req, res, next);
        } else {
            next();
        }
    }

    async validateUserExist(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) {
        const user = await userService.readById(req.params.userId);
        if (user) {
            res.locals.user = user;
            next()
        } else {
            res.status(404).send({
                error: `User ${req.params.userId} does not exist`
            });
        }
    }

    async extractUserId(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) {
        req.body.id = req.params.userId;
        next();
    }
    async userCantChangePermission(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) {
        if (
            'permissionFlags' in req.body &&
            req.body.permissionFlags !== res.locals.user.permissionFlags
        ) {
            res.status(400).send({
                errors: ['User cannot change permission flags'],
            });
        } else {
            next();
        }
    }
}

export default new UsersMiddleware();