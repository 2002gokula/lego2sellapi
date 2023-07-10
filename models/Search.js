const { default: mongoose } = require("mongoose")

const userSchema = new mongoose.Schema({
  Search: Number,
})

// Define the User model
const SearchItem = mongoose.model("SearchItem", userSchema)
module.exports = SearchItem
