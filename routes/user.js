const { signup, login } = require("../controller/user");

const router = require("express").Router();

router.post("/user-register", signup);
router.post("/user-login", login);

module.exports = router;
