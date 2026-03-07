import mongoose, { Schema } from mongoose;

const subscriptionSchema = new Schema(
    {   // subscriber is the user who is subscribing to a channel
        subscriber: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        channel: {               //channel is also a user one to whom 'subscriber' is subscribing to              
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    },{timestamps: true}
);

export const Subscription = mongoose.model('Subscription', subscriptionSchema);