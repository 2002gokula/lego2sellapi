// import jwt from "jsonwebtoken"
const jwt = require("jsonwebtoken")
const createError = require("../utils/createError.js")

const verifyToken = (req, res, next) => {
  const token = req.cookies.accessToken
  if (!token) return next(createError(401, "You are not authenticated!"))

  jwt.verify(
    token,
    "2ba8337ba5e7176aac61228413e51173306995f99b126fa812ceaf74c2ed41f8e78a83b1fa4ab8ef63ce9df3ca0be6ebc4d51b4e89beb8e74e356f9aee71e448",
    async (err, payload) => {
      if (err) return next(createError(403, "Token is not valid!"))
      req.email = payload.email
      // req.isSeller = payload.isSeller
      next()
    }
  )
}

module.exports = verifyToken
