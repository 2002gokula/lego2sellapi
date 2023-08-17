const mongoose = require("mongoose")

const Details = new mongoose.Schema({
  title: {
    type: String,
  },
  email: {
    type: String,
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  Telephone: {
    type: String,
  },
  StreetAddress1: {
    type: String,
  },
  termsOfService: {
    type: String,
  },
  StreetAddress2: {
    type: String,
  },
  city: {
    type: String,
  },
  State: {
    type: String,
  },
  Country: {
    type: String,
  },
  Paypalemail: {
    type: String,
  },
  accountNumber: {
    type: String,
  },
  sortCode1: {
    type: String,
  },
  sortCode2: {
    type: String,
  },
  sortCode3: {
    type: String,
  },
  paymentMethod: {
    type: String,
  },
  TermsCheck: {
    type: String,
  },
  Marketingpreferences: {
    type: String,
  },
  Postcode: {
    type: String,
  },
})

Details.virtual("id").get(function () {
  return this._id.toHexString()
})

Details.set("toJSON", {
  virtuals: true,
})

Details.set("toObject", {
  virtuals: true,
})

Details.virtual("userId", {
  ref: "User",
  localField: "userId",
  foreignField: "_id",
  justOne: true,
})

const MyDetails = mongoose.model("MyDetails", Details)

module.exports = MyDetails
