const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true },
  },
  { timestamps: true } // createdAt & updatedAt
);

// Prevent OverwriteModelError
module.exports = mongoose.models.Alerthistory || mongoose.model("Alerthistory", alertSchema);
