"use strict";
const Router = require("express").Router();
const { ObjectId } = require("mongodb");
const Thread = require("../mydb");

const {
  createThread,
  getThreads,
  reportThread,
  deleteThread,
} = require("../handlers.js");

Router.route("/")
  .post(async function (req, res) {
    console.log("Mbayame Ndiaye")
    const {board, text, delete_password, _id } = req.body;
    const id = _id || ObjectId();

    await createThread(Thread, board, text, delete_password, id);

    res.redirect("/b/" + board);
  })
  .get(async function (req, res) {
    const board = req.query.board;

    const result = await getThreads(Thread, board);
    res.json(result);
  })
  .put(async function (req, res) {
    // const board = req.query.board;
    const { board, thread_id } = req.body;

    const result = await reportThread(Thread, board, thread_id);
    res.json(result);
  })
  .delete(async function (req, res) {
    const board = req.query.board;
    const { thread_id, delete_password } = req.body;

    const result = await deleteThread(
      Thread,
      board,
      thread_id,
      delete_password
    );
    res.json(result);
  });

module.exports = Router;
