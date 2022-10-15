"use strict";
const { Route } = require("express");
const { ObjectId } = require("mongoose");
const Thread = require("../mydb");

const {
  createThread,
  getThreads,
  reportThread,
  deleteThread,
} = require("../handlers.js");

Route.post("/", async function (req, res) {
  const board = req.query.board;
  const { text, delete_password, _id } = req.body;
  const id = _id || ObjectId();

  await createThread(Thread, board, text, delete_password, id);

  res.redirect(302, __dirname + "./views/thread.html");
});

Route.get("/", async function (req, res) {
  const board = req.query.board;

  const result = await getThreads(Thread, board);
  res.json(result);
});

Route.put("/", async function (req, res) {
  const board = req.query.board;
  const { thread_id } = req.body;

  const result = await reportThread(Thread, board, thread_id);
  res.json(result);
});

Route.delete("/", async function (req, res) {
  const board = req.query.board;
  const { thread_id, delete_password } = req.body;

  const result = await deleteThread(Thread, board, thread_id, delete_password);
  res.json(result);
});

module.exports = Route;
