"use strict";
const mongoose = require("mongoose");

const MongoDBconnect = async () => {
  console.log("MongoURL <--->", process.env.MONGO_URI);
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Mongoose Successfully connected to MongoDB");
  } catch (error) {
    console.error("Mongoose Connection Error:", error);
  }
};

module.exports = MongoDBconnect;
