const express = require("express")
const router = express.Router()

const { register, logout } = require("../controllers/auth.controller.js")

router.post("/register", register)
// router.post("/login", login)
router.post("/logout", logout)

module.exports = router
