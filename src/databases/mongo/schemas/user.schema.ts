import mongoose from "mongoose";
import { UserInDb } from "@root/types/user/user-db.type";
import { validRoles } from "@root/types/user/user-roles.type";
import { User } from "@root/types/user/user.type";
import { EventManager } from "@root/events/eventManager";

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

const userSchema = new mongoose.Schema<User>(schema, {
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
        EventManager.emit('mongoose.userModel.findOne', doc.id);
    }
});

userSchema.post('save', (doc) => {
    if (doc) {
        EventManager.emit('mongoose.userModel.save', doc.id);
    }
});

userSchema.post('findOneAndUpdate', (doc) => {
    if (doc) {
        EventManager.emit('mongoose.userModel.findOneAndUpdate', doc.id);
    }
});

userSchema.post('findOneAndDelete', (doc) => {
    if (doc) {
        EventManager.emit('mongoose.userModel.deleteOne', doc.id);
    }
});

export const UserModel = mongoose.model<User>('user', userSchema);
