const userModel = require("../models/user.model");
const userService = require("../services/user.service");
const { validationResult } = require("express-validator");
const blacklistTokenModel = require("../models/blacklistToken.model");

module.exports.registerUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { firstname, lastname, email, password } = req.body;

    if (await userModel.findOne({ email }))
      return res
        .status(401)
        .json({ message: "User already registered with us." });

    const hashedPassword = await userModel.hashedPassword(password);
    const user = await userService.createUser({
      firstname,
      lastname,
      email,
      password: hashedPassword,
    });
    const token = user.generateAuthToken();
    res.status(200).json({ token, user });
  } catch (err) {
    console.log(err);
  }
};

module.exports.loginUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { email, password } = req.body;
  const user = await userModel.findOne({ email }).select("+password");
  console.log(user);
  if (!user)
    return res.status(401).json({ message: "Invalid email or password..." });
  const isMatch = await user.comparePassword(password);
  if (!isMatch)
    return res.status(401).json({ message: "Invalid email or password..." });
  const token = user.generateAuthToken();
  if (await blacklistTokenModel.findOne({ token })) {
    console.log("Token deleted from blacklist model.");
    blacklistTokenModel.deleteOne({ token });
  }
  res.cookie("token", token);
  return res.status(200).json({ token, user });
};

// Also implemented a authMiddleware to set the authorization header or cookie
module.exports.getUserProfile = async (req, res, next) => {
  return res.status(200).json(req.user);
};

module.exports.logoutUser = async (req, res, next) => {
  const token =
    req.cookies.token ||
    req.headers.authorization?.split(" ")[1] ||
    req.headers.authorization?.split(" ")[1];
  if (token) await blacklistTokenModel.create({ token });
  res.clearCookie("token");

  return res.status(200).json({ message: "Logged out successfully." });
};
