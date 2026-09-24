import mongoose, { Schema, Document, Model } from "mongoose";

export interface IInvestment extends Document {
  userId: mongoose.Types.ObjectId;
  planId: mongoose.Types.ObjectId;

  amountPaisa: number;

  profitRateBps: number;
  frequency: "DAILY" | "WEEKLY" | "MONTHLY";

  startDate: Date;
  endDate: Date;
  nextProfitAt: Date;

  earnedProfitPaisa: number;

  status: "ACTIVE" | "COMPLETED" | "CANCELLED";

  createdAt: Date;
  updatedAt: Date;
}

const InvestmentSchema = new Schema<IInvestment>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    planId: {
      type: Schema.Types.ObjectId,
      ref: "InvestmentPlan",
      required: true,
    },

    amountPaisa: {
      type: Number,
      required: true,
    },

    profitRateBps: {
      type: Number,
      required: true,
    },

    frequency: {
      type: String,
      enum: ["DAILY", "WEEKLY", "MONTHLY"],
      required: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    nextProfitAt: {
      type: Date,
      required: true,
      index: true,
    },

    earnedProfitPaisa: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "COMPLETED", "CANCELLED"],
      default: "ACTIVE",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const Investment: Model<IInvestment> =
  mongoose.models.Investment ||
  mongoose.model<IInvestment>("Investment", InvestmentSchema);

export default Investment;