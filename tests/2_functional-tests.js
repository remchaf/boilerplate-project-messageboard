const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");
const { ObjectId } = require("mongodb");
const { request } = require("chai");
const Mocha = require("mocha");

chai.use(chaiHttp);

function createThread(chai, board, text, delete_password) {
  chai
    .request(server)
    .post("/api/threads/" + board)
    .send({ text, delete_password })
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

// Mocha.before(function (done) {
//   [
//     ["board1", 1],
//     ["board2", 2],
//     ["board3", 3],
//     ["board4", 4],
//     ["board5", 5],
//     ["board6", 6],
//     ["board7", 7],
//     ["board8", 8],
//     ["board9", 9],
//     ["board10", 10],
//     ["board11", 11],
//   ].forEach(function (board) {
//     const _id = ObjectId();
//     createThread(chai, board[0], "Some random text !", board[1], _id);
//     replyThread(chai, board[0], "Just a reply !", 11 + board[1], _id);
//     replyThread(chai, board[0], "Just a reply !", 12 + board[1], _id);
//     replyThread(chai, board[0], "Just a reply !", 13 + board[1], _id);
//     replyThread(chai, board[0], "Just a reply !", 14 + board[1], _id);
//   });
//   done();
// });

describe("Functional Tests", function () {
  // it("#1 - Creating a new thread.", function (done) {
  //   chai
  //     .request(server)
  //     .post("/api/threads/test")
  //     .send({
  //       text: "Test_board",
  //       delete_password: "delete_password",
  //       _id: ObjectId("6350176b1a1a5824674bd54f"),
  //     })
  //     .end(function (err, res) {
  //       assert.equal(
  //         res.status,
  //         200,
  //         "Response status should be 302 REDIRECTED!"
  //       );
  //     });
  //   done();
  // });

  // it("#2 - Viewing the 10 most recent threads with 3 replies each", function (done) {
  //   chai
  //     .request(server)
  //     .get("/api/threads/test")
  //     .send()
  //     .end(function (err, res) {
  //       console.log(res.body[0].replies);
  //       assert.equal(res.status, 200, "Response status should be 200 OK!");
  //       assert.isArray(res.body, "Return should be an Array !");
  //       assert.isAtMost(
  //         res.body.length,
  //         10,
  //         "Return Array should be 10 most recent threads!"
  //       );
  //       assert.property(
  //         res.body[0],
  //         "replies",
  //         "Replies should be property of the return Array!"
  //       );
  //       assert.isArray(
  //         res.body[0].replies,
  //         "replies property should be an Array!"
  //       );
  //       assert.isAtMost(
  //         res.body[0].replies.length,
  //         3,
  //         "Return's replies property should be 3 most recent replies!"
  //       );
  //     });
  //   done();
  // });

  // it("@3 - Reporting a thread", function (done) {
  //   chai
  //     .request(server)
  //     .put("/api/threads/test")
  //     .send({
  //       thread_id: ObjectId("6350176b1a1a5824674bd54f"),
  //       board: "test",
  //     })

  //     .end(function (err, res) {
  //       assert.equal(res.status, 200);
  //       assert.equal(res.text, "reported");
  //     });
  //   done()
  // });

  it("#4 - Creating a new reply", function (done) {
    chai
      .request(server)
      .post("/api/replies/test")
      .send({
        text: "Ilorem ipsum dolor ...",
        delete_password: "reply_delete_password",
        thread_id: ObjectId("6350176b1a1a5824674bd54f"),
        _id: "629d9d6bdd443a372130c09c",
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
      });
    done();
  });

  it("#5 - Viewing a single thread with all replies", function (done) {
    chai
      .request(server)
      .get("/api/replies/test?thread_id=6350176b1a1a5824674bd54f")
      .send()
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body, "Response should be an Array!");
        assert.notProperty(
          res.body[0],
          "delete_password",
          "delete_password shouldn't be send to the client!"
        );
        assert.notProperty(
          res.body[0],
          "reported",
          "reported shouldn't be send to the client!"
        );
        assert.property(
          res.body[0],
          "_id",
          "_id should be a property of different replies!"
        );
        assert.property(
          res.body[0],
          "text",
          "text should be a property of different replies!"
        );
        assert.property(
          res.body[0],
          "created_on",
          "created_on should be a property of different replies!"
        );
      });
    done();
  });

  it("#6 - Reporting a reply", function (done) {
    chai
      .request(server)
      .put("/api/replies/test")
      .send({
        thread_id: ObjectId("6350176b1a1a5824674bd54f"),
        reply_id: ObjectId("629d9d6bdd443a372130c09c"),
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.text, "reported");
      });
    done();
  });

  it("#7 - Deleting a reply with the incorrect password", function (done) {
    chai
      .request(server)
      .delete("/api/replies/test")
      .send({
        thread_id: ObjectId("6350176b1a1a5824674bd54f"),
        reply_id: ObjectId("629d9d6bdd443a372130c09c"),
        delete_password: "wrong_delete_password",
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.text, "incorrect password");
      });
    done()
  });

  it("#8 - Deleting a reply with the correct password", function (done) {
    chai
      .request(server)
      .delete("/api/replies/test")
      .send({
        thread_id: ObjectId("6350176b1a1a5824674bd54f"),
        reply_id: "629d9d6bdd443a372130c09c",
        delete_password: "reply_delete_password",
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.text, "success");
      });
    done()
  });

  // it("#9 - Deleting a thread with the wrong password", function (done) {
  //   chai
  //     .request(server)
  //     .delete("/api/threads/test")
  //     .send({
  //       thread_id: ObjectId("6350176b1a1a5824674bd54f"),
  //       delete_password: "wrong_thread_delete_password",
  //     })
  //     .end(function (err, res) {
  //       assert.equal(res.status, 200);
  //       assert.equal(res.text, "incorrect password");
  //     });
  //   done()
  // });

  // it("#10 - Deleting a thread with the correct password", function (done) {
  //   chai
  //     .request(server)
  //     .delete("/api/threads/test")
  //     .send({
  //       thread_id: ObjectId("6350176b1a1a5824674bd54f"),
  //       delete_password: "delete_password",
  //     })
  //     .end(function (err, res) {
  //       if(err) console.log(err)
  //       console.log(res.text)
  //       assert.equal(res.status, 200);
  //       assert.equal(res.text, "success");
  //     });
  //     done()
  // });
});
