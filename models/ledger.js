const mongoose = require('mongoose');

const ledgerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

});

module.exports = mongoose.model('Ledger', ledgerSchema);
