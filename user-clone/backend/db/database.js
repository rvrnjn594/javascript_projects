const mongoose = require("mongoose");

function connectToDb() {
  mongoose
    .connect(process.env.DB_CONNECT)
    .then(console.log("Connected to Uber-clone database..."))
    .catch((error) => handleError(error));
}

module.exports = connectToDb;
