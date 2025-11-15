import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IFamily extends Document {
  familyId: string;
  baseAsset: string;
  canonicalTokenId: mongoose.Types.ObjectId | null;
  name: string;
  description: string;
  imageUrl: string;
  totalVariants: number;
  chains: string[];
  createdAt: Date;
  updatedAt: Date;
}

const FamilySchema = new Schema<IFamily>(
  {
    familyId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    baseAsset: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    canonicalTokenId: {
      type: Schema.Types.ObjectId,
      ref: 'Token',
      default: null,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
      default: '/tokens/default.png',
    },
    totalVariants: {
      type: Number,
      required: true,
      default: 0,
    },
    chains: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Family: Model<IFamily> = mongoose.models.Family || mongoose.model<IFamily>('Family', FamilySchema);

export default Family;
