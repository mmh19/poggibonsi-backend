'use strict';

const express = require('express');
const api = express.Router();

// Models
const Match = require('../models/Match');
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
            return new Promise((outRes, outRej) => {

                let playerPromises = [
                    new Promise((res, rej) => {
                        Goal.find({player}, (err, goals) => {
                            res(goals.length);
                        });
                    }),
                    new Promise((res, rej) => {
                        Match.find({$or: [{bluePlayer: player}, {redPlayer: player}]}, (err, matches) => {
                            res(matches.length);
                        });
                    })
                ];

                Promise.all(playerPromises).then(data => {
                    let [goals, matches] = data;
                    player.stats = {
                        matches,
                        goals,
                        ranking: matches ? goals / matches : 0
                    };

                    outRes(player);
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
                'error': 'player not valid'
            });

            return;
        }

        if (!playerToUpdate) {
            res.status(404).json({
                'error': 'player not found'
            });

            return;
        }

        if (typeof available !== 'undefined') {
            playerToUpdate.available = available;
        }

        if (typeof firstName !== 'undefined') {
            playerToUpdate.firstName = firstName;
        }

        if (typeof lastName !== 'undefined') {
            playerToUpdate.lastName = lastName;
        }

        if (typeof email !== 'undefined') {
            playerToUpdate.email = email;
        }

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