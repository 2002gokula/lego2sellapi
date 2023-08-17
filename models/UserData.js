const { default: mongoose } = require("mongoose")

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  UserId: String,
  data: Array,
  Mydetails: Array,
  Order: Array,
  Search: String,
  verifytoken: String,
  admin: String,
})

// Define the User model
const UserData = mongoose.model("UserData88", userSchema)
module.exports = UserData
