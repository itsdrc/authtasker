import mongoose from "mongoose";
import { UserInDb } from "@root/types/user/user-db.type";
import { validRoles } from "@root/types/user/user-roles.type";
import { User } from "@root/types/user/user.type";

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

export const UserModel = mongoose.model<User>('user', userSchema);
