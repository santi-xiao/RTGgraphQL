const mongoose = require("mongoose");

const PlayerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    trim: true,
  },
  wins: {
    type: Number,
    default: 0,
  },
  groups: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  created: {
    type: Date,
    default: Date.now(),
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = mongoose.model("Player", PlayerSchema);
