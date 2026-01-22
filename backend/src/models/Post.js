import mongoose from "mongoose";

const postSchema = mongoose.Schema({
    content: { type: String, required: true },
    imageUrl: { type: String, default: "" },
    authorId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'authorType' },
    authorType: { type: String, enum: ["User", "Company"], required: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId }],
    comments: [{
        userId: { type: mongoose.Schema.Types.ObjectId, refPath: 'comments.userType' },
        userType: { type: String, enum: ["User", "Company"] },
        text: { type: String, required: true },
        date: { type: Date, default: Date.now }
    }],
}, { timestamps: true });

const Post = mongoose.model("Post", postSchema);

export default Post;
