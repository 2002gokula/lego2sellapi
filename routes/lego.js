const router = require("express").Router();
const { findLego, calculatePrice } = require("../controller/lego");

router.post("/find-lego", findLego);
router.post("/calculate-price", calculatePrice);

module.exports = router;
