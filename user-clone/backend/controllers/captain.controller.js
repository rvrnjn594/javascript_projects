const captainModel = require("../models/captain.model");
const { validationResult } = require("express-validator");
const captainService = require("../services/captain.service");
const blacklistTokenModel = require("../models/blacklistToken.model");

module.exports.registerCaptain = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { firstname, lastname, email, password, vehicle } = req.body;

    if (await captainModel.findOne({ email }))
      return res.status(401).json({
        message: `Captain already registered with us with this ${email}`,
      });

    const hashedPassword = await captainModel.hashedPassword(password);
    const captain = await captainService.createCaptain({
      firstname,
      lastname,
      email,
      password: hashedPassword,
      color: vehicle.color,
      vehicleType: vehicle.vehicleType,
      capacity: vehicle.capacity,
      plate: vehicle.plate,
    });
    const token = await captain.generateAuthToken();

    return res
      .status(200)
      .json({ message: "Registerd the captain successfully", token, captain });
  } catch (err) {
    console.log(err);
    return res
      .status(401)
      .json({ message: "Unauthorized data to process", err: err });
  }
};

module.exports.loginCaptain = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(401).json({
      message: "Error while validating your request to login the captain",
      err: errors,
    });
  }
  const { email, password } = req.body;
  const captain = await captainModel.findOne({ email }).select("+password");
  if (!captain) {
    return res
      .status(401)
      .json({ message: "Please register this user with us." });
  }
  const passwordIsMatch = captain.comparePassword(password);
  if (!passwordIsMatch) {
    return res.status(401).json({ message: "Unautorized access" });
  }
  // generate token for authentication
  const token = captain.generateAuthToken();
  // To do: Check later the blacklist token model
  if (await blacklistTokenModel.findOne({ token })) {
    console.log("Token deleted from blacklist model.");
    blacklistTokenModel.deleteOne({ token });
  }
  // send token as a cookie
  res.cookie("token", token);
  return res
    .status(200)
    .json({ message: "Logged in Successfully", token, captain });
};

module.exports.getCaptainProfile = async (req, res, next) => {
  return res.status(200).json(req.captain);
};

module.exports.logoutCaptain = async (req, res, next) => {
  const token =
    req.cookies.token ||
    req.headers.authorization?.split(" ")[1] ||
    req.headers.authorization?.split(" ")[1];

  if (await blacklistTokenModel.findOne({ token })) {
    console.log("Tryign logout again");
    return res
      .status(200)
      .json({ message: "ALREADY LOGGED OUT THE USER. PLEASE LOGIN AGAIN" });
  }
  if (token) await blacklistTokenModel.create({ token });
  res.clearCookie("token");
  return res.status(200).json({
    message: "Logged out successfully.",
  });
};
