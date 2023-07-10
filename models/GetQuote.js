const mongoose = require("mongoose")

const accountDetailsSchema = new mongoose.Schema({
  // accountNumber: {
  //   type: String,
  // },
  // sortCode: {
  //   type: String,
  // },
  // paymentMethod: {
  //   type: String,
  //   required: true,
  // },
  SetCondition: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  ifSetcondition: {
    type: Boolean,
    required: true,
  },

  // Other account-details fields...
})

const GetQuote = mongoose.model("GetQuote", accountDetailsSchema)

module.exports = GetQuote
