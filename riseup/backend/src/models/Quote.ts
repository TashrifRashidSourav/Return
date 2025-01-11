import mongoose, { Schema, Document } from 'mongoose';

export interface IQuote extends Document {
  text: string;
  author?: string;
}

const QuoteSchema: Schema = new Schema<IQuote>(
  {
    text: { type: String, required: true },
    author: { type: String, default: "Anonymous" },
  },
  { timestamps: true }
);

const Quote = mongoose.model<IQuote>('Quote', QuoteSchema);
export default Quote;
