const mongoose = require("mongoose");

const bondSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    name: { type: String, required: true },        // Bond name
    symbol: { type: String, required: true },      // Bond identifier/ticker

    quantity: { type: Number, required: true },    // No. of bonds held
    buyPrice: { type: Number, required: true },    // Price per bond at purchase
    faceValue: { type: Number, required: true },   // Nominal value per bond

    couponRate: { type: Number, required: true },  // Annual coupon rate %
    maturityDate: { type: Date, required: true },  // Maturity date
  },
  { timestamps: true }
);

module.exports = mongoose.model("Bond", bondSchema);
