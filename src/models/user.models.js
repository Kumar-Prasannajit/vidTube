import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        fullname: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        avatar: {
            type: String, //cloudinary url
            required: true
        },
        coverImage: {
            type: String, //cloudinary url
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Video'
            }
        ],
        password: {
            type: String,
            required: [true, 'Password is required']
        },
        refreshToken: {
            type: String,
        }
    },
    {
        timestamps: true
    }
)

//hash password before saving
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;

    this.password = await bcrypt.hash(this.password, 10);
});

//generate access token
userSchema.methods.generateAccessToken = function () {
    const payLoad = {
        userId: this._id,
        username: this.username,
        email: this.email,
        fullname: this.fullname,
        avatar: this.avatar
    }

    return jwt.sign(payLoad, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '25m' });
}

//generate refresh token
userSchema.methods.generateRefreshToken = function () {
    const payLoad = {
        userId: this._id
    }

    return jwt.sign(payLoad, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '10d' });
}

export const User = mongoose.model('User', userSchema);