let mongoose = require('mongoose');
let ObjectId = mongoose.Schema.ObjectId;

let Campaign = mongoose.Schema({
    title:{ type: String, required: true},
    body: String,
    status: String,
    start: { type: Date, required: true},
    open: { type: Number, default: 0},
    clicks: { type: Number, default: 0},
    bounces: { type: Number, default: 0},
    lists: [
        {title: String, type: ObjectId, ref: 'List'}
    ]

});

module.exports = mongoose.model('Campaign', Campaign);