let mongoose = require('mongoose');

let List = mongoose.Schema({
    title:{ type: String, required: true},
    quantity: Number
});

module.exports = mongoose.model('List', List);