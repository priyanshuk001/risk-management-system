const mongoose = require("mongoose");

const cryptoSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },   // e.g. Bitcoin
  symbol: { type: String, required: true }, // e.g. BTC
  quantity: { type: Number, required: true },
  buyPrice: { type: Number, required: true },
});

module.exports = mongoose.model("Crypto", cryptoSchema);