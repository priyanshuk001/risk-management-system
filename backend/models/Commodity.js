const mongoose = require("mongoose");

const commoditySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },   // e.g. Gold
  symbol: { type: String, required: true }, // e.g. XAU
  quantity: { type: Number, required: true },
  buyPrice: { type: Number, required: true },
});

module.exports = mongoose.model("Commodity", commoditySchema);