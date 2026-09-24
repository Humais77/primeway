import mongoose, { Schema, Document, Model } from "mongoose";

export interface IWithdrawal extends Document {
  userId: mongoose.Types.ObjectId;

  amountPaisa: number;

  method: string;

  accountDetails: Record<string, string>;

  status: "PENDING" | "APPROVED" | "REJECTED";

  rejectionReason?: string;

  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const WithdrawalSchema = new Schema<IWithdrawal>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    amountPaisa: {
      type: Number,
      required: true,
    },

    method: {
      type: String,
      required: true,
    },

    accountDetails: {
      type: Map,
      of: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
      index: true,
    },

    rejectionReason: String,

    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    reviewedAt: Date,
  },
  {
    timestamps: true,
  }
);

const Withdrawal: Model<IWithdrawal> =
  mongoose.models.Withdrawal ||
  mongoose.model<IWithdrawal>("Withdrawal", WithdrawalSchema);

export default Withdrawal;