import mongoose, { Schema, Document, Model } from "mongoose";

export type ProfitFrequency =
  | "DAILY"
  | "WEEKLY"
  | "MONTHLY";

export interface IInvestmentPlan extends Document {
  name: string;

  minAmountPaisa: number;
  maxAmountPaisa: number;

  profitRateBps: number;

  frequency: ProfitFrequency;
  durationDays: number;

  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const InvestmentPlanSchema = new Schema<IInvestmentPlan>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    minAmountPaisa: {
      type: Number,
      required: true,
    },

    maxAmountPaisa: {
      type: Number,
      required: true,
    },

    // 200 = 2%
    profitRateBps: {
      type: Number,
      required: true,
    },

    frequency: {
      type: String,
      enum: ["DAILY", "WEEKLY", "MONTHLY"],
      required: true,
    },

    durationDays: {
      type: Number,
      required: true,
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

const InvestmentPlan: Model<IInvestmentPlan> =
  mongoose.models.InvestmentPlan ||
  mongoose.model<IInvestmentPlan>(
    "InvestmentPlan",
    InvestmentPlanSchema
  );

export default InvestmentPlan;