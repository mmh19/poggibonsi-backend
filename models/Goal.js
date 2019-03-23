'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let GoalSchema = new Schema({
    match: {
        type: Schema.Types.ObjectId,
        ref: 'Match',
        required: true
    },

    player: {
        type: Schema.Types.ObjectId,
        ref: 'Player',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Goal', GoalSchema);