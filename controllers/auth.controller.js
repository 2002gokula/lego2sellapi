const User = require("../models/user.model.js")
const createError = require("../utils/createError.js")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

const register = async (req, res, next) => {
  try {
    const { email, password } = req.body

    const hash = bcrypt.hashSync(password, 5)
    const newUser = new User({
      email,
      password: hash,
    })

    await newUser.save()

    res.status(201).send("User has been created.")
  } catch (err) {
    next(err)
    res.status(500).send("An error occurred while creating the user.")
  }
}

// Assuming you have a route handler for user login
const login = async (reqq, res) => {
  try {
    const user = await User.findOne({ email: req.body.email })

    if (!user) return next(createError(404, "User not found!"))

    const isCorrect = bcrypt.compareSync(req.body.password, user.password)
    if (!isCorrect) return next(createError(400, "Wrong password or username!"))

    const token = jwt.sign(
      {
        email: user.email,
        // isSeller: user.isSeller,
      },
      "2ba8337ba5e7176aac61228413e51173306995f99b126fa812ceaf74c2ed41f8e78a83b1fa4ab8ef63ce9df3ca0be6ebc4d51b4e89beb8e74e356f9aee71e448"
    )

    const { password, ...info } = user._doc
    res
      .cookie("accessToken", token, {
        httpOnly: true,
      })
      .status(200)
      .send(info)
  } catch (err) {
    next(err)
  }
}

const logout = async (req, res) => {
  res
    .clearCookie("accessToken", {
      sameSite: "none",
      secure: true,
    })
    .status(200)
    .send("User has been logged out.")
}

module.exports = { register, logout }
