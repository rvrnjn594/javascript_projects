const userModel = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const blacklistTokenModel = require("../models/blacklistToken.model");

module.exports.authUser = async (req, res, next) => {
  const token =
    req.cookies.token ||
    req.headers.Authorization?.split(" ")[1] ||
    req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Unauthorized..." });

  //   This logic has to be implemented
  const isBlacklisted = await blacklistTokenModel.findOne({ token: token });
  console.log(isBlacklisted);
  if (isBlacklisted) {
    return res.status(401).json({ message: "Blacklisted token." });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded: ", decoded);
    const user = await userModel.findById(decoded._id);
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};
