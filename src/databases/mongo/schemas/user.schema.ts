import mongoose from "mongoose";
import { UserInDb } from "@root/types/user/user-db.type";
import { validRoles } from "@root/types/user/user-roles.type";
import { IUser } from "@root/interfaces/user/user.interface";
import { EventManager } from "@root/events/eventManager";
import { SystemLoggerService } from "@root/services/system-logger.service";

// you will see an error here if properties don't match the type
const schema: UserInDb = {
    name: {
        type: String,
        required: true,
        unique: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    },

    role: {
        type: String,
        required: true,
        enum: validRoles
    },

    emailValidated: {
        type: Boolean,
        default: false,
    }
};

const userSchema = new mongoose.Schema<IUser>(schema, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        versionKey: false,
        transform: function (doc, ret, options) {
            delete ret._id;
            delete ret.password;
            return ret;
        }
    }
});

userSchema.post('findOne', (doc) => {
    if (doc) {
        EventManager.emit('mongoose.userModel.findOne', doc.name);
    }
});

userSchema.post('save', (doc) => {
    if (doc) {
        EventManager.emit('mongoose.userModel.save', doc.name);
    }
});

userSchema.post('findOneAndUpdate', (doc) => {
    if (doc) {
        EventManager.emit('mongoose.userModel.findOneAndUpdate', doc.name);
    }
});

userSchema.post('findOneAndDelete', (doc) => {
    if (doc) {
        EventManager.emit('mongoose.userModel.deleteOne', doc.name);
    }
});

export const UserModel = mongoose.model<IUser>('user', userSchema);
SystemLoggerService.info('User model loaded');
