const mongoose = require("mongoose");

const sauceSchema = mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  manufacturer: { type: String, required: true },
  description: { type: String, required: true },
  mainPepper: { type: String, required: true },
  imageUrl: { type: String, required: true },
  heat: { type: Number, required: true },
  likes: { type: Number, default: 0 },
  usersLiked: { type: [String], default: [String] },
  dislikes: { type: Number, default: 0 },
  usersDisliked: { type: [String], default: [String] },
});

module.exports = mongoose.model("Sauce", sauceSchema);
