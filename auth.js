'use strict';

const express = require('express');
const app = express();

// Models
const Player = require('./models/Player');

app.get('/', (req, res) => {
    res.status(200).json("This is the #MMH19!");
});

app.post('/signup', (req, res) => {
    let {firstName, lastName, email, image} = req.body;

    // TODO: improve validation
    if (!(firstName && lastName)) {
        res.status(400).json({
            'error': 'both firstName and lastName are mandatory'
        });
        return;
    }

    let newPlayer = new Player({firstName, lastName, email});
    newPlayer.save(err => {
        if (err) {
            res.status(500).json({
                'error': 'error during player creation'
            });
        }

        res.status(200).json(newPlayer);
    });
});

module.exports = app;