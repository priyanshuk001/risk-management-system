const mongoose = require("mongoose");

const bondSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },   // Bond name
  quantity: { type: Number, required: true },
  buyPrice: { type: Number, required: true },
  couponRate: { type: Number },
  maturityDate: { type: Date },
});

module.exports = mongoose.model("Bond", bondSchema);