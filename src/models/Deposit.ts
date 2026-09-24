import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDeposit extends Document {
  userId: mongoose.Types.ObjectId;

  amountPaisa: number;

  method: string;
  transactionReference?: string;

  proofUrl?: string;

  status: "PENDING" | "APPROVED" | "REJECTED";

  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const DepositSchema = new Schema<IDeposit>(
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

    transactionReference: String,

    proofUrl: String,

    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
      index: true,
    },

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

const Deposit: Model<IDeposit> =
  mongoose.models.Deposit ||
  mongoose.model<IDeposit>("Deposit", DepositSchema);

export default Deposit;