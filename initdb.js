const mongoose = require("mongoose");
async function initdb() {
  try {
    mongoose.connect(process.env.mongoURL, { dbname: "kbook" });
    console.log("MongoDB connected");
  } catch (error) {
    console.log("Error in connecting to Mongodb");
  }
}
module.exports = initdb;
