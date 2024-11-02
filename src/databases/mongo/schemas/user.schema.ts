import mongoose from "mongoose";
import { validRoles } from "../../../types/roles.type";
import { UserCreationData } from "../../../types/create-user-data.type";

const schema: { [prop in keyof UserCreationData]: object } = {
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

const userSchema = new mongoose.Schema(schema, {
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

export const UserModel = mongoose.model('user', userSchema);