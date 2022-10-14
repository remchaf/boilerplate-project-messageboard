const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");
const { ObjectId } = require("mongodb");
const { request } = require("chai");

chai.use(chaiHttp);

function createThread(chai, board, text, delete_password, _id) {
  chai
    .request(server)
    .post("/api/threads/" + board)
    .send({ text, delete_password, _id })
    .end();
}

function replyThread(chai, board, text, delete_password, thread_id) {
  chai
    .request(server)
    .post("/api/reply/" + board)
    .send({
      text,
      thread_id,
      delete_password,
    })
    .end();
}

Mocha.before(function (done) {
  [
    ["board1", 1],
    ["board2", 2],
    ["board3", 3],
    ["board4", 4],
    ["board5", 5],
    ["board6", 6],
    ["board7", 7],
    ["board8", 8],
    ["board9", 9],
    ["board10", 10],
    ["board11", 11],
  ].forEach(function (board) {
    const _id = ObjectId();
    createThread(chai, board[0], "Some random text !", board[1], _id);
    replyThread(chai, board[0], "Just a reply !", 11 + board[1], _id);
    replyThread(chai, board[0], "Just a reply !", 12 + board[1], _id);
    replyThread(chai, board[0], "Just a reply !", 13 + board[1], _id);
    replyThread(chai, board[0], "Just a reply !", 14 + board[1], _id);
  });
  done;
});

describe("Functional Tests", function () {
  it("#1 - You can send a POST request to /api/threads/{board}.", function (done) {
    chai
      .request(server)
      .post("/api/threads/test")
      .send({
        text: "Test_board",
        delete_password: "delete_password",
        _id: ObjectId("629d9d6bdd443a372130c09f"),
      })
      .end(function (err, res) {
        assert.equal(
          res.status,
          302,
          "Response status should be 302 REDIRECTED!"
        );
      });
    done;
  });

  it("Viewing the 10 most recent threads with 3 replies each", function (done) {
    chai
      .request(server)
      .get("/api/threads/test")
      .send()
      .end(function (err, res) {
        assert.equal(res.status, 200, "Response status should be 200 OK!");
        assert.isArray(res.body, "Return should be an Array !");
        assert.isAtMost(
          res.body.length,
          10,
          "Return Array should be 10 most recent threads!"
        );
        assert.property(
          res.body[0],
          "replies",
          "Replies should be property of the return Array!"
        );
        assert.isArray(
          res.body[0].replies,
          "replies property should be an Array!"
        );
        assert.isAtMost(
          res.body[0].replies,
          3,
          "Return's replies property should be 3 most recent replies!"
        );
      });
      done
  });

  it("Reporting a thread", function (done) {
    chai
      .request(server)
      .put({
        thread_id: ObjectId("629d9d6bdd443a372130c09f"),
        board: "test",
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.text, "reported");
      });
  });
});
