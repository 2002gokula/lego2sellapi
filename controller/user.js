const Crypto = require("crypto-js");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { Config } = require("../config");

function generateToken(user) {
  const payload = {
    userId: user._id,
    name: user.name,
    email: user.email,
  };
  const options = {
    expiresIn: "3d", // Token will expire in 1 hour
  };
  const secret = Config.JWTSECRET.SECRET; // You can set this value in your .env file
  return jwt.sign(payload, secret, options);
}

exports.signup = async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    title,
    telephone,
    dateOfBirth,
    streetAddress1,
    streetAddress2,
    townCity,
    county,
    country,
    postCode,
    password,
    confirmPassword,
  } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res
      .status(400)
      .json({ message: "User with this email already exist." });
  }

  if (password !== confirmPassword) {
    return res.status(500).json({ message: "Password doesn't match." });
  }

  const encryptedPassword = Crypto.AES.encrypt(
    password,
    Config.JWTSECRET.SECRET
  ).toString();

  if (encryptedPassword) {
    const user = User.create({
      firstName,
      lastName,
      title,
      telephone,
      dateOfBirth,
      streetAddress1,
      streetAddress2,
      townCity,
      county,
      country,
      postCode,
      email,
      password: encryptedPassword,
    });
    await user
      .then((result) => {
        res.status(200).json({ message: "Registered" });
      })
      .catch((err) => {
        console.error(err);
        res.status(500).json({ message: "something went wrong" });
      });
  } else {
    res.status(500).json({ message: Config.responseCode.error });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(500).json({ error: "Missing credentials" });
  }

  const existingUser = await User.findOne({ email });

  if (!existingUser) {
    return res.status(401).json({ message: "Email not found." });
  }

  const decryptedPassword = Crypto.AES.decrypt(
    existingUser.password,
    Config.JWTSECRET.SECRET
  );

  const originalPassword = decryptedPassword.toString(Crypto.enc.Utf8);
  if (originalPassword !== password) {
    return res.status(401).json({ error: "Incorrect password or email." });
  }

  // creating the token
  const token = generateToken(existingUser);

  res.status(200).json({
    message: Config.responseCode.success,
    data: {
      token,
      existingUser,
    },
  });
};
