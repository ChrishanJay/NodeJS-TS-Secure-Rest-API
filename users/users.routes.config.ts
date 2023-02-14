import { CommonRoutesConfig } from '../common/common.routes.config';
import UsersController from './controllers/users.controllers';
import UsersMiddleware from './middleware/users.middleware';
import BodyValidationMiddleware from '../common/middleware/body.validation.middleware';
import express from 'express';
import { body } from 'express-validator';

export class UserRoutes extends CommonRoutesConfig {
    constructor(app: express.Application) {
        super(app, 'UserRoutes');
    }

    configureRoutes() {

        this.app
            .route('/user')
            .get(UsersController.listUsers)
            .post(
                body('email').isEmail(),
                body('password')
                    .isLength({ min: 6 })
                    .withMessage('Must include password (6+ characters'),
                BodyValidationMiddleware.verifyBodyFieldsErrors,
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
                body('email').isEmail(),
                body('password')
                    .isLength({ min: 6 })
                    .withMessage('Must include password (6+ characters)'),
                body('firstName').isString(),
                body('lastName').isString(),
                body('permissionFlags').isInt(),
                BodyValidationMiddleware.verifyBodyFieldsErrors,
                UsersMiddleware.validateSameEmailBelongsToSameUser,
                UsersController.put
            ]);

        this.app
            .patch('/users/:userId', [
                body('email').isEmail().optional(),
                body('password')
                    .isLength({ min: 6 })
                    .withMessage('Password must be 6+ characters')
                    .optional(),
                body('firstName').isString().optional(),
                body('lastName').isString().optional(),
                body('permissionFlags').isInt().optional(),
                BodyValidationMiddleware.verifyBodyFieldsErrors,
                UsersMiddleware.validatePatchEmail,
                UsersController.patch
            ]);

        return this.app
    }
}