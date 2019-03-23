'use strict';

const express = require('express');
const api = express.Router();

// Models
const Player = require('../models/Player');
const Goal = require('../models/Goal');

api.get('/', (req, res) => {
    Player.find({})
        .lean()
        .exec((err, players) => {

        if (err) {
            res.status(500).json({});
            return;
        }

        let playersPromises = players.map(player => {
            return new Promise((res, rej) => {
                Goal.find({player}, (err, goals) => {
                    player.ranking = goals.length;

                    res(player);
                });
            });
        });

        Promise.all(playersPromises).then(players => {
            res.status(200).json(players);
        });
    });
});

api.get('/:playerId', (req, res) => {
    let playerId = req.params.playerId;

    if (!playerId) {
        res.status(400).json({
            'error': 'playerId is mandatory'
        });

        return;
    }

    Player.findById(playerId)
        .lean()
        .exec((err, player) => {

        if (!player) {
            res.status(404).json({
                'error': 'user not found'
            });
            return;
        }

        Goal.find({player}, (err, goals) => {
            player.ranking = goals.length;
            res.status(200).json(player);
        });

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