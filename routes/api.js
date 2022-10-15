"use strict";
const constrollers = require("../controllers/threads");

module.exports = function (app) {
  app.route("/api/threads/:board");

  app.route("/api/replies/:board");
};
