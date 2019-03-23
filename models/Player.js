'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let PlayerSchema = new Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
    },

    available: {
        type: Boolean,
        default: false
    },
    image: {
        type: String,
        required: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Player', PlayerSchema);