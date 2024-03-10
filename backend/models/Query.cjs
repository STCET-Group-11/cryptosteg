const mongoose = require('mongoose');

const querySchema = new mongoose.Schema({
  content: String,
  sender: String,
  timestamp: { type: Date, default: Date.now },
});

const Query = mongoose.model('Query', querySchema);

module.exports = Query;