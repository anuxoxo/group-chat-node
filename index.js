const http = require('http');
const express = require('express');
const path = require('path');
const socketIO = require('socket.io');

const INDEX = 'public/index.html';
const PORT = process.env.PORT || 3000;
const app = express();

app.use('/public', express.static('public'));

const server = app
    .use((req, res) => res.sendFile(INDEX, { root: __dirname }))
    .listen(PORT, () => console.log(`Listening on ${PORT}`));

const io = socketIO(server);

const users = {};

io.on('connection', socket => {
    // If any new user joins, let other users connected to the server know!
    socket.on('new-user-joined', name => {
        users[socket.id] = name;
        socket.broadcast.emit('user-joined', name);
    });

    // If someone sends a message, broadcast it to other people
    socket.on('send', message => {
        socket.broadcast.emit('receive', { message: message, name: users[socket.id] })
    });

    // If someone leaves the chat, let others know 
    socket.on('disconnect', message => {
        socket.broadcast.emit('left', users[socket.id]);
        delete users[socket.id];
    });


});

// app.listen(PORT, () => console.log(`Listening on ${PORT}`));