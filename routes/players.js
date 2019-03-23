'use strict';

const express = require('express');
const api = express.Router();

// Models
const Player = require('../models/Player');

api.get('/', (req, res) => {
    Player.find({}, (err, players) => {
        if (err) {
            res.status(500).json({});
            return;
        }

        res.status(200).json(players);
    });
});

api.put('/:playerId', (req, res) => {
    let playerToUpdate = req.params.playerId;
    
    let {firstName, lastName, email, available} = req.body;

    // TODO: check if the player to update is the same logged
    Player.findById(playerToUpdate, (err, playerToUpdate) => {
        if (err) {
            res.status(400).json({
                'error': 'user not valid'
            });

            return;
        }

        playerToUpdate.available = available || playerToUpdate.available;
        playerToUpdate.firstName = firstName || playerToUpdate.firstName;
        playerToUpdate.lastName  = lastName  || playerToUpdate.lastName;
        playerToUpdate.email     = email     || playerToUpdate.email;

        playerToUpdate.save(err => {
            if (err) {
                res.status(500).json({
                    'error': 'error during user update'
                });

                return;
            }

            res.status(200).json(playerToUpdate);
        });
    });
});

module.exports = api;