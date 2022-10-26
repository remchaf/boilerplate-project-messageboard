"use strict";
const { ObjectId } = require("mongodb");
const Thread = require("../mydb");
const {
  createThread,
  getThreads,
  reportThread,
  deleteThread,
  createReply,
  getReplies,
  reportReply,
  deleteReply,
} = require("../handlers");

module.exports = function (app) {
  app
    .route("/api/threads/:board")
    .post(async function (req, res) {
      const { board } = req.params;
      const { text, delete_password, _id } = req.body;
      const ID = _id || ObjectId();

      await createThread(Thread, board, text, delete_password, ID);

      // if (_id) {
      //   res.type("text").send("OK");
      //   return;
      // }
      res.redirect(302, "/b/" + board);
    })
    .get(async function (req, res) {
      const { board } = req.params;
      const result = await getThreads(Thread, board);
      res.json(result);
    })
    .put(async function (req, res) {
      const { board } = req.params;
      let { thread_id } = req.body;
      thread_id = thread_id || req.body._id

      const result = await reportThread(Thread, board, thread_id);
      res.type("text").send(result);
    })
    .delete(async function (req, res) {
      const { board } = req.params;
      const { thread_id, delete_password } = req.body;

      const result = await deleteThread(
        Thread,
        board,
        thread_id,
        delete_password
      );
      res.type("text").send(result);
    });

  app
    .route("/api/replies/:board")
    .post(async function (req, res) {
      const { board } = req.params;
      const { text, delete_password, thread_id, _id } = req.body;
      const ID = _id || ObjectId();

      await createReply(Thread, board, thread_id, text, delete_password, ID);

      res.redirect("/b/" + board);
    })
    .get(async function (req, res) {
      const { board } = req.params;
      const { thread_id } = req.query;

      const result = await getReplies(Thread, board, thread_id);

      res.json(result);
    })

    .put(async function (req, res) {
      const { board } = req.params;
      const { thread_id, reply_id } = req.body;

      const result = await reportReply(Thread, board, thread_id, reply_id);

      res.type("text").send(result);
    })

    .delete(async function (req, res) {
      const { board } = req.params;
      const { thread_id, reply_id, delete_password } = req.body;

      const result = await deleteReply(
        Thread,
        board,
        thread_id,
        reply_id,
        delete_password
      );

      res.type("text").send(result);
    });
};
