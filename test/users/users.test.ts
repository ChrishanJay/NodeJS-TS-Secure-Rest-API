import app from '../../app';
import supertest from 'supertest';
import { expect } from 'chai';
import shortid from 'shortid';
import mongoose from 'mongoose';

let firstUserIdTest = '';
const firstUserBody = {
    email: `chrishan.ngf+${shortid.generate()}@gmail.com`,
    password: 'Password1',
}

let accessToken = '';
let refreshToken = '';

const newFirstName = 'John';
const newFirstName2 = 'Paul';
const newLastName2 = 'Frank';

describe('users and auth endpoints', function () {
    let request: supertest.SuperAgentTest;
    before(function () {
        request = supertest.agent(app);
    });
    after(function (done) {
        // shut down the Express.js server, close our MondoDB connection, then tell Mocha we're done:
        app.close(() => {
            mongoose.connection.close(done);
        });
    });

    it('should allow a POST to /users', async function () {
        const response = await request.post('/users').send(firstUserBody);

        expect(response.status).to.equal(201);
        expect(response.body).not.to.be.empty;
        expect(response.body).to.be.an('object');
        expect(response.body.id).to.be.a('string');
        firstUserIdTest = response.body.id;
    });

    it('should allow a POST to /auth', async function () {
        const response = await request.post('/auth').send(firstUserBody);

        expect(response.status).to.equal(201);
        expect(response.body).not.to.be.empty;
        expect(response.body).to.be.an('object');
        expect(response.body.accessToken).to.be.a('string');

        accessToken = response.body.accessToken;
        refreshToken = response.body.refreshToken;
    });

    it('should allow a GET from /user/:userId with an access token', async function () {
        const response = await request
            .get(`/users/${firstUserIdTest}`)
            .set({ Authorization: `Bearer ${accessToken}` })
            .send();

        expect(response.status).to.equal(200);
        expect(response.body).not.to.be.empty;
        expect(response.body).to.be.an('object');
        expect(response.body._id).to.be.a('string');
        expect(response.body._id).to.equal(firstUserIdTest);
        expect(response.body.email).to.equal(firstUserBody.email);
    });

    describe('with a valid access token', function () {
        it('should disallow a GET from /users', async function () {
            const response = await request
                .get('/users')
                .set({ Authorization: `Bearer ${accessToken}` })
                .send();

            expect(response.status).to.equal(403);
        });

        it('should disallow a PATCH to /users/:userId', async function () {
            const response = await request
                .patch(`/users/${firstUserIdTest}`)
                .set({ Authorization: `Bearer ${accessToken}` })
                .send({
                    firstName: newFirstName,
                });

            expect(response.status).to.equal(403);
        });

        it('should disallow a PUT to /users/:userId with an nonexisting ID', async function () {
            const response = await request
                .put('/users/i-do-not-exist')
                .set({ Authorization: `Bearer ${accessToken}` })
                .send({
                    email: firstUserBody.email,
                    password: firstUserBody.password,
                    firstName: "Mark",
                    lastName: "Silva",
                    permissionFlags: 256
                });

            expect(response.status).to.equal(404);
        });

        it('should disallow a PUT to /users/:userId trying to change the permission flags', async function () {
            const response = await request
                .put(`/users/${firstUserIdTest}`)
                .set({ Authorization: `Bearer ${accessToken}` })
                .send({
                    email: firstUserBody.email,
                    password: firstUserBody.password,
                    firstName: "Mark",
                    lastName: "Silva",
                    permissionFlags: 256
                });

            expect(response.status).to.equal(400);
            expect(response.body.errors).to.be.an('array');
            expect(response.body.errors).to.have.length(1);
            expect(response.body.errors[0]).to.equal(
                'User cannot change permission flags'
            );
        });

        it('should allow a PUT to /users/:userId/permissionFlags/1024 (IT_ADMIN) for testing', async function () {
            const response = await request
                .put(`/users/${firstUserIdTest}/permissionFlags/1024`)
                .set({ Authorization: `Bearer ${accessToken}` })
                .send({});

            expect(response.status).to.equal(204);
        });

        describe('with a new set of permission flags', function () {
            it('should allow a POST to /auth/refresh-token', async function () {
                const response = await request
                    .post(`/auth/refresh-token`)
                    .set({ Authorization: `Bearer ${accessToken}` })
                    .send({ refreshToken });

                expect(response.status).to.equal(201);
                expect(response.body).not.to.be.empty;
                expect(response.body).to.be.an('object');
                expect(response.body.accessToken).to.be.a('string');
                accessToken = response.body.accessToken;
                refreshToken = response.body.refreshToken;
            });

            it('should allow a PUT to /users/:userId to change the first and last names', async function () {
                const response = await request
                    .put(`/users/${firstUserIdTest}/`)
                    .set({ Authorization: `Bearer ${accessToken}` })
                    .send({
                        email: firstUserBody.email,
                        password: firstUserBody.password,
                        firstName: newFirstName2,
                        lastName: newLastName2,
                        permissionFlags: 1024
                    });

                expect(response.status).to.equal(204);
            });

            it('should allow a GET from /users/:userId and should have a new name', async function () {
                const response = await request
                    .get(`/users/${firstUserIdTest}`)
                    .set({ Authorization: `Bearer ${accessToken}` })
                    .send();

                expect(response.status).to.equal(200);
                expect(response.body).not.to.be.empty;
                expect(response.body).to.be.an('object');
                expect(response.body._id).to.be.a('string');
                expect(response.body.firstName).to.equal(newFirstName2);
                expect(response.body.lastName).to.equal(newLastName2);
                expect(response.body.email).to.equal(firstUserBody.email);
                expect(response.body._id).to.equal(firstUserIdTest);
            });

            it('should allow a DELETE from /users/:userId', async function () {
                const response = await request
                    .delete(`/users/${firstUserIdTest}`)
                    .set({ Authorization: `Bearer ${accessToken}` })
                    .send();

                expect(response.status).to.equal(204);
            });
        });
    });
});


