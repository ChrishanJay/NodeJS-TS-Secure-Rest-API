import { CreateUserDTO } from '../dto/create.user.dto';
import { PatchUserDTO } from '../dto/patch.user.dto';
import { PutUserDTO } from '../dto/put.user.dto';

import shortid from 'shortid';
import debug from 'debug';

const log: debug.IDebugger = debug('app:in-memory-dao')

class UsersDAO {
    users: Array<CreateUserDTO> = [];

    constructor() {
        log('Created new instance of UsersDAO');
    }

    async addUser(user: CreateUserDTO) {
        user.id = shortid.generate();
        this.users.push(user);
        return user.id;
    }

    async getUsers() {
        return this.users;
    }

    async getUserById(userId: string) {
        return this.users.find((user: { id: string }) => user.id === userId);
    }

    async putUserById(userId: string, user: PutUserDTO) {
        const userIndex = this.users.findIndex((user: { id: string }) => user.id === userId);
        this.users.splice(userIndex, 1, user);
        return `${user.id} updated via put`;
    }

    async patchUserById(userId: string, user: PatchUserDTO) {
        const userIndex = this.users.findIndex((user: { id: string }) => user.id === userId);
        let currentUser = this.users[userIndex];

        const allowedPatchFields = [
            'password',
            'firstName',
            'lastName',
            'permissionLevel',
        ];

        for (let field of allowedPatchFields) {
            if (field in user) {
                // @ts-ignore
                currentUser[field] = user[field];
            }
        }

        this.users.splice(userIndex, 1, currentUser);
        return `${user.id} patched`;
    }

    async removeUserById(userId: string) {
        const userIndex = this.users.findIndex((user: { id: string }) => user.id === userId);
        this.users.splice(userIndex, 1);
        return `${userId} removed`;
    }

    async getUserByEmail(email: string) {
        const emailIndex = this.users.findIndex((user: { email: string }) => user.email === email);

        let currentUser = this.users[emailIndex];
        if (currentUser) {
            return currentUser;
        } else {
            return null;
        }
    }
}

export default new UsersDAO();