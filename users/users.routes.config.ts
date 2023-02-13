import { CommonRoutesConfig } from '../common/common.routes.config';
import UsersController from './controllers/users.controllers';
import UsersMiddleware from './middleware/users.middleware';
import express from 'express';

export class UserRoutes extends CommonRoutesConfig {
    constructor(app: express.Application) {
        super(app, 'UserRoutes');
    }

    configureRoutes() {

        this.app
            .route('/user')
            .get(UsersController.listUsers)
            .post(
                UsersMiddleware.validateRequiredUserBodyFields,
                UsersMiddleware.validateSameEmailDoesntExist,
                UsersController.createUser
            );

        this.app
            .param('userId', UsersMiddleware.extractUserId);

        this.app
            .route('/users/:userId')
            .all(UsersMiddleware.validateUserExist)
            .get(UsersController.getUserById)
            .delete(UsersController.removeUser);

        this.app
            .put('/users/:userId', [
                UsersMiddleware.validateRequiredUserBodyFields,
                UsersMiddleware.validateSameEmailBelongsToSameUser,
                UsersController.put
            ]);

        this.app
            .patch('/users/:userId', [
                UsersMiddleware.validatePatchEmail,
                UsersController.patch
            ]);

        return this.app
    }
}