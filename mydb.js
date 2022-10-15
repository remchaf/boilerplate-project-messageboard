require("dotenv").config;
require("mongodb");
const mongoose = require("mongoose");
const { Schema } = mongoose;
const express = require("express");

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const threadSchema = new Schema({
  board: {
    type: String,
    required: true,
  },
  _id: Schema.Types.ObjectId,
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
  replies: [String],
});

const Thread = mongoose.model("Thread", threadSchema);

module.exports = Thread;
