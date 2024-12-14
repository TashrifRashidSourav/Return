import mongoose, { Schema, Document } from 'mongoose';

export interface IPost extends Document {
  userId: string;
  text?: string;
  imageUrl?: string;
  likes: string[];
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String },
    imageUrl: { type: String },
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true } // Adds createdAt and updatedAt fields
);

const Post = mongoose.model<IPost>('Post', PostSchema);
export default Post;
