'use strict';

exports.init = {
    helloMessage: helloMessage,
    disconnect: disconnect,
    join: join
};

function helloMessage(io, socket) {
    io.sockets.connected[socket.id].emit('message', 'Websockets are connected.');
}

function disconnect(io, socket) {
    socket.on('disconnect', function (data) {
        // console.log('Socket was disconnected');
    })
}

function join(io, socket) {
    socket.on('join', function (id, cb) {
        socket.join(id);
        cb({success: true});
    });
}
