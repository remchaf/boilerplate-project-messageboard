require("dotenv").config;
require("mongodb");
const mongoose = require("mongoose");
const { Schema } = mongoose;
const express = require("express");
const { ObjectId } = express;

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const threadSchema = new Schema({
  _id: mongoose.Types.ObjectId, // or Number or may be String - Or Object simply
  board: {
    type: String,
    required: true,
    // unique: true
  },
  text: String,
  created_on: {
    type: Date,
    default: Date.now,
  },
  bumped_on: {
    type: Date,
    default: Date.now,
  },
  reported: {
    type: Boolean,
    default: false,
  },
  delete_password: String,
  replies: Array,
});

const Thread = mongoose.model("Thread", threadSchema);

module.exports = Thread;