import mongoose, { Schema } from 'mongoose';

const likeSchema = new Schema(
    {   // A like can be associated with either a video, a tweet, or a comment, but not all three at the same time.
        video: {
            type: Schema.Types.ObjectId,
            ref: "Video"
        },
        tweet: {
            tye: Schema.Types.ObjectId,
            ref: "Tweet"
        },
        comment: {
            type: Schema.Types.ObjectId,
            ref: "Comment"
        },
        likedBy: {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    },
    {
        timestamps: true
    }
);

export const Like = mongoose.model("Like", likeSchema);