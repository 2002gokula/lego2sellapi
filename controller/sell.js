const Config = require("../config")
const AccountDetails = require("../models/AccountDetails")

exports.sellItem = async (req, res) => {
  const { userId, accountNumber, sortCode, paymentMethod, paypalEmail } =
    req.body
  try {
    await AccountDetails.create({
      accountNumber,
      sortCode,
      paymentMethod,
      paypalEmail,
      userId,
    }).then((details) => {
      res.json({ message: "SUCCESS", body: details })
    })
  } catch (err) {
    console.log(err.message)
    res.json({ message: "ERROR", body: err })
  }
}

exports.getAccountDetails = async (req, res) => {
  const { userId } = req.params
  try {
    User.findByPk(userId, { include: AccountDetails })
      .then((user) => {
        const accountDetails = user.AccountDetails
        res.json({ message: "SUCCESS", body: accountDetails })
      })
      .catch((error) => {
        console.log("Error:", error)
        res.json({ message: "ERROR", body: err.message })
      })
  } catch (err) {
    console.log(err.message)
    res.json({ message: "ERROR", body: err.message })
  }
}
