'use strict';

const express = require('express');
const api = express.Router();

// Models
const Match = require('../models/Match');

api.get('/', (req, res) => {
    Match.findOne({'isActive': true}, (err, activeMatch) => {
        if (err) {
            res.status(404).json({
                'error': 'no active matches'
            });

            return;
        } 

        res.status(200).json(activeMatch);
    });
});

api.post('/', (req, res) => {
    let {redPlayer, bluePlayer} = req.body;

    if (!(redPlayer && bluePlayer)) {
        res.status(400).json({
            'error': 'both players id must be given'
        });
        return;
    }

    // TODO: Validate that ids are belonging to actual players

    // Check if there are active matches
    Match.findOne({'isActive': true}, (err, activeMatch) => {
        if (activeMatch) {
            res.status(403).json({
                'error': 'there is already an active match'
            });

            return;
        }

        // Init a new match
        let newMatch = new Match({redPlayer, bluePlayer});
        newMatch.save(err => {
            if (err) {
                res.status(500).json({
                    'error': 'error during match creation'
                });

                return;
            }

            res.status(200).json(newMatch);
        });
    });
});

module.exports = api;