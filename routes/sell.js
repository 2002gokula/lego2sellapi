const router = require("express").Router();
const { sellItem, getAccountDetails } = require("../controller/sell");

router.post("/sell-item", sellItem);
router.get("/getDetails/:userId", getAccountDetails)

module.exports = router;
