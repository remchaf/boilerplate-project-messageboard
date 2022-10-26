const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");
const { ObjectId } = require("mongodb");
const { request } = require("chai");

chai.use(chaiHttp);

describe("Functional Tests", function () {
  this.timeout(8000);

  this.beforeAll(function (done) {
    chai.request(server).get("/delete").send().end();
    done();
  });

  this.afterAll(function (done) {
    chai.request(server).get("/after_tests").send().end();
    done();
  });

  beforeEach(async () => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    console.log("----------------------");
  });

  it("#1 - Creating a new thread.", function (done) {
    chai
      .request(server)
      .post("/api/threads/test")
      .send({
        text: "Test_board",
        delete_password: "delete_password",
        _id: ObjectId("6350176b1a1a5824674bd54f"),
      })
      .redirects(0)
      .end(function (err, res) {
        assert.equal(
          res.status,
          302,
          "Response status should be 302 REDIRECTED!"
        );
      });
    done();
  });

  it("#2 - Creating a new reply", function (done) {
    chai
      .request(server)
      .post("/api/replies/test")
      .send({
        text: "Ilorem ipsum dolor ..." + Math.floor(Math.random() * 10),
        delete_password: "reply_delete_password",
        thread_id: ObjectId("6350176b1a1a5824674bd64f"),
      })
      .redirects(0)
      .end(function (err, res) {
        assert.equal(res.status, 302);
      });
    done();
  });

  it("#3 - Viewing the 10 most recent threads with 3 replies each", function (done) {
    chai
      .request(server)
      .get("/api/threads/Mbayame")
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
          res.body[0].replies.length,
          3,
          "Return's replies property should be 3 most recent replies!"
        );
      });
    done();
  });

  it("#4 - Viewing a single thread with all replies", function (done) {
    chai
      .request(server)
      .get("/api/replies/Mbayame?thread_id=635388956886cc2b2049c011")
      .send()
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body.replies, "Response should be an Array!");
        assert.notProperty(
          res.body.replies[0],
          "delete_password",
          "delete_password shouldn't be send to the client!"
        );
        assert.notProperty(
          res.body.replies[0],
          "reported",
          "reported shouldn't be send to the client!"
        );
        assert.property(
          res.body.replies[0],
          "_id",
          "_id should be a property of different replies!"
        );
        assert.property(
          res.body.replies[0],
          "text",
          "text should be a property of different replies!"
        );
        assert.property(
          res.body.replies[0],
          "created_on",
          "created_on should be a property of different replies!"
        );
        assert.notProperty(
          res.body,
          "delete_password",
          "delete_password shouldn't be send to the client!"
        );
        assert.notProperty(
          res.body,
          "reported",
          "delete_password shouldn't be send to the client!"
        );
      });
    done();
  });

  it("#5 - Reporting a thread", function (done) {
    chai
      .request(server)
      .put("/api/threads/test")
      .send({
        thread_id: ObjectId("6350176b1a1a5824674bd64e"),
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.text, "reported");
      });
    done();
  });

  it("#6 - Reporting a reply", function (done) {
    chai
      .request(server)
      .put("/api/replies/test")
      .send({
        thread_id: ObjectId("6350176b1a1a5824674bd64e"),
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
      .delete("/api/replies/Mbayame")
      .send({
        thread_id: ObjectId("635388956886cc2b2049c011"),
        reply_id: ObjectId("635388a86886cc2b2049c014"),
        delete_password: "wrong_delete_password",
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.text, "incorrect password");
      });
    done();
  });

  it("#8 - Deleting a thread with the wrong password", function (done) {
    chai
      .request(server)
      .delete("/api/threads/Mbayame")
      .send({
        thread_id: ObjectId("635388956886cc2b2049c011"),
        delete_password: "wrong_thread_delete_password",
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.text, "incorrect password");
      });
    done();
  });

  it("#9 - Deleting a reply with the correct password", function (done) {
    chai
      .request(server)
      .delete("/api/replies/test")
      .send({
        thread_id: ObjectId("6350176b1a1a5824674bd64e"),
        reply_id: "629d9d6bdd443a372130c09c",
        delete_password: "reply_delete_password",
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.text, "success");
      });
    done();
  });

  it("#10 - Deleting a thread with the correct password", function (done) {
    chai
      .request(server)
      .delete("/api/threads/test")
      .send({
        thread_id: ObjectId("6350176b1a1a5824674bd64e"),
        delete_password: "delete_password",
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.text, "success");
      });
    done();
  });
});
