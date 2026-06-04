require("dotenv").config();
const mongoose = require("mongoose");
const MONGO_URL = process.env.MONGODB_URL;

const Databaseconnection = async () => {
  try {
    const connect = await mongoose.connect(MONGO_URL);
    if (connect) {
      console.log("database connection successfully");
    } else {
      console.log("database conection faild");
    }
  } catch (error) {
    console.log(error);
  }
};
module.exports = Databaseconnection