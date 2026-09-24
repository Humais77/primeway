import mongoose, { Schema, Document, Model } from "mongoose";

export type UserRole = "USER" | "ADMIN";

export interface IUser extends Document {
  fullName: string;
  username: string;
  email: string;
  passwordHash: string;

  role: UserRole;

  referralCode: string;
  referredBy?: mongoose.Types.ObjectId | null;

  balancePaisa: number;
  totalInvestmentPaisa: number;
  totalProfitPaisa: number;
  totalReferralPaisa: number;
  totalWithdrawnPaisa: number;

  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    passwordHash: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["USER", "ADMIN"],
      default: "USER",
    },

    referralCode: {
      type: String,
      required: true,
      unique: true,
    },

    referredBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    balancePaisa: {
      type: Number,
      default: 0,
    },

    totalInvestmentPaisa: {
      type: Number,
      default: 0,
    },

    totalProfitPaisa: {
      type: Number,
      default: 0,
    },

    totalReferralPaisa: {
      type: Number,
      default: 0,
    },

    totalWithdrawnPaisa: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const User: Model<IUser> =
  mongoose.models.User ||
  mongoose.model<IUser>("User", UserSchema);

export default User;