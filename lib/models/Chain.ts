import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IChain extends Document {
  chainId: string;
  name: string;
  nativeCurrency: string;
  createdAt: Date;
  updatedAt: Date;
}

const ChainSchema = new Schema<IChain>(
  {
    chainId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    nativeCurrency: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Chain: Model<IChain> = mongoose.models.Chain || mongoose.model<IChain>('Chain', ChainSchema);

export default Chain;
