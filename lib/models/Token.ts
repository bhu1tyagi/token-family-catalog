import mongoose, { Schema, Document, Model } from 'mongoose';

export enum TokenType {
  CANONICAL = 'CANONICAL',
  WRAPPED = 'WRAPPED',
  BRIDGED = 'BRIDGED',
  DERIVATIVE = 'DERIVATIVE',
  SYNTHETIC = 'SYNTHETIC',
}

export enum RelationType {
  WRAPS = 'WRAPS',
  WRAPPED_BY = 'WRAPPED_BY',
  BRIDGES_TO = 'BRIDGES_TO',
  BRIDGED_FROM = 'BRIDGED_FROM',
  DERIVES_FROM = 'DERIVES_FROM',
  DERIVATIVE_OF = 'DERIVATIVE_OF',
}

export interface IRelationship {
  type: RelationType;
  targetTokenId: mongoose.Types.ObjectId;
}

export interface IMetadata {
  isCanonical: boolean;
  bridgeProtocol?: string;
  wrappingProtocol?: string;
}

export interface IToken extends Document {
  symbol: string;
  name: string;
  chain: string;
  contractAddress: string;
  decimals: number;
  familyId: string;
  baseAsset: string;
  type: TokenType;
  imageUrl: string;
  relationships: IRelationship[];
  metadata: IMetadata;
  createdAt: Date;
  updatedAt: Date;
}

const RelationshipSchema = new Schema<IRelationship>({
  type: {
    type: String,
    enum: Object.values(RelationType),
    required: true,
  },
  targetTokenId: {
    type: Schema.Types.ObjectId,
    ref: 'Token',
    required: true,
  },
}, { _id: false });

const MetadataSchema = new Schema<IMetadata>({
  isCanonical: {
    type: Boolean,
    required: true,
    default: false,
  },
  bridgeProtocol: {
    type: String,
    required: false,
  },
  wrappingProtocol: {
    type: String,
    required: false,
  },
}, { _id: false });

const TokenSchema = new Schema<IToken>(
  {
    symbol: {
      type: String,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    chain: {
      type: String,
      required: true,
      index: true,
    },
    contractAddress: {
      type: String,
      required: true,
    },
    decimals: {
      type: Number,
      required: true,
    },
    familyId: {
      type: String,
      required: true,
      index: true,
    },
    baseAsset: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(TokenType),
      required: true,
      index: true,
    },
    imageUrl: {
      type: String,
      required: true,
      default: '/tokens/default.png',
    },
    relationships: {
      type: [RelationshipSchema],
      default: [],
    },
    metadata: {
      type: MetadataSchema,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for unique chain + contract address combination
TokenSchema.index({ chain: 1, contractAddress: 1 }, { unique: true });

// Index for family queries
TokenSchema.index({ familyId: 1, type: 1 });

const Token: Model<IToken> = mongoose.models.Token || mongoose.model<IToken>('Token', TokenSchema);

export default Token;
