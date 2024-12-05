const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const app = express();

// Importing routes
const userRoutes = require("./routes/user.route");

const connectToDb = require("./db/database");

connectToDb();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/users", userRoutes);

app.get("/", (req, res) => {
  res.send("Hi world");
});

module.exports = app;
