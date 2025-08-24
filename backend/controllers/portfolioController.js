const Bond = require("../models/Bond");
const Commodity = require("../models/Commodity");
const Crypto = require("../models/Crypto");
const Equity = require("../models/Equity");


// Helper fn: correct model choose karo
function getModel(type) {
  switch (type) {
    case "equity":
      return Equity;
    case "crypto":
      return Crypto;
    case "commodity":
      return Commodity;
    case "bond":
      return Bond;
    default:
      throw new Error("Invalid asset type");
  }
}

// Add asset
exports.add_asset = async (req, res) => {
  const userId = req.user.id;

  try {
    const { type, name, symbol, quantity, buyPrice, couponRate, maturityDate, date } = req.body;

    // Choose model
    const Model = getModel(type);

    if (type === "Bond") {
      if (!name || !quantity || !buyPrice || !couponRate || !maturityDate) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const newBond = new Model({
        userId,
        name,
        quantity,
        buyPrice,
        couponRate,
        maturityDate,
        date: date ? new Date(date) : new Date(),
      });

      await newBond.save();
      return res.status(201).json(newBond);
    } else {
      if (!name || !quantity || !buyPrice || !symbol) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const newAsset = new Model({
        userId,
        name,
        symbol,
        quantity,
        buyPrice,
        date: date ? new Date(date) : new Date(),
      });

      await newAsset.save();
      return res.status(201).json(newAsset);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ✅ Update asset
exports.update_asset = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;  // asset ID from URL
  const { type, ...updateFields } = req.body;

  try {
    const Model = getModel(type);

    const updatedAsset = await Model.findOneAndUpdate(
      { _id: id, userId },
      updateFields,
      { new: true } // return updated doc
    );

    if (!updatedAsset) {
      return res.status(404).json({ message: "Asset not found" });
    }

    res.status(200).json(updatedAsset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};


// ✅ Delete asset
exports.delete_asset = async (req, res) => {
  try {
    const assetId = req.params.id;
    const userId = req.user.id;
    const { type } = req.body; // Pass asset type in request body (equity, bond, etc.)

    const Model = getModel(type);
    if (!Model) {
      return res.status(400).json({ message: "Invalid asset type" });
    }

    const asset = await Model.findOneAndDelete({ _id: assetId, userId });
    if (!asset) {
      return res.status(404).json({ message: "Asset not found" });
    }

    res.status(200).json({ message: "Asset deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


// ✅ Get all assets of a type
exports.get_all = async (req, res) => {
  try {
    const userId = req.user.id;

    const equities = await Equity.find({ userId });
    const bonds = await Bond.find({ userId });
    const cryptos = await Crypto.find({ userId });
    const commodities = await Commodity.find({ userId });

    res.status(200).json({
      success: true,
      assets: {
        equities,
        bonds,
        cryptos,
        commodities
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};


