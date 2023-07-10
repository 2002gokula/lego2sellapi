const Get_Quote2 = require("../controllers/order.controller")

const express = require("express")
const verifyToken = require("../middleware/jwt")
const router = express.Router()

// router.post("/:gigId", verifyToken, createOrder);
// router.get("/", verifyToken, getOrders)
router.post("/get_Quote/:id", verifyToken, Get_Quote2)

// router.put("/", verifyToken, confirm)
// router.post("/create-payment-intent/:id", verifyToken, get_Quote)
module.exports = router
