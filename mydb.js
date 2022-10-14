require("mongodb");
const mongoose = require("mongodb");
const { Schema } = mongoose

const board = new Schema({
    board : {
        type: "String",
        required: true
    },
    
})