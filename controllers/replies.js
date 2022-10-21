"use strict";
const Router = require("express").Router();
const Thread = require("../mydb");
const { ObjectId } = require("mongodb");


const {
  createReply,
  getReplies,
  reportReply,
  deleteReply,
} = require("../handlers");

Router.route("/")
  .post(async function (req, res) {
    const {board, text, delete_password, thread_id } = req.body;
    const id = _id || ObjectId();

    await createReply(Thread, text, delete_password, thread_id, id);

    res.redirect("/b/" + board);
  })
  .get(async function (req, res) {
    const { board } = req.query;
    const { thread_id } = req.body;

    const result = await getReplies(Thread, board, thread_id);

    res.json(result);
  })

  .put(async function (req, res) {
    const { board, thread_id, reply_id } = req.body;

    const result = await reportReply(Thread, board, thread_id, reply_id);

    res.json(result);
  })

  .delete(async function (req, res) {
    // const { board } = req.query;
    const { board, thread_id, reply_id, delete_password } = req.body;

    const result = await deleteReply(
      Thread,
      board,
      thread_id,
      reply_id,
      delete_password
    );

    res.json(result);
  });

module.exports = Router;
