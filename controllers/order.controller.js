const GetQuote = require("../models/GetQuote")

const Get_Quote2 = async (req, res) => {
  const user = new GetQuote(req.body)

  try {
    await user.save()
    res.send(user)
  } catch (error) {
    res.status(500).send(error)
  }
}
module.exports = Get_Quote2
