const Alert = require("../models/Alerthistory");

// ✅ Add new alert
exports.addAlert = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    const alert = new Alert({
      userId: req.user.id,
      message,
    });

    await alert.save();
    res.status(201).json(alert);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Get all alerts for logged-in user
exports.getAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(alerts);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
