import mongoose, { Schema, Document, Model } from "mongoose";

export interface IReferral extends Document {
  referrerId: mongoose.Types.ObjectId;
  referredUserId: mongoose.Types.ObjectId;

  level: 1 | 2;

  createdAt: Date;
}

const ReferralSchema = new Schema<IReferral>(
  {
    referrerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    referredUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    level: {
      type: Number,
      enum: [1, 2],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Referral: Model<IReferral> =
  mongoose.models.Referral ||
  mongoose.model<IReferral>("Referral", ReferralSchema);

export default Referral;