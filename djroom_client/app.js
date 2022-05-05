#!/usr/bin/env node

require('dotenv').config();

const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || 8081;

const YOUTUBE_API_BASE_PATH = process.env.YOUTUBE_API_BASE_PATH;
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

const DJ_ROOM_API_BASE_PATH = process.env.DJ_ROOM_API_BASE_PATH;

const express = require('express');
const request = require('request');
const durationIso8601 = require('duration-iso-8601');

const app = express();

app.use('/common', express.static(__dirname + '/public/common'));
app.use('/room', express.static(__dirname + '/public/room'));
app.use('/', express.static(__dirname + '/public/main'));
app.use(express.json());

app.route('/room/video')
    .get(function (req, res) {
        request(
            `${DJ_ROOM_API_BASE_PATH}/plays-now`,
            {
                json: true
            },
            (err, response, body) => {
                if (err) {
                    return res.status(500).send({message: err});
                }

                res.json({'id': body.videoId, 'startSeconds': body.startPoint / 1000});
            })
    })
    .post(function (req, res) {
        request(
            `${YOUTUBE_API_BASE_PATH}?part=contentDetails&id=${req.body.videoId}&key=${YOUTUBE_API_KEY}`,
            {json: true},
            (err, response, body) => {
                if (err) {
                    return res.status(500).send({message: err});
                }

                let durationSeconds = durationIso8601.convertToSecond(body.items[0].contentDetails.duration);

                request.post(
                    {
                        url: `${DJ_ROOM_API_BASE_PATH}/post-video`,
                        json: {
                            videoId: req.body.videoId,
                            duration: durationSeconds
                        },
                    },
                    (err, response, body) => {
                        if (err) {
                            return res.status(500).send({message: err});
                        }
                        return res.send(body);
                    }
                )
            }
        );
    });

app.get('room')

app.listen(PORT, HOST, 1, () => {
    console.log(`Host: ${HOST}`);
    console.log(`Port: ${PORT}`);
});
