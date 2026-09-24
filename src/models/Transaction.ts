import mongoose, { Schema, Document, Model } from "mongoose";

export type TransactionType =
  | "DEPOSIT"
  | "WITHDRAWAL"
  | "INVESTMENT"
  | "PROFIT"
  | "REFERRAL_COMMISSION"
  | "REFUND";

export interface ITransaction extends Document {
  userId: mongoose.Types.ObjectId;

  type: TransactionType;

  amountPaisa: number;

  balanceBeforePaisa: number;
  balanceAfterPaisa: number;

  referenceId?: mongoose.Types.ObjectId | null;

  description?: string;

  createdAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: [
        "DEPOSIT",
        "WITHDRAWAL",
        "INVESTMENT",
        "PROFIT",
        "REFERRAL_COMMISSION",
        "REFUND",
      ],
      required: true,
    },

    amountPaisa: {
      type: Number,
      required: true,
    },

    balanceBeforePaisa: {
      type: Number,
      required: true,
    },

    balanceAfterPaisa: {
      type: Number,
      required: true,
    },

    referenceId: {
      type: Schema.Types.ObjectId,
      default: null,
    },

    description: String,
  },
  {
    timestamps: true,
  }
);

const Transaction: Model<ITransaction> =
  mongoose.models.Transaction ||
  mongoose.model<ITransaction>("Transaction", TransactionSchema);

export default Transaction;