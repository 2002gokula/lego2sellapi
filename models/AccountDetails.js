const mongoose = require("mongoose")

const accountDetailsSchema = new mongoose.Schema({
  accountNumber: {
    type: String,
  },
  sortCode: {
    type: String,
  },
  paymentMethod: {
    type: String,
    required: true,
  },
  paypalEmail: {
    type: String,
    required: true,
  },

  // Other account-details fields...
})

accountDetailsSchema.virtual("id").get(function () {
  return this._id.toHexString()
})

accountDetailsSchema.set("toJSON", {
  virtuals: true,
})

accountDetailsSchema.set("toObject", {
  virtuals: true,
})

accountDetailsSchema.virtual("userId", {
  ref: "User",
  localField: "userId",
  foreignField: "_id",
  justOne: true,
})

const AccountDetails = mongoose.model("AccountDetails", accountDetailsSchema)

module.exports = AccountDetails
