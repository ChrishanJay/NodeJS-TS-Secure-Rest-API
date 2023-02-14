import { CreateUserDTO } from '../dto/create.user.dto';
import { PatchUserDTO } from '../dto/patch.user.dto';
import { PutUserDTO } from '../dto/put.user.dto';

import mongooseService from '../../common/services/mongoose.service';
import shortid from 'shortid';
import debug from 'debug';

const log: debug.IDebugger = debug('app:user-dao')

class UsersDAO {
    Schema = mongooseService.getMongoose().Schema;

    userSchema = new this.Schema({
        _id: String,
        email: String,
        password: { type: String, select: false },
        firstName: String,
        lastName: String,
        permissionFlags: Number
    }, { id: false });

    User = mongooseService.getMongoose().model('Users', this.userSchema);

    constructor() {
        log('Created new instance of UsersDAO');
    }

    async addUser(userFields: CreateUserDTO) {
        const userId = shortid.generate();
        const user = new this.User({
            _id: userId,
            ...userFields,
            permissionFlags: 1,
        });
        await user.save();
        return userId;
    }

    async getUsers(limit = 25, page = 0) {
        return this.User.find()
            .limit(limit)
            .skip(page * limit)
            .exec();
    }

    async getUserById(userId: string) {
        return this.User.findOne({ _id: userId }).exec();
    }

    async updateUserById(
        userId: string,
        userFields: PatchUserDTO | PutUserDTO
    ) {
        const existingUser = await this.User.findOneAndUpdate(
            { _id: userId },
            { $set: userFields },
            { new: true }
        ).exec();

        return existingUser;
    }

    async removeUserById(userId: string) {
        return this.User.deleteOne({ _id: userId }).exec();
    }

    async getUserByEmail(email: string) {
        return this.User.findOne({ email: email }).exec();
    }

    async getUserByEmailWithPassword(email: string) {
        return this.User.findOne({ email: email })
            .select('_id email permissionFlags +password')
            .exec();
    }
}

export default new UsersDAO();