"use strict";
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");

const apiRoutes = require("./routes/api.js");
const fccTestingRoutes = require("./routes/fcctesting.js");
const runner = require("./test-runner");

// DB connection
const Thread = require("./mydb");

const app = express();

app.use("/public", express.static(process.cwd() + "/public"));

app.use(cors({ origin: "*" })); //For FCC testing purposes only

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Security
app.use(
  helmet.frameguard("SAMEORIGIN"),
  helmet.dnsPrefetchControl(),
  helmet.referrerPolicy({ policy: "same-origin" })
);

// Route to remove test and board documents from the thread-collection
app.get("/delete", async function (req, res) {
  await Thread.deleteOne({ board: "test", _id: "6350176b1a1a5824674bd54f" });
  res.type("text").send("'Test #1' board deleted from Thread collection !");
});

// Setting up the db for testing purpose
app.get("/after_tests", async function (req, res) {
  // Delete the thread created in test #1
  await Thread.findOneAndDelete({ _id: "6350176b1a1a5824674bd54f" });

  // Create thread for test #5 && #10
  const _date1 = new Date();
  try {
    setTimeout(async () => {
      await createTestThread(_date1);
    }, 5000);
  } catch {
    return console.log("Test thread not created ! -> server.js line:51");
  }

  res.type("text").send("Test ready to go !");
});

// Delete fcc-test boards before next test ** To be deleted after
app.get("/fcc", async function (req, res) {
  const result = await Thread.deleteMany({ board: "fcc_test" });
  console.log(result);
  res.type("text").send("OK!");
});

//Sample front-end
app.route("/b/:board/").get(function (req, res) {
  res.sendFile(process.cwd() + "/views/board.html");
});
app.route("/b/:board/:threadid").get(function (req, res) {
  res.sendFile(process.cwd() + "/views/thread.html");
});

//Index page (static HTML)
app.route("/").get(function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

//For FCC testing purposes
fccTestingRoutes(app);

//Routing for API
apiRoutes(app);

//404 Not Found Middleware
app.use(function (req, res, next) {
  res.status(404).type("text").send("Not Found");
});

//Start our server and tests!
const listener = app.listen(process.env.PORT || 3000, function () {
  console.log("Your app is listening on port " + listener.address().port);
  if (process.env.NODE_ENV === "test") {
    console.log("Running Tests...");
    setTimeout(function () {
      try {
        runner.run();
      } catch (e) {
        console.log("Tests are not valid:");
        console.error(e);
      }
    }, 1500);
  }
});

module.exports = app; //for testing

async function createTestThread(_date1) {
  await Thread.replaceOne(
    { _id: "6350176b1a1a5824674bd64e" },
    {
      _id: "6350176b1a1a5824674bd64e",
      board: "test",
      text: " Just some random text [...] ",
      created_on: _date1,
      bumped_on: _date1,
      delete_password: "delete_password",
      reported: false,
      replies: [
        {
          _id: "629d9d6bdd443a372130c09c",
          text: "Ilorem ipsum dolor [...] ",
          created_on: new Date(),
          delete_password: "reply_delete_password",
          reported: false,
        },
      ],
    },
    { upsert: true }
  );

  return "Created !";
}
