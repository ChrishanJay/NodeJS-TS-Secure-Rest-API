import { CommonRoutesConfig } from '../common/common.routes.config';
import express from 'express';

export class UserRoutes extends CommonRoutesConfig {
    constructor(app: express.Application) {
        super(app, 'UserRoutes');
    }

    configureRoutes() {
        this.app.route('/user')
            .get((req: express.Request, res: express.Response) => {
                res.status(200).send('List of users')
            })
            .post((req: express.Request, res: express.Response) => {
                res.status(201).send('User created')
            })

        this.app.route('/user/:userId')
            .all((req: express.Request, res: express.Response, next: express.NextFunction) => {


                next()
            })
            .get((req: express.Request, res: express.Response) => {
                res.status(200).send('GET request for id ${req.params.userId}')
            })
            .put((req: express.Request, res: express.Response) => {
                res.status(201).send('PUT request for id ${req.params.userId}')
            })
            .patch((req: express.Request, res: express.Response) => {
                res.status(201).send('PATCH request for id ${req.params.userId}')
            })
            .delete((req: express.Request, res: express.Response) => {
                res.status(201).send('DELETE request for id ${req.params.userId}')
            })

        return this.app
    }
}