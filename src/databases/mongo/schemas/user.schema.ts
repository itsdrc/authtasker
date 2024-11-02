import mongoose from "mongoose";
import { validRoles } from "../../../types/user/user-roles.type";
import { UserRequest } from "../../../types/user/user-request.type";

// you will see an error here if properties don't match the type
const schema: { [prop in keyof UserRequest]: object } = {
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
};

const userSchema = new mongoose.Schema<UserRequest>(schema, {
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

export const UserModel = mongoose.model<UserRequest>('user', userSchema);
