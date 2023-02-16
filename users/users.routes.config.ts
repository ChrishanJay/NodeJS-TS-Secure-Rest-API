import { CommonRoutesConfig } from '../common/common.routes.config';
import { PermissionFlag } from '../common/middleware/common.permissionflag.enum';

import UsersController from './controllers/users.controllers';
import UsersMiddleware from './middleware/users.middleware';
import BodyValidationMiddleware from '../common/middleware/body.validation.middleware';
import JWTMiddleware from '../auth/middleware/jwt.middleware';
import PermissionMiddleware from '../common/middleware/common.permission.middleware';

import express from 'express';
import { body } from 'express-validator';

export class UserRoutes extends CommonRoutesConfig {
    constructor(app: express.Application) {
        super(app, 'UserRoutes');
    }

    configureRoutes() {

        this.app
            .route('/users')
            .get(JWTMiddleware.validJWTNeeded,
                PermissionMiddleware.permissionFlagRequired(
                    PermissionFlag.MODERATOR
                ),
                UsersController.listUsers)
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
            .all(
                UsersMiddleware.validateUserExist,
                JWTMiddleware.validJWTNeeded,
                PermissionMiddleware.onlySameUserOrAdminCanDoThisAction
            )
            .get(UsersController.getUserById)
            .delete(UsersController.removeUser);

        this.app
            .put('/users/:userId', [
                JWTMiddleware.validJWTNeeded,
                body('email').isEmail(),
                body('password')
                    .isLength({ min: 6 })
                    .withMessage('Must include password (6+ characters)'),
                body('firstName').isString(),
                body('lastName').isString(),
                body('permissionFlags').isInt(),
                BodyValidationMiddleware.verifyBodyFieldsErrors,
                UsersMiddleware.validateSameEmailBelongsToSameUser,
                UsersMiddleware.userCantChangePermission,
                PermissionMiddleware.onlySameUserOrAdminCanDoThisAction,
                PermissionMiddleware.permissionFlagRequired(
                    PermissionFlag.APPROVED_MEMBER
                ),
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
                UsersMiddleware.userCantChangePermission,
                PermissionMiddleware.permissionFlagRequired(
                    PermissionFlag.APPROVED_MEMBER
                ),
                UsersController.patch
            ]);

        this.app.put('/users/:userId/permissionFlags/:permissionFlags', [
            JWTMiddleware.validJWTNeeded,

            // this should be admin only
            PermissionMiddleware.permissionFlagRequired(
                PermissionFlag.PUBLIC
            ),
            UsersController.updatePermissionFlags
        ]);

        return this.app
    }
}