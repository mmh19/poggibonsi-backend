'use strict';

const express = require('express');
const api = express.Router();

// Models
const Match = require('../models/Match');
const Player = require('../models/Player');

api.get('/', (req, res) => {
    Match.find({})
        .populate('redPlayer')
        .populate('bluePlayer')
        .exec((err, matches) => {
            if (err) {
                res.status(500).json({
                    'error': 'error during match list generation'
                });
                return;
            }

            res.status(200).json(matches);
        });
});


api.get('/pending', (req, res) => {
    Match.findOne({status: 'PENDING'})
        .populate('redPlayer')
        .populate('bluePlayer')
        .exec((err, pendingMatch) => {

        if (!pendingMatch) {
            res.status(404).json({
                'error': 'no pending matches'
            });

            return;
        }
        
        res.status(200).json(pendingMatch);
    });
});

api.get('/active', (req, res) => {
    Match.findOne({status: 'ACTIVE'})
        .populate('redPlayer')
        .populate('bluePlayer')
        .exec((err, activeMatch) => {
            
        if (!activeMatch) {
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

    let playersPromises = [
        new Promise((res, rej) => {
            Player.findById(bluePlayer, (err, player) => {
                res(player);
            });
        }),
        new Promise((res, rej) => {
            Player.findById(redPlayer, (err, player) => {
                res(player);
            });
        })
    ];

    Promise.all(playersPromises).then(players => {
        let [bluePlayer, redPlayer] = players;

        // TODO: Check if both players are existing

        // Check if there are active matches
        Match.findOne({'status': 'ACTIVE'}, (err, activeMatch) => {
            if (activeMatch) {
                res.status(403).json({
                    'error': 'there is already an active match'
                });
    
                return;
            }
    
            // Init a new match
            let newMatch = new Match({redPlayer, bluePlayer});
            newMatch.save((err, newMatch) => {

                if (err) {
                    res.status(500).json({
                        'error': 'error during match creation'
                    });
    
                    return;
                }
    
                Match.findOne(newMatch)
                    .populate('redPlayer')
                    .populate('bluePlayer')
                    .exec((err, matchToReturn) => {
                        res.status(200).json(matchToReturn);
                });
            });
        });
    });
});

api.put('/:matchId', (req, res) => {
    let matchToUpdate = req.params.matchId;
    
    let {status} = req.body;

    // TODO: check if the player to update is the same logged
    Match.findById(matchToUpdate, (err, matchToUpdate) => {
        if (err) {
            res.status(400).json({
                'error': 'match not valid'
            });

            return;
        }

        if (!matchToUpdate) {
            res.status(404).json({
                'error': 'match not found'
            });

            return;
        }
        
        if (typeof status !== 'undefined') {
            matchToUpdate.status = status;
        }

        matchToUpdate.save(err => {
            if (err) {
                res.status(500).json({
                    'error': 'error during match update'
                });

                return;
            }

            res.status(200).json(matchToUpdate);
        });
    });
});

module.exports = api;