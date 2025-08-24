const mongoose = require("mongoose");

const EquitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  symbol: { type: String, required: true },
  quantity: { type: Number, required: true },
  buyPrice: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model("Equity", EquitySchema);
