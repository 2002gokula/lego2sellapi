const mongoose = require("mongoose")

const accountDetailsSchema = new mongoose.Schema(
  {
    Deliverymethod: {
      type: String,
      required: true,
    },
    Price: {
      type: Number,
    },
    noItems: {
      type: Number,
    },
    Status: {
      type: String,
    },
    offerId: {
      type: Number,
    },
    ProductName: {
      type: String,
    },
    ProductImg: {
      type: String,
    },
    ProductId: {
      type: Number,
    },
    setCondition: {
      type: String,
    },
    timestamp: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
)

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

const Getorder = mongoose.model("GetOrder", accountDetailsSchema)

module.exports = Getorder
