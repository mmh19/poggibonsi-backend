'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let MatchSchema = new Schema({
    isActive: {
        type: Boolean,
        default: true
    },

    redPlayer: {
        type: Schema.Types.ObjectId,
        ref: 'Player',
        required: true
    },

    bluePlayer: {
        type: Schema.Types.ObjectId,
        ref: 'Player',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Match', MatchSchema);