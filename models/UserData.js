const { default: mongoose } = require("mongoose")

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  UserId: String,
  data: Array,
  Mydetails: Array,
  Order: Array,
  Search: String,
})

// Define the User model
const UserData = mongoose.model("UserData2", userSchema)
module.exports = UserData
